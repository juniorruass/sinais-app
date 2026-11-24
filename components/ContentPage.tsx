import CopyButton from "./CopyButton";

const parse = (content: string) => content.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.split("|").map((x) => x.trim()));
const card = "rounded-3xl border-2 border-secondary/60 bg-black/30";
const gold = "bg-linear-to-r from-gradient-start to-gradient-end text-black";

function Title({ a, b, icon }: { a: string; b?: string; icon?: string }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-3 text-center">
      {icon && <img src={icon} alt="" className="h-10 w-10 object-contain" />}
      <h1 className="font-bold text-2xl uppercase leading-tight md:text-3xl">{a}{b && <><br /><span className="text-primary">{b}</span></>}</h1>
    </div>
  );
}

function remaining(when: string) {
  if (!when || when.toLowerCase() === "agora") return null;
  const t = Date.parse(when.replace(" ", "T") + ":00-03:00");
  if (Number.isNaN(t) || t <= Date.now()) return null;
  const m = Math.floor((t - Date.now()) / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m % 60}M`;
}

export default function ContentPage({ slug, title, content }: { slug: string; title: string; content: string }) {
  const rows = parse(content);
  if (slug === "grupos-whatsapp")
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Title a={title} icon="/icons/menu/whatsapp-icon.png" />
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map(([nome, link], i) => (
            <div key={i} className={`${card} flex items-center justify-between gap-3 p-4`}>
              <span className="font-bold">{nome}</span>
              <a href={link} target="_blank" rel="noopener noreferrer" className={`${gold} rounded-full px-5 py-2 font-bold text-xs uppercase`}>Entrar</a>
            </div>
          ))}
        </div>
      </div>
    );
  if (slug === "lancamentos-futuros")
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Title a="Lançamentos" b="Futuros!" icon="/icons/menu/shuttle-icon.png" />
        <div className="grid grid-cols-2 gap-4">
          {rows.map(([nome, link, img, when], i) => {
            const rem = remaining(when ?? "");
            return (
              <div key={i} className={`${card} p-4`}>
                <div className="flex items-center gap-3">
                  {img && <img src={img} alt={nome} className="h-14 w-14 rounded-xl object-cover" />}
                  <div><div className="text-white/60 text-xs">Lançamento</div><div className="font-bold">{nome}</div></div>
                </div>
                <div className="mt-3 text-sm">{rem ? <>Faltam <b>{rem}</b></> : <b className="text-primary">Lançado!</b>}</div>
                {rem || !link
                  ? <div className="mt-3 rounded-full bg-white/10 py-2 text-center font-bold text-white/40 text-xs uppercase">Aguarde</div>
                  : <a href={link} target="_blank" rel="noopener noreferrer" className={`${gold} mt-3 block rounded-full py-2 text-center font-bold text-xs uppercase`}>Acessar agora</a>}
              </div>
            );
          })}
        </div>
      </div>
    );
  if (slug === "dominios-oficiais")
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Title a={title} icon="/icons/menu/crown-icon.png" />
        <div className="flex flex-col gap-4">
          {rows.map(([ext, url, status], i) => {
            const on = (status ?? "").toLowerCase().startsWith("on");
            return (
              <div key={i} className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}>
                <div><div className="font-black text-xl text-primary">{ext}</div><div className="font-semibold text-sm uppercase">{url}</div></div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 font-bold text-xs uppercase ${on ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>Site {on ? "online" : "offline"}</span>
                  <CopyButton text={url?.startsWith("http") ? url : `https://${url}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  if (slug === "duvidas-frequentes")
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Title a="Dúvidas" b="Frequentes" icon="/icons/menu/question-icon.png" />
        <div className="flex flex-col gap-3">
          {rows.map(([q, a], i) => (
            <details key={i} className={`${card} group p-4`}>
              <summary className="flex cursor-pointer list-none items-center gap-3 font-bold">
                <img src="/icons/menu/question-icon.png" alt="" className="h-6 w-6" />{q}
              </summary>
              <p className="mt-3 text-white/80 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    );
  if (slug === "vpn") {
    const [btn, ...steps] = rows;
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Title a="Download seguro" b="VPN grátis!" />
        <img src="/icons/vpn.png" alt="VPN" className="mx-auto mb-8 w-44" />
        <p className="mb-4 text-center font-bold">Siga os passos abaixo!</p>
        <div className="flex flex-col gap-3">
          {steps.map(([t, d], i) => (
            <div key={i} className={`${card} flex items-start gap-4 p-4`}>
              <div className={`${gold} flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black`}>{String(i + 1).padStart(2, "0")}</div>
              <div><div className="font-bold uppercase">{t}</div><div className="text-sm text-white/70">{d}</div></div>
            </div>
          ))}
        </div>
        {btn && <a href={btn[1]} target="_blank" rel="noopener noreferrer" className={`${gold} mx-auto mt-8 block w-fit rounded-full px-8 py-3 font-black uppercase`}>{btn[0]}</a>}
      </div>
    );
  }
  return (
    <div className="container mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 font-bold text-3xl text-primary">{title}</h1>
      <div className="space-y-4 whitespace-pre-line font-medium leading-relaxed text-white/90">{content}</div>
    </div>
  );
}
