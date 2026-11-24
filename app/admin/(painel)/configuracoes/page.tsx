import FieldInput from "@/components/admin/FieldInput";
import { SETTING_GROUPS } from "@/lib/adminConfig";
import { getSettings } from "@/lib/data";
import { saveSettings } from "@/app/admin/actions";

export default async function Config() {
  const s = await getSettings();
  return (
    <form action={saveSettings} className="max-w-3xl">
      <h1 className="mb-6 font-bold text-2xl">Configurações do site</h1>
      {SETTING_GROUPS.map((g) => (
        <section key={g.grupo} className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-3 font-bold text-[#d3b993]">{g.grupo}</h2>
          <div className="grid gap-3 sm:grid-cols-2">{g.items.map((f) => <FieldInput key={f.name} f={f} value={s[f.name]} />)}</div>
        </section>
      ))}
      <button className="sticky bottom-4 rounded-lg bg-[#d3b993] px-6 py-3 font-bold text-black shadow-lg">Salvar configurações</button>
    </form>
  );
}
