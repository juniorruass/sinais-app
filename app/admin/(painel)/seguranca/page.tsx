import QRCode from "qrcode";
import { requireAdmin, sign } from "@/lib/admin";
import { getTotpSecret, newSecret, otpauthUrl } from "@/lib/totp";
import { disableTotp, enableTotp } from "./actions";

const inp = "w-48 rounded-xl border border-zinc-700 bg-zinc-950/60 px-3.5 py-2.5 text-center text-sm tracking-widest outline-none focus:border-[#d3b993]";
const btn = "rounded-xl bg-gradient-to-r from-[#d3b993] to-[#9c8460] px-5 py-2.5 text-sm font-bold text-black";

export default async function Seguranca({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const u = await requireAdmin();
  const { ok, erro } = await searchParams;
  const active = !!(await getTotpSecret());
  let setup: { secret: string; sig: string; qr: string } | null = null;
  if (!active) {
    const secret = newSecret();
    setup = { secret, sig: sign("totp:" + secret), qr: await QRCode.toDataURL(otpauthUrl(secret, u.email), { width: 220, margin: 1 }) };
  }
  return (
    <div>
      <h1 className="font-bold text-3xl">Segurança</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-400">Verificação em duas etapas (2FA) com aplicativo autenticador.</p>
      {ok && <p className="mb-4 rounded-xl bg-green-500/15 p-3 text-green-300 text-sm">2FA ativado! A partir de agora o login pede o código do app.</p>}
      {erro && <p className="mb-4 rounded-xl bg-red-500/15 p-3 text-red-300 text-sm">Código inválido. Confira o app e tente de novo.</p>}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        {active ? (
          <>
            <div className="mb-2 flex items-center gap-2 font-bold"><span className="h-2.5 w-2.5 rounded-full bg-green-400" />2FA ativado</div>
            <p className="mb-4 text-sm text-zinc-400">Para desativar, digite o código atual do seu autenticador.</p>
            <form action={disableTotp} className="flex flex-wrap items-center gap-3">
              <input name="code" inputMode="numeric" maxLength={7} placeholder="000000" required className={inp} />
              <button className="rounded-xl border border-red-500/40 px-5 py-2.5 text-red-300 text-sm hover:bg-red-500/10">Desativar 2FA</button>
            </form>
          </>
        ) : setup && (
          <>
            <div className="mb-4 font-bold">Ativar 2FA</div>
            <ol className="mb-5 list-decimal space-y-1 pl-5 text-sm text-zinc-300">
              <li>Abra o Google Authenticator, Authy ou Microsoft Authenticator.</li>
              <li>Toque em <b>adicionar conta</b> e escaneie o QR code abaixo (ou digite a chave).</li>
              <li>Digite o código de 6 dígitos que o app mostrar e confirme.</li>
            </ol>
            <div className="mb-5 flex flex-wrap items-center gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setup.qr} alt="QR code 2FA" className="h-[220px] w-[220px] rounded-xl bg-white p-2" />
              <div className="text-sm"><div className="text-zinc-400">Chave manual:</div><code className="break-all font-mono text-[#d3b993]">{setup.secret}</code></div>
            </div>
            <form action={enableTotp} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="secret" value={setup.secret} />
              <input type="hidden" name="sig" value={setup.sig} />
              <input name="code" inputMode="numeric" maxLength={7} placeholder="000000" required className={inp} />
              <button className={btn}>Ativar 2FA</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
