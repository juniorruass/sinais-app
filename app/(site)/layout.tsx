import Link from "next/link";
import { fmt, getMenuItems, getPopups, getSettings, getUser, refreshSignals } from "@/lib/data";
import MenuButton from "@/components/MenuButton";
import NextUpdateFloat from "@/components/NextUpdateFloat";
import BottomNav from "@/components/BottomNav";
import PopupBanner from "@/components/PopupBanner";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, user, menu, popups] = await Promise.all([getSettings(), getUser(), getMenuItems(), getPopups(), refreshSignals()]);
  const mask = (n: string) => ({ maskImage: `url(/footer/${n})`, WebkitMaskImage: `url(/footer/${n})`, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" }) as React.CSSProperties;
  return (
    <div className="relative pb-20">
      <header>
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/"><img alt="Logo" width={73} height={75} src={s.logo_url} className="h-[75px] w-auto" /></Link>
          <div className="flex items-center gap-4">
            {!user && <Link href="/cadastro" className="flex w-fit flex-col rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-4 py-1 text-center font-bold text-btn text-xs leading-3 transition-all hover:scale-110">Cadastre-se</Link>}
            <MenuButton user={user ? { name: user.name } : null} items={menu} isAdmin={user?.role === "admin"} />
          </div>
        </div>
      </header>
      <NextUpdateFloat intervalMin={Number(s.signals_interval_min) || 5} />
      <PopupBanner popups={popups} hours={Number(s.popup_hours) || 3} cta={user ? "Ver mais" : "Quero Testar"} />
      <main>{children}</main>
      <footer className="mt-4 border-gradient border-y-4 bg-footer py-16">
        <div className="container mx-auto px-4 pb-8">
          <div className="mx-auto mb-8 flex w-fit">
            {[["icon-01.png", "104 / 126"], ["icon-02.png", "127 / 126"], ["icon-03.png", "124 / 126"]].map(([n, ar]) => (
              <span key={n} role="img" aria-hidden="true" className="inline-block shrink-0 h-14 w-auto bg-primary" style={{ aspectRatio: ar, ...mask(n) }} />
            ))}
          </div>
          <h3 className="max-w-md text-pretty text-xl leading-1">{s.footer_resp_title} <span className="font-bold text-4xl text-gradient-end uppercase">{s.footer_resp_highlight}</span></h3>
          <p className="mt-2 text-pretty font-medium">{fmt(s.footer_resp_text, s)}</p>
          <div className="mx-auto my-10 h-2.5 max-w-3xs rounded-full bg-linear-to-r from-50% from-gradient-start to-50% to-gradient-end" />
          <h3 className="font-bold text-3xl text-gradient-end">{s.footer_legal_title}</h3>
          <p className="mt-2 text-pretty font-medium">{fmt(s.footer_legal_text, s)}</p>
          <img alt="" width={512} height={512} src="/footer/crown-icon.png" className="mx-auto my-8 h-8 w-auto grayscale-100" />
          <div className="mx-auto mt-4 flex max-w-96 items-center gap-2 text-balance text-white/50">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-3 border-white/30 font-bold">18<span className="absolute top-1/2 right-[-9px] flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-black">+</span></div>
            <span className="text-sm">{s.footer_18_text}</span>
          </div>
          <p className="mt-4 text-center text-white/50">© {new Date().getFullYear()} Todos os direitos reservados. {s.brand_name}</p>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
