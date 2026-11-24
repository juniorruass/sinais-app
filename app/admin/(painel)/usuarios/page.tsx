import { createAdminClient } from "@/lib/supabase/server";
import { setUserFlags } from "@/app/admin/actions";

export default async function Users() {
  const { data } = await createAdminClient().from("profiles").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="font-bold text-3xl">Usuários</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-400">{data?.length ?? 0} cadastrado(s) no site</p>
      <div className="flex flex-col gap-3">
        {data?.map((u) => (
          <form key={u.id} action={setUserFlags} className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm">
            <input type="hidden" name="id" value={u.id} />
            <div className="min-w-48 flex-1"><div className="font-semibold">{u.name}</div><div className="text-zinc-500">{u.email}</div></div>
            <label className="flex items-center gap-2"><input type="checkbox" name="role" defaultChecked={u.role === "admin"} className="accent-[#d3b993]" /> Admin</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="vip" defaultChecked={u.is_vip} className="accent-[#d3b993]" /> VIP</label>
            <button className="rounded-xl bg-gradient-to-r from-[#d3b993] to-[#9c8460] px-4 py-2 font-bold text-black">Salvar</button>
          </form>
        ))}
        {!data?.length && <p className="rounded-2xl border border-zinc-800 p-8 text-center text-zinc-500">Nenhum usuário ainda.</p>}
      </div>
    </div>
  );
}
