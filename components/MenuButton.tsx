"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSliders, FaX } from "react-icons/fa6";
import { TbNavigationFilled } from "react-icons/tb";
import type { MenuItem } from "@/lib/data";
import { signOut } from "@/app/actions";

function Item({ href, label, icon, external, onClose }: { href: string; label: string; icon?: string | null; external?: boolean; onClose: () => void }) {
  const w = label.trim().split(/\s+/); const last = w.pop(); const first = w.join(" ");
  const inner = (
    <>
      {icon && <img src={icon} alt={label} height={28} width={28} className="h-7 w-7 object-contain" />}
      <span>{first} <b>{last}</b></span>
      <TbNavigationFilled className="ml-auto rotate-90 text-primary" />
    </>
  );
  const cls = "flex items-center gap-4 px-4 py-2 hover:bg-white/10";
  return external || href.startsWith("http")
    ? <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClose} className={cls}>{inner}</a>
    : <Link href={href} onClick={onClose} className={cls}>{inner}</Link>;
}

export default function MenuButton({ user, items, isAdmin }: { user: { name: string } | null; items: MenuItem[]; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  const close = () => setOpen(false);
  return (
    <>
      <button type="button" aria-label="Menu" className="text-white transition-all duration-300 hover:scale-110" onClick={() => setOpen(true)}><FaSliders size={26} /></button>
      {open && (
        <div className="fixed inset-0 z-50">
          <aside className="absolute top-26 left-0 z-10 h-full w-full overflow-y-auto rounded-r-[70px] border-gradient border-t-4 bg-panel px-4 pb-40">
            <div className="flex items-center px-4 py-4">
              {user && <span className="font-semibold text-lg">{user.name}</span>}
              <button type="button" onClick={close} className="ml-auto rounded-full bg-primary p-1.5"><FaX className="size-3 text-btn" /></button>
            </div>
            <div className="flex flex-col gap-4 py-4">
              {items.map((m) => <Item key={m.id} href={m.href} label={m.label} icon={m.icon_url} external={m.externo} onClose={close} />)}
              {user ? (
                <form action={signOut}>
                  <button type="submit" className="flex w-full cursor-pointer items-center gap-4 px-4 py-2 font-medium hover:bg-white/10">
                    <img src="/icons/menu/logout-icon.png" alt="Sair" height={28} width={28} className="h-7 w-7 object-contain" /><span>Sair</span>
                  </button>
                </form>
              ) : (
                <Item href="/login" label="Registro/Entrar" icon="/icons/menu/member-icon.png" onClose={close} />
              )}
              {isAdmin && <div className="mt-4 border-white/10 border-t"><Item href="/admin" label="Admin" onClose={close} /></div>}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
