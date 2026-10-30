import Image from 'next/image';
import {SegmentedOrbit} from '@/components/segmented-orbit';
export function HubLayout({children,hero}:{children:React.ReactNode;hero?:React.ReactNode}){
 return <main className="hub">{hero}<div className="hub-wrap">{children}</div></main>;
}
export function PortalHero({title,description,back,home=false,organization,className=''}:{className?:string;title:string;description?:string;eyebrow?:string;back?:{href:string;label:string};home?:boolean;organization?:{name:string;logo:string;logoBounds:number[]}}){
 return <header className={'portal-page-hero'+(home||organization?' portal-page-hero-home':'')+(home?' portal-home-hero':'')+(className?' '+className:'')}><SegmentedOrbit className="portal-hero-orbit"/><div className="hub-wrap portal-hero-inner"><div>{back&&back.href!=='/'&&<a href={back.href} className="hub-breadcrumb">← {back.label}</a>}<h1>{title}</h1>{description&&<p className="hub-intro">{description}</p>}</div>{home&&<Image src="/ecosystem-organizations.png" alt="Organizações do Ecossistema" width={1394} height={1128} priority unoptimized className="hub-hero-art"/>}{organization&&<div className="organization-hero-logo"><OrgLogo {...organization}/></div>}</div></header>;
}
export function OrgLogo({name,logo,logoBounds}:{name:string;logo:string;logoBounds:number[]}){const [width,height,x,y,w,h]=logoBounds;return <svg className="organization-logo" data-brand={logo.endsWith('/reuna.png')?'reuna':undefined} viewBox={`${x} ${y} ${w} ${h}`} role="img" aria-label={`Logo de ${name}`} preserveAspectRatio="xMidYMid meet"><image href={logo} width={width} height={height}/></svg>;}
export function ForwardIcon(){return <svg className="portal-forward" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7"/></svg>;}
export function OrgBadge({short,color}:{short:string;color:string}){return <span className="hub-org-badge" style={{'--org-color':color} as React.CSSProperties} aria-hidden="true">{short}</span>;}
