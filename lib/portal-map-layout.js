export function bindPortalMapLayout(root=document){
 const app=root.getElementById('programs-app'),toggle=root.getElementById('desktop-filter-toggle'),hero=root.querySelector('.portal-map-hero'),toolbar=root.querySelector('.data-toolbar');
 const scrollers=[...root.querySelectorAll('.programs-wrap,.l2-view-mapa .map-frame,.sidebar')],view=root.defaultView;
 let changingLayout=false;
 if(app&&toggle){
  toggle.addEventListener('click',()=>{
   const positions=scrollers.map(element=>({element,top:element.scrollTop,left:element.scrollLeft}));
   const pageTop=root.scrollingElement?.scrollTop,pageLeft=root.scrollingElement?.scrollLeft;
   changingLayout=true;
   const hidden=app.classList.toggle('desktop-filters-hidden');toggle.setAttribute('aria-expanded',String(!hidden));toggle.querySelector('span').textContent=hidden?'Mostrar filtros':'Ocultar filtros';
   const restore=()=>{for(const {element,top,left} of positions){element.scrollTop=top;element.scrollLeft=left;}if(root.scrollingElement){root.scrollingElement.scrollTop=pageTop;root.scrollingElement.scrollLeft=pageLeft;}};
   restore();
   if(view?.requestAnimationFrame)view.requestAnimationFrame(()=>{restore();view.requestAnimationFrame(()=>{changingLayout=false;});});else changingLayout=false;
  });
 }
 if(!hero)return;
 const show=()=>{hero.classList.remove('map-hero-hidden');toolbar?.classList.remove('map-toolbar-hidden');};
 const measure=()=>{hero.style.setProperty('--map-hero-height',hero.getBoundingClientRect().height+'px');if(toolbar)toolbar.style.setProperty('--map-toolbar-height',toolbar.getBoundingClientRect().height+'px');};
 measure();if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(measure);observer.observe(hero);if(toolbar)observer.observe(toolbar);}
 hero.addEventListener('focusin',show);
 toolbar?.addEventListener('focusin',show);
 scrollers.forEach(scroller=>{
  let previous=scroller.scrollTop;
  scroller.addEventListener('scroll',()=>{const current=scroller.scrollTop,delta=current-previous;previous=current;if(changingLayout)return;if(current<40||delta < -8)show();else if(current>90&&delta>8){if(hero.contains(root.activeElement)||toolbar?.contains(root.activeElement))root.getElementById('conteudo-principal')?.focus({preventScroll:true});hero.classList.add('map-hero-hidden');toolbar?.classList.add('map-toolbar-hidden');}},{passive:true});
 });
}
