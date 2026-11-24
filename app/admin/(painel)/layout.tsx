import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { RESOURCES } from "@/lib/adminConfig";
import { adminLogout } from "@/app/admin/login/actions";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await requireAdmin();
  const links = [
    { href: "/admin", label: "Painel" },
    { href: "/admin/configuracoes", label: "Configurações" },
    ...Object.entries(RESOURCES).map(([k, r]) => ({ href: `/admin/${k}`, label: r.title })),
    { href: "/admin/usuarios", label: "Usuários" },
  ];
  return (
    <div className="fixed inset-0 z-[500] flex flex-col overflow-hidden bg-zinc-950 text-zinc-100 md:flex-row">
      <aside className="flex shrink-0 gap-1 overflow-x-auto border-zinc-800 border-b bg-zinc-900 p-3 md:w-60 md:flex-col md:border-r md:border-b-0">
        <div className="mb-2 hidden px-2 font-bold text-[#d3b993] md:block">Admin</div>
        {links.map((l) => <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-zinc-800">{l.label}</Link>)}
        <div className="mt-auto hidden px-2 pt-4 text-xs text-zinc-500 md:block">{u.email}<br /><Link href="/" className="text-[#d3b993]">← Ver site</Link><br /><form action={adminLogout}><button className="mt-2 text-red-300">Sair</button></form></div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
