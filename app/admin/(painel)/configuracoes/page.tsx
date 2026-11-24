import FieldInput from "@/components/admin/FieldInput";
import { SETTING_GROUPS } from "@/lib/adminConfig";
import { getSettings } from "@/lib/data";
import { saveSettings } from "@/app/admin/actions";

export default async function Config() {
  const s = await getSettings();
  return (
    <form action={saveSettings}>
      <h1 className="font-bold text-3xl">Configurações do site</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-400">Nome, logo, cores, textos e rodapé. Salve no final da página.</p>
      {SETTING_GROUPS.map((g) => (
        <section key={g.grupo} className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="mb-4 font-bold text-[#d3b993] text-lg">{g.grupo}</h2>
          <div className="grid gap-4 sm:grid-cols-2">{g.items.map((f) => <FieldInput key={f.name} f={f} value={s[f.name]} />)}</div>
        </section>
      ))}
      <button className="sticky bottom-4 rounded-xl bg-gradient-to-r from-[#d3b993] to-[#9c8460] px-8 py-3 font-bold text-black shadow-xl shadow-black/50 transition hover:brightness-110">Salvar configurações</button>
    </form>
  );
}
