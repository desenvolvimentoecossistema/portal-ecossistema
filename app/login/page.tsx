import "./login.css";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { SegmentedOrbit } from "@/components/segmented-orbit";
import { getSiteUser } from "@/app/site-auth";
import { providerSettings, safeReturnPath, usesOAuth } from "@/lib/oauth-config";
import { LoginRetry } from "@/components/login-retry";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portal do Ecossistema | Fundação Lemann" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string; error?: string; sso?: string }> }) {
  const user = await getSiteUser();
  if (user) redirect("/");
  const external = usesOAuth();
  const googleReady = Boolean(providerSettings("google"));
  const params = await searchParams;
  const returnTo = safeReturnPath(params.return_to ?? "/");

  return (
    <main className="ecosystem-login relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#052B47] px-5 py-8 text-[#052B47] sm:px-8 sm:py-12">
      <LoginRetry />
      <SegmentedOrbit className="absolute -left-28 -top-28 size-[380px] opacity-35 sm:-left-24 sm:-top-36 sm:size-[500px]" />
      <SegmentedOrbit className="absolute -bottom-36 -right-32 size-[450px] opacity-40" />
      <section aria-label="Acesso ao Portal do Ecossistema" className="login-card relative z-10 grid w-full max-w-[1080px] overflow-hidden rounded-[28px] bg-white shadow-[0_28px_100px_rgba(0,0,0,0.25)] lg:grid-cols-[1fr_1fr]">
        <div className="login-brand relative isolate flex items-center justify-between gap-5 overflow-hidden bg-[#BDCF3A] p-7 sm:p-10 lg:min-h-[620px] lg:flex-col lg:items-stretch lg:justify-start lg:gap-0 lg:p-12">
          <SegmentedOrbit innerStroke="#052B47" className="absolute -right-24 -top-28 size-72 opacity-25" />
          <Image src="/fundacao-lemann-logo-transparent.svg" alt="Fundação Lemann" width={190} height={65} priority className="login-foundation relative z-10 h-10 w-auto max-w-[190px] object-contain object-left sm:h-12 lg:h-[65px]" />
          <p className="login-motto font-heading relative z-10 mt-10 hidden max-w-[370px] text-[30px] font-extrabold leading-[1.18] lg:block">Quanto mais nos aproximamos, mais possibilidades criamos juntos.</p>
          <Image src="/ecosystem-organizations.png" alt="Ecossistema: Centro Lemann, Fundação Lemann, Motriz, MegaEdu, Nova Escola, Reúna, Bem Comum e Trajetórias" width={1394} height={1128} priority className="login-ecosystem relative z-10 w-[90px] shrink-0 object-contain sm:w-[110px] lg:mx-auto lg:mt-7 lg:w-full lg:max-w-[280px]" />
        </div>
        <div className="login-access flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <h1 className="text-[30px] font-extrabold leading-[1.15] sm:text-[34px]">Acesse o Portal do Ecossistema</h1>
          {params.error && <p role="alert" className="login-error mt-5 rounded-xl bg-[#FBEAE8] p-3 text-sm text-[#B42318]">Não foi possível concluir o login. Confira se sua conta está autorizada e tente novamente.</p>}
          {external ? (
            <div className="login-actions mt-7 grid gap-3">
              {googleReady ? <a href={`/auth/start/google?return_to=${encodeURIComponent(returnTo)}`} className="login-button flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#052B47] px-6 font-bold text-white transition hover:bg-[#007F68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A180] focus-visible:ring-offset-2">Entrar com Google <ArrowRight className="size-4" aria-hidden="true" /></a> : <p className="rounded-xl border border-[#052B47]/20 p-3 text-sm text-[#052B47]/75">O login está indisponível no momento. Tente novamente mais tarde.</p>}
            </div>
          ) : (
            <p role="alert" className="mt-7 rounded-xl bg-[#FBEAE8] p-3 text-sm text-[#B42318]">Configuração de acesso pendente.</p>
          )}
          <p className="login-restriction mt-5 text-center text-sm text-[#052B47]/70">O acesso é permitido somente a pessoas autorizadas.</p>
        </div>
      </section>
    </main>
  );
}
