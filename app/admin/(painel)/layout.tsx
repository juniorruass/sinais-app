import Link from "next/link";
import { FaArrowUpRightFromSquare, FaBars, FaBuilding, FaFileLines, FaGamepad, FaGauge, FaGear, FaImages, FaLayerGroup, FaRightFromBracket, FaShieldHalved, FaUsers, FaWindowRestore } from "react-icons/fa6";
import { requireAdmin } from "@/lib/admin";
import { RESOURCES } from "@/lib/adminConfig";
import { adminLogout } from "@/app/admin/login/actions";

export const metadata = { title: "Admin" };
const icons: Record<string, React.ReactNode> = {
  jogos: <FaGamepad />, plataformas: <FaBuilding />, banners: <FaImages />, popups: <FaWindowRestore />, menu: <FaBars />, paginas: <FaFileLines />,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await requireAdmin();
  const links = [
    { href: "/admin", label: "Painel", icon: <FaGauge /> },
    { href: "/admin/configuracoes", label: "Configurações", icon: <FaGear /> },
    ...Object.entries(RESOURCES).map(([k, r]) => ({ href: `/admin/${k}`, label: r.title, icon: icons[k] ?? <FaLayerGroup /> })),
    { href: "/admin/usuarios", label: "Usuários", icon: <FaUsers /> },
    { href: "/admin/seguranca", label: "Segurança (2FA)", icon: <FaShieldHalved /> },
  ];
  return (
    <div className="fixed inset-0 z-[500] flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#1c1a16,#09090b_55%)] text-zinc-100 md:flex-row">
      <aside className="flex shrink-0 gap-1 overflow-x-auto border-zinc-800/80 border-b bg-black/40 p-3 backdrop-blur md:w-64 md:flex-col md:border-r md:border-b-0 md:p-4">
        <div className="mb-4 hidden items-center gap-2.5 px-2 md:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#d3b993] to-[#9c8460] font-black text-black">A</div>
          <div><div className="font-bold leading-tight">Painel Admin</div><div className="text-[11px] text-zinc-500">Gerencie o site</div></div>
        </div>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm text-zinc-300 transition hover:bg-[#d3b993]/10 hover:text-[#d3b993]">
            <span className="text-base opacity-80">{l.icon}</span>{l.label}
          </Link>
        ))}
        <div className="mt-auto hidden flex-col gap-1 border-zinc-800 border-t pt-4 md:flex">
          <div className="truncate px-2 text-[11px] text-zinc-500">{u.email}</div>
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#d3b993] hover:bg-white/5"><FaArrowUpRightFromSquare size={12} />Ver site</Link>
          <form action={adminLogout}><button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-red-300 text-sm hover:bg-red-500/10"><FaRightFromBracket size={12} />Sair</button></form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-10"><div className="mx-auto max-w-5xl">{children}</div></main>
    </div>
  );
}
