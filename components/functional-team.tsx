import {teamEmails} from '@/lib/team-emails';
import {functionalTeams,type TeamMember} from '@/lib/functional-teams';
import {contacts} from '@/lib/hub-data';
export function FunctionalTeam({area}:{area:string}){
 const team=functionalTeams[area];if(!team)return null;
 const person=(member:TeamMember)=>{const email=teamEmails[member.name];const contact=contacts.find(c=>c.area===area&&c.name===(member.contactName||member.name));return <article className="team-person" key={member.name}><span className="team-initials" aria-hidden="true">{member.name.split(' ').filter(Boolean).map(n=>n[0]).filter((_,i,a)=>i===0||i===a.length-1).join('')}</span><div><h4>{member.name}</h4><p>{member.role}</p>{contact?.topic&&<p className="team-topic">{contact.topic}</p>}</div>{email&&<a href={'mailto:'+email}>{email}</a>}</article>;};
 return <div className="functional-organogram">{team.leadership.length>0&&<div className="team-leadership">{team.leadership.map(person)}</div>}<div className="team-branches">{team.groups.map(g=><section className="team-branch" key={g.name}><h3>{g.name}</h3><div>{g.members.map(person)}</div></section>)}</div></div>;
}
