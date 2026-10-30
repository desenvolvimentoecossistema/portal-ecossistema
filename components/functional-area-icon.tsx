import {Handshake,ChartColumnIncreasing,Scale,Users,Calculator,Lightbulb,MessageSquare,Megaphone,Network} from 'lucide-react';

const icons={coinvest:Handshake,cdp:ChartColumnIncreasing,equidade:Scale,gente:Users,financas:Calculator,tech:Lightbulb,marca:MessageSquare,mobilizacao:Megaphone};
export function FunctionalAreaIcon({id}:{id:string}){
 const Icon=icons[id as keyof typeof icons]||Network;
 return <span className="functional-area-icon" aria-hidden="true"><Icon strokeWidth={1.7}/></span>;
}
