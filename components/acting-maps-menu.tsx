"use client";

import {useEffect,useId,useRef,useState} from 'react';
import {ChevronDown,Network} from 'lucide-react';
import '@/public/acting-maps-menu.css';

export default function ActingMapsMenu({card=false}:{card?:boolean}){
 const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null);
 const menuId=useId();
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);button.current?.focus();}};
  document.addEventListener('pointerdown',outside);
  document.addEventListener('keydown',escape);
  return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open]);
 return <div ref={root} className={'acting-map-picker'+(card?' acting-map-picker-card':'')}>
  <button ref={button} type="button" className={(card?'hub-tool':'hub-link')+' acting-map-trigger'} aria-expanded={open} aria-controls={menuId} onClick={()=>setOpen(!open)}>
   {card?<><Network aria-hidden="true"/><span className="acting-map-card-copy"><strong>Mapas de Atuação</strong><span>Veja a atuação das organizações em Alfabetização, Fundamental 2 e Lideranças.</span></span></>:'Explorar os Mapas de Atuação'}
   <ChevronDown aria-hidden="true"/>
  </button>
  {open&&<div id={menuId} className="acting-map-options" aria-label="Escolha um mapa de atuação">
   <a href="/mapa-de-atuacao/alfabetizacao">Alfabetização</a>
   <a href="/mapa-de-atuacao/fundamental-2">Fundamental 2</a>
   <a href="/mapa-de-atuacao/liderancas">Lideranças</a>
  </div>}
 </div>;
}
