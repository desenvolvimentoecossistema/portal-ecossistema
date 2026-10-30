"use client";
import {usePathname} from "next/navigation";
import {useEffect,useRef} from "react";
import {portalNavigationHTML,bindPortalMenu} from "@/lib/portal-navigation.js";
export default function PortalNavigation({signOutPath}:{signOutPath:string}){
 const pathname=usePathname();
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>root.current?bindPortalMenu(root.current):undefined,[pathname]);
 if(pathname.startsWith('/login')||pathname.startsWith('/auth/'))return null;
 const active=pathname.startsWith('/imersoes')?'imersoes':pathname.startsWith('/mapa')?'mapa':pathname.startsWith('/organizacoes')?'organizacoes':pathname.startsWith('/funcionais')?'funcionais':'inicio';
 return <div ref={root} className="portal-navigation-shell" dangerouslySetInnerHTML={{__html:portalNavigationHTML(active,signOutPath)}}/>;
}
