(async function(){
 if(/^\/(login|auth|aceite)(\/|$)/.test(location.pathname))return;
 let state;try{const response=await fetch('/api/legal-notice',{credentials:'same-origin',cache:'no-store'});if(!response.ok)return;state=await response.json();}catch{return;}
 if(state.canPreview===true){
  document.querySelectorAll('.portal-legal-footer nav').forEach(nav=>{
   if(!nav.querySelector('[data-legal-records]')){
    const records=document.createElement('a');records.href='/administracao/aceites';records.textContent='Registros de aceite';records.setAttribute('data-legal-records','');nav.append(records);
   }
   if(nav.querySelector('[data-preview-legal]'))return;
   const button=document.createElement('button');button.type='button';button.className='portal-legal-preview';button.textContent='Ver aceite de primeiro acesso';
   button.setAttribute('data-preview-legal','');button.addEventListener('click',()=>location.assign('/aceite?preview=1&return_to='+encodeURIComponent(location.pathname+location.search)));nav.append(button);
  });
 }
 if(!state.accepted&&!/^\/(termos-de-uso|privacidade)\/?$/.test(location.pathname))location.replace('/aceite?return_to='+encodeURIComponent(location.pathname+location.search));
})();
