import { createAdminClient } from "@/lib/supabase/server";
import { setUserFlags } from "@/app/admin/actions";

export default async function Users() {
  const { data } = await createAdminClient().from("profiles").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="mb-4 font-bold text-2xl">Usuários ({data?.length ?? 0})</h1>
      <div className="flex flex-col gap-2">
        {data?.map((u) => (
          <form key={u.id} action={setUserFlags} className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm">
            <input type="hidden" name="id" value={u.id} />
            <div className="min-w-48 flex-1"><div className="font-semibold">{u.name}</div><div className="text-zinc-500">{u.email}</div></div>
            <label className="flex items-center gap-1"><input type="checkbox" name="role" defaultChecked={u.role === "admin"} /> Admin</label>
            <label className="flex items-center gap-1"><input type="checkbox" name="vip" defaultChecked={u.is_vip} /> VIP</label>
            <button className="rounded-lg bg-[#d3b993] px-3 py-1.5 font-bold text-black">Salvar</button>
          </form>
        ))}
      </div>
    </div>
  );
}
