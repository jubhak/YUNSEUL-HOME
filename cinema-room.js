/* Photo auditorium: map a live iframe to the four corners of the screen.
 * YouTube stays a DOM iframe: controls, captions and pointer input still work.
 * Coordinates refer to the supplied 1024 x 576 photo, not to the viewport.
 */
(function(root){
 'use strict';
 const PHOTO={width:1024,height:576,corners:[[185,75],[799,89],[798,349],[187,352]]};
 // Match the photographed wide screen. YouTube letterboxes 16:9 content itself.
 const PLAYER={width:1280,height:566};
 const scriptURL=document.currentScript&&document.currentScript.src;
 const photoURL=new URL('cinema-background.png',scriptURL||document.baseURI).href;

 function solve(rows){
  const n=rows.length;
  for(let i=0;i<n;i++){
   let pivot=i;
   for(let j=i+1;j<n;j++)if(Math.abs(rows[j][i])>Math.abs(rows[pivot][i]))pivot=j;
   if(Math.abs(rows[pivot][i])<1e-12)throw new Error('Invalid cinema screen corners');
   [rows[i],rows[pivot]]=[rows[pivot],rows[i]];
   const divisor=rows[i][i];for(let k=i;k<=n;k++)rows[i][k]/=divisor;
   for(let j=0;j<n;j++)if(j!==i){const factor=rows[j][i];for(let k=i;k<=n;k++)rows[j][k]-=factor*rows[i][k]}
  }
  return rows.map(row=>row[n]);
 }
 function projection(corners){
  const source=[[0,0],[PLAYER.width,0],[PLAYER.width,PLAYER.height],[0,PLAYER.height]],rows=[];
  source.forEach(([x,y],i)=>{
   const [u,v]=corners[i];
   rows.push([x,y,1,0,0,0,-u*x,-u*y,u]);
   rows.push([0,0,0,x,y,1,-v*x,-v*y,v]);
  });
  const [a,b,c,d,e,f,g,h]=solve(rows);
  return `matrix3d(${[a,d,0,g,b,e,0,h,0,0,1,0,c,f,0,1].join(',')})`;
 }
 function mount(host,screen){
  let disposed=false,failed=false;
  const layer=host.closest('#ytlayer');
  const photo=new Image();photo.className='cinema-photo';photo.alt='';photo.draggable=false;
  photo.decoding='async';
  function resize(){
   if(disposed||failed)return;
   const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
   // Contain both photo and projection in the same rectangle. No cropping of seats.
   const scale=Math.min(w/PHOTO.width,h/PHOTO.height);
   const x=(w-PHOTO.width*scale)/2,y=(h-PHOTO.height*scale)/2;
   Object.assign(photo.style,{left:x+'px',top:y+'px',width:PHOTO.width*scale+'px',height:PHOTO.height*scale+'px'});
   const corners=PHOTO.corners.map(([u,v])=>[x+u*scale,y+v*scale]);
   Object.assign(screen.style,{left:'0px',top:'0px',width:PLAYER.width+'px',height:PLAYER.height+'px',transformOrigin:'0 0',transform:projection(corners)});
  }
  function fallback(){
   if(disposed)return;
   failed=true;layer.classList.add('cinema-fallback');screen.removeAttribute('style');photo.hidden=true;
  }
  photo.onload=()=>{if(!disposed){failed=false;photo.hidden=false;layer.classList.remove('cinema-fallback');resize()}};
  photo.onerror=fallback;
  host.appendChild(photo);
  let observer=null;
  if(root.ResizeObserver){observer=new ResizeObserver(resize);observer.observe(host)}
  root.addEventListener('resize',resize);
  root.addEventListener('orientationchange',resize);
  document.addEventListener('fullscreenchange',resize);
  resize();photo.src=photoURL;
  return {resize,dispose(){
   disposed=true;if(observer)observer.disconnect();
   root.removeEventListener('resize',resize);root.removeEventListener('orientationchange',resize);
   document.removeEventListener('fullscreenchange',resize);
   photo.onload=photo.onerror=null;photo.remove();
  }};
 }
 root.YunseulCinema={mount};
})(window);
