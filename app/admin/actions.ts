"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { RESOURCES, SETTING_GROUPS, type Field } from "@/lib/adminConfig";
import { createAdminClient } from "@/lib/supabase/server";

// Links só podem ser http(s), caminho do site (/...) ou âncora — bloqueia javascript:, data: etc.
const SAFE_URL = /^(https?:\/\/|\/(?!\/)|#)/i;
function safeUrl(name: string, v: string | null) {
  if (v && !SAFE_URL.test(v)) throw new Error(`Link inválido em "${name}": use http://, https:// ou /caminho.`);
  return v;
}
const URL_FIELDS = new Set(["link", "link_casa", "href", "image_url", "icon_url", "logo_url", "favicon_url"]);

function parse(fields: Field[], form: FormData) {
  const row: Record<string, unknown> = {};
  for (const f of fields) {
    if (URL_FIELDS.has(f.name) && f.type !== "bool") {
      const v = String(form.get(f.name) ?? "").trim() || null;
      row[f.name] = safeUrl(f.name, v);
      continue;
    }
    const v = form.get(f.name);
    if (f.type === "bool") row[f.name] = form.get(f.name) === "on";
    else if (f.type === "number") row[f.name] = v === null || v === "" ? 0 : Number(v);
    else if (f.type === "list") row[f.name] = String(v ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
    else row[f.name] = v === null ? null : String(v).trim() || null;
  }
  return row;
}

export async function saveRow(form: FormData): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const key = String(form.get("_resource"));
  const r = RESOURCES[key];
  if (!r) return { error: "Recurso inválido." };
  const pk = r.pk ?? "id";
  const id = String(form.get("_id") ?? "");
  let row: Record<string, unknown>;
  try { row = parse(r.fields, form); } catch (e) { return { error: e instanceof Error ? e.message : "Dados inválidos." }; }
  if (r.table === "games") row.updated_at = new Date().toISOString();
  const sb = createAdminClient();
  const { error } = id
    ? await sb.from(r.table).update(row).eq(pk, id)
    : await sb.from(r.table).insert(row);
  if (error) return { error: "Não foi possível salvar: " + error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteRow(form: FormData) {
  await requireAdmin();
  const r = RESOURCES[String(form.get("_resource"))];
  if (!r) throw new Error("recurso inválido");
  const { error } = await createAdminClient().from(r.table).delete().eq(r.pk ?? "id", String(form.get("_id")));
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function saveSettings(form: FormData): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  let rows: { key: string; value: string }[];
  try {
    rows = SETTING_GROUPS.flatMap((g) => g.items).map((f) => ({ key: f.name, value: URL_FIELDS.has(f.name) ? (safeUrl(f.name, String(form.get(f.name) ?? "").trim() || null) ?? "") : String(form.get(f.name) ?? "") }));
  } catch (e) { return { error: e instanceof Error ? e.message : "Dados inválidos." }; }
  const { error } = await createAdminClient().from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) return { error: "Não foi possível salvar: " + error.message };
  revalidatePath("/", "layout");
  return { ok: true };
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
