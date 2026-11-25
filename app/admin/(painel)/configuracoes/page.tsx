import FieldInput from "@/components/admin/FieldInput";
import SettingsForm from "@/components/admin/SettingsForm";
import { SETTING_GROUPS } from "@/lib/adminConfig";
import { getSettings } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/server";

export default async function Config() {
  const s = await getSettings();
  // O domínio "auto" é resolvido em getSettings; aqui mostramos o valor gravado (senão salvar fixaria o domínio atual).
  const { data: d } = await createAdminClient().from("site_settings").select("value").eq("key", "site_domain").maybeSingle();
  s.site_domain = d?.value || "auto";
  return (
    <SettingsForm>
      <h1 className="font-bold text-3xl">Configurações do site</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-400">Nome, logo, cores, textos e rodapé. Salve no final da página.</p>
      {SETTING_GROUPS.map((g) => (
        <section key={g.grupo} className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="mb-4 font-bold text-[#d3b993] text-lg">{g.grupo}</h2>
          <div className="grid gap-4 sm:grid-cols-2">{g.items.map((f) => <FieldInput key={f.name} f={f} value={s[f.name]} />)}</div>
        </section>
      ))}
    </SettingsForm>
  );
}
