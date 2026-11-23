"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { RESOURCES, SETTING_GROUPS, type Field } from "@/lib/adminConfig";
import { createAdminClient } from "@/lib/supabase/server";

function parse(fields: Field[], form: FormData) {
  const row: Record<string, unknown> = {};
  for (const f of fields) {
    const v = form.get(f.name);
    if (f.type === "bool") row[f.name] = form.get(f.name) === "on";
    else if (f.type === "number") row[f.name] = v === null || v === "" ? 0 : Number(v);
    else if (f.type === "list") row[f.name] = String(v ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
    else row[f.name] = v === null ? null : String(v).trim() || null;
  }
  return row;
}

export async function saveRow(form: FormData) {
  await requireAdmin();
  const key = String(form.get("_resource"));
  const r = RESOURCES[key];
  if (!r) throw new Error("recurso inválido");
  const pk = r.pk ?? "id";
  const id = String(form.get("_id") ?? "");
  const row = parse(r.fields, form);
  if (r.table === "games") row.updated_at = new Date().toISOString();
  const sb = createAdminClient();
  const { error } = id
    ? await sb.from(r.table).update(row).eq(pk, id)
    : await sb.from(r.table).insert(row);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteRow(form: FormData) {
  await requireAdmin();
  const r = RESOURCES[String(form.get("_resource"))];
  if (!r) throw new Error("recurso inválido");
  const { error } = await createAdminClient().from(r.table).delete().eq(r.pk ?? "id", String(form.get("_id")));
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function saveSettings(form: FormData) {
  await requireAdmin();
  const rows = SETTING_GROUPS.flatMap((g) => g.items).map((f) => ({ key: f.name, value: String(form.get(f.name) ?? "") }));
  const { error } = await createAdminClient().from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function randomizeNow() {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("site_settings").upsert({ key: "signals_slot", value: "0" }, { onConflict: "key" });
  await sb.rpc("refresh_signals");
  revalidatePath("/", "layout");
}

export async function setUserFlags(form: FormData) {
  const me = await requireAdmin();
  const id = String(form.get("id"));
  const role = form.get("role") === "on" ? "admin" : "user";
  if (id === me.id && role !== "admin") throw new Error("Você não pode remover seu próprio acesso admin.");
  await createAdminClient().from("profiles").update({ role, is_vip: form.get("vip") === "on" }).eq("id", id);
  revalidatePath("/admin/usuarios");
}
