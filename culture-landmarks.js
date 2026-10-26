/* Cultural landmarks: procedural architecture and deterministic globe-wide spacing. */
(function(root){
 'use strict';
 function chooseSites(T,obstacles,radius,theaterRadius=2.35,operaRadius=2.35){
  const angle=r=>Math.atan(r/(radius-.03)),ta=angle(theaterRadius),oa=angle(operaRadius);
  const fixed=obstacles.map(o=>({n:o.n.clone().normalize(),a:angle(o.radius)}));
  const gap=(n,a)=>fixed.reduce((v,o)=>Math.min(v,n.angleTo(o.n)-a-o.a),Infinity);
  // Search the whole sphere, not just the original crowded northern district.
  const samples=[],count=1800,golden=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<count;i++){
   const y=1-2*(i+.5)/count,r=Math.sqrt(1-y*y),p=i*golden;
   const n=new T.Vector3(Math.cos(p)*r,y,Math.sin(p)*r);
   samples.push({n,t:gap(n,ta),o:gap(n,oa)});
  }
  let best=-Infinity,theater,opera;
  for(let i=0;i<count;i++){
   const a=samples[i];if(a.t<=best)continue;
   for(let j=0;j<count;j++){
    const b=samples[j];if(b.o<=best)continue;
    const score=Math.min(a.t,b.o,a.n.angleTo(b.n)-ta-oa);
    if(score>best){best=score;theater=a.n;opera=b.n}
   }
  }
  const score=(t,o)=>Math.min(gap(t,ta),gap(o,oa),t.angleTo(o)-ta-oa);
  // Refine both sites together; the other cultural building is also an obstacle.
  for(const step of [.035,.012,.004,.001]){
   for(let pass=0;pass<8;pass++){
    let changed=false;
    for(const key of ['theater','opera']){
     const n=key==='theater'?theater:opera;
     const u=new T.Vector3().crossVectors(n,Math.abs(n.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0)).normalize();
     const v=new T.Vector3().crossVectors(n,u).normalize();
     for(let k=0;k<16;k++){
      const p=k*Math.PI/8,c=n.clone().multiplyScalar(Math.cos(step)).addScaledVector(u,Math.sin(step)*Math.cos(p)).addScaledVector(v,Math.sin(step)*Math.sin(p)).normalize();
      const s=key==='theater'?score(c,opera):score(theater,c);
      if(s>best+1e-9){best=s;if(key==='theater')theater=c;else opera=c;changed=true}
     }
    }
    if(!changed)break;
   }
  }
  if(best<=0)throw new Error('No non-overlapping cultural landmark sites available');
  return {theater,opera,clearance:best*radius,theaterRadius,operaRadius};
 }
 function tools(T){
  const mat=(color,extra)=>new T.MeshStandardMaterial(Object.assign({color,roughness:.55},extra));
  const mesh=(g,geo,m,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o};
  const box=(g,m,w,h,d,x,y,z)=>mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);
  const tube=(g,m,pts,r=.018)=>mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts),36,r,6,false),m);
  return {mat,mesh,box,tube};
 }
 function buildTheater(T){
  const {mat,mesh,box}=tools(T),g=new T.Group();g.name='yunseul-cinema-pavilion';
  const pearl=mat(0xfff5e9,{roughness:.38}),gold=mat(0xd8b583,{metalness:.55,roughness:.3});
  const mint=mat(0xb5d8cb),glass=mat(0x729caa,{metalness:.25,roughness:.18});
  const frame=mat(0x234b4e),door=mat(0x9bd8db,{metalness:.18,roughness:.2});
  // Ground floor is unchanged in footprint; ONLY the second floor cantilevers on all four sides.
  box(g,pearl,3.65,.16,2.8,0,.04,0);box(g,gold,3.42,.07,2.60,0,.155,0);
  box(g,glass,3.08,1.04,2.24,0,.74,0);
  for(const x of [-1.42,-.68,.68,1.42])box(g,pearl,.10,1.06,.11,x,.75,1.17);
  for(const x of [-.23,.23]){box(g,door,.43,.78,.05,x,.60,1.16);box(g,gold,.025,.18,.035,x*.28,.60,1.20)}
  // Entrance fascia only — the nameplate is the shared labelBig style from app.js.
  box(g,mint,3.28,.48,.17,0,1.12,1.24);
  box(g,pearl,4.20,.18,3.10,0,1.43,0);box(g,gold,4.24,.035,3.14,0,1.54,0);
  box(g,frame,4.14,1.46,3.04,0,2.28,0);
  const displays=[];
  function display(w,x,z,ry,shared){
   let d=shared;if(!d){const canvas=document.createElement('canvas');canvas.width=Math.round(w/1.30*440);canvas.height=440;
    const texture=new T.CanvasTexture(canvas);texture.encoding=T.sRGBEncoding;texture.anisotropy=4;
    d={canvas,ctx:canvas.getContext('2d'),texture,last:-1};displays.push(d)}
   const o=mesh(g,new T.PlaneGeometry(w,1.30),new T.MeshBasicMaterial({map:d.texture,toneMapped:false}),x,2.28,z);o.rotation.y=ry;o.name='cinema-tv';return d;
  }
  const front=display(3.94,0,1.532,0),side=display(2.84,2.082,0,Math.PI/2);
  display(3.94,0,-1.532,Math.PI,front);display(2.84,-2.082,0,-Math.PI/2,side);
  box(g,pearl,4.20,.17,3.10,0,3.08,0);box(g,gold,4.24,.035,3.14,0,3.18,0);
  // The supplied artwork is used verbatim as a two-sided rooftop standee, not AI-redrawn.
  const base=mesh(g,new T.CylinderGeometry(.85,1,.23,48),mint,0,3.35,0);base.name='liberty-pedestal';
  const statue=new T.Group();statue.name='liberty-boy-reference-standee';statue.position.set(0,3.47,0);g.add(statue);
  const loader=new T.TextureLoader();
  for(const [file,w,h,back] of [['front',3.9*588/804,3.9,false],['back',3.9*435/658,3.9,true]]){
   const tx=loader.load('uploads/landmarks/liberty-boy-'+file+'.png');tx.encoding=T.sRGBEncoding;tx.anisotropy=8;
   const m=new T.MeshBasicMaterial({map:tx,transparent:true,alphaTest:.42,toneMapped:false,side:T.FrontSide});
   const o=mesh(statue,new T.PlaneGeometry(w,h),m,0,h/2,back?-.008:.008);if(back)o.rotation.y=Math.PI;
   o.name='liberty-boy-'+file;o.castShadow=false;
  }
  g.userData.display={displays};g.userData.footprintRadius=2.70;g.userData.height=7.37;
  updateDisplays(g,0);return g;
 }
 function updateDisplays(g,time){
  const group=g.userData.display;if(!group)return;
  for(const d of group.displays){
   const tick=Math.floor(time*24);if(tick===d.last)continue;d.last=tick;
   const c=d.ctx,w=d.canvas.width,h=d.canvas.height,scene=Math.floor(time/12)%3,t=time%12;
   const circle=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()};
   const ellipse=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
   // Bright, self-lit, full-frame cartoons: ocean / candy space / pet playground.
   const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,['#55c9ff','#a994f7','#8cdeff'][scene]);bg.addColorStop(1,['#b0f4ed','#ffcadb','#e1ffde'][scene]);c.fillStyle=bg;c.fillRect(0,0,w,h);
   if(scene===0){
    for(let j=0;j<3;j++){c.fillStyle=['#6bdfef','#42c9e6','#21afda'][j];c.beginPath();c.moveTo(0,h);for(let x=0;x<=w+12;x+=12)c.lineTo(x,290+j*43+Math.sin(x*.012-time*1.6+j)*15);c.lineTo(w,h);c.fill()}
    const x=w*.5+Math.sin(time*.55)*w*.23,y=190+Math.sin(time*1.7)*29;
    c.save();c.translate(x,y);c.rotate(Math.sin(time)*.08);
    c.fillStyle='#587fdd';c.beginPath();c.moveTo(-112,0);c.lineTo(-190,-62);c.quadraticCurveTo(-210,2,-170,30);c.lineTo(-112,22);c.fill();
    ellipse(0,0,148,85,'#f1fbff');ellipse(-14,38,110,40,'#b6e8ff');ellipse(-15,50,50,16,'#70b5e7');
    circle(89,-15,12,'#214569');circle(93,-20,4,'white');ellipse(101,11,14,8,'#ff9cba');
    c.strokeStyle='#214569';c.lineWidth=4;c.beginPath();c.arc(102,9,18,.2,1.8);c.stroke();
    c.strokeStyle='#f4fdff';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(16,-79);c.quadraticCurveTo(14,-132,45,-137);c.moveTo(15,-94);c.quadraticCurveTo(-7,-140,-32,-132);c.stroke();c.restore();
    for(let i=0;i<20;i++){const x=(i*113+Math.sin(time+i)*15)%w,y=h-(time*46+i*61)%h;c.strokeStyle='#ffffffb8';c.lineWidth=3;c.beginPath();c.arc(x,y,5+i%4*3,0,7);c.stroke()}
   }else if(scene===1){
    for(let i=0;i<28;i++){const x=(i*137+time*12)%w,y=55+(i*67)%320;circle(x,y,2+2*Math.sin(time*3+i)**2,'#fff9c9')}
    const px=w*.70,py=180+Math.sin(time)*25;circle(px,py,92,'#ffd47e');
    c.strokeStyle='#fff4da';c.lineWidth=18;c.beginPath();c.ellipse(px,py,143,30,-.25,0,7);c.stroke();circle(px-27,py-14,9,'#795b77');circle(px+27,py-14,9,'#795b77');
    const x=w*.25+Math.sin(time)*48,y=190+Math.cos(time*1.5)*50;c.save();c.translate(x,y);c.rotate(.3*Math.sin(time));
    ellipse(0,0,56,100,'#fff7ee');circle(0,-28,29,'#63c9ef');circle(0,-28,18,'#c7f4ff');
    c.fillStyle='#ff789c';c.beginPath();c.moveTo(-45,35);c.lineTo(-78,90);c.lineTo(-30,74);c.lineTo(30,74);c.lineTo(78,90);c.lineTo(45,35);c.fill();
    ellipse(0,108,20+Math.sin(time*15)*5,45,'#ffca5d');ellipse(0,100,11,25,'#fff5b1');c.restore();
   }else{
    c.fillStyle='#a7e28c';c.fillRect(0,300,w,140);circle(w-95,76,45,'#ffe67b');
    for(let i=0;i<6;i++){const x=(i*220-time*23+w*10)%(w+180)-90;ellipse(x,65+i%2*35,60,19,'#ffffffcc')}
    for(let k=0;k<3;k++){const x=w*(k+1)/4+Math.sin(time*1.5+k)*35,y=225-Math.abs(Math.sin(time*3+k))*58,col=['#fff0df','#e6edff','#ffd7b2'][k];
     c.save();c.translate(x,y);ellipse(0,60,58,47,col);
     c.fillStyle=col;c.beginPath();c.moveTo(-61,-20);c.lineTo(-53,-79);c.lineTo(-12,-44);c.lineTo(12,-44);c.lineTo(53,-79);c.lineTo(61,-20);c.fill();ellipse(0,0,70,56,col);
     circle(-25,-6,10,'#4c455e');circle(25,-6,10,'#4c455e');circle(-22,-10,3,'white');circle(28,-10,3,'white');ellipse(0,12,8,6,'#e78ca4');
     ellipse(-47,15,13,8,'#ffadc2');ellipse(47,15,13,8,'#ffadc2');c.strokeStyle='#84607b';c.lineWidth=3;c.beginPath();c.arc(0,15,16,.2,2.9);c.stroke();c.restore()}
    for(let i=0;i<10;i++)circle((i*161+time*45)%w,330+Math.sin(time*2+i)*36,8,['#ffb6cd','#fff4a0','#b9aeff'][i%3]);
   }
   // Persistent TV channel badge and progress bar make the motion read as a broadcast.
   c.fillStyle='#ffffffdf';c.fillRect(24,20,192,43);c.fillStyle='#355a70';c.font='800 23px sans-serif';c.fillText('YUNSEUL TV',38,49);
   circle(w-37,38,7,'#ff597b');c.fillStyle='#ffffff88';c.fillRect(24,h-17,w-48,4);c.fillStyle='#fff';c.fillRect(24,h-17,(w-48)*t/12,4);
   d.texture.needsUpdate=true;
  }
 }
 function buildShoppingCenter(T){
  const {mat,mesh,box,tube}=tools(T),g=new T.Group();g.name='rose-arcade-shopping-center';
  const ivory=mat(0xfff2e3),rose=mat(0xe7a7aa),gold=mat(0xd8b583,{metalness:.5}),glass=mat(0x83c9cf,{metalness:.32,roughness:.18,emissive:0x356572,emissiveIntensity:.12});
  box(g,ivory,3.15,.12,2.12,0,.05,0);box(g,glass,2.84,1.9,1.78,0,1.03,0);
  for(const y of [.18,1.2,2.03])box(g,ivory,3.04,.12,1.98,0,y,0);
  for(const x of [-1.28,-.65,0,.65,1.28]){
   box(g,ivory,.085,1.76,.12,x,1.05,.96);
   const arch=mesh(g,new T.TorusGeometry(.28,.048,8,24,Math.PI),rose,x,1.59,.98);
   for(const dx of [-.28,.28])box(g,rose,.06,.58,.07,x+dx,1.29,.98);
  }
  box(g,gold,.78,.07,.34,0,.91,1.07);
  const roof=mesh(g,new T.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI/2),glass,0,2.1,0);roof.scale.set(1.18,.53,.79);
  for(const x of [-1.34,1.34]){box(g,rose,.32,.24,.36,x,2.21,.63);mesh(g,new T.SphereGeometry(.23,12,10),mat(0x91b79a),x,2.42,.63)}
  tube(g,gold,[new T.Vector3(-1.48,2.14,.96),new T.Vector3(0,2.35,1.03),new T.Vector3(1.48,2.14,.96)],.026);
  g.userData.footprintRadius=2.0;return g;
 }
 function buildOpera(T){
  const {mat,mesh,box,tube}=tools(T),g=new T.Group();g.name='pearl-shell-opera-house';
  const marble=mat(0xf7f1e7),pearl=mat(0xfffbef,{side:T.DoubleSide,roughness:.3,metalness:.12,emissive:0xfff5e6,emissiveIntensity:.13}),gold=mat(0xd5ad6a,{metalness:.5,roughness:.3});
  const glass=mat(0x6eabbc,{metalness:.38,roughness:.15,emissive:0x396b86,emissiveIntensity:.2}),dark=mat(0x365565),light=mat(0xffdba0,{emissive:0xffc67c,emissiveIntensity:.4});
  mesh(g,new T.CylinderGeometry(2.16,2.25,.14,64),marble,0,.03,0);
  mesh(g,new T.CylinderGeometry(1.99,2.08,.10,64),gold,0,.15,0);
  mesh(g,new T.CylinderGeometry(1.94,1.99,.10,64),marble,0,.24,0);
  box(g,glass,2.8,.76,1.95,0,.67,-.03);
  for(let i=-5;i<=5;i++)box(g,gold,.032,.76,.04,i*.25,.67,.96);
  box(g,dark,.64,.62,.07,0,.62,1.0);
  for(const x of [-.16,.16]){box(g,glass,.28,.57,.035,x,.62,1.05);box(g,gold,.018,.13,.02,x*.35,.63,1.08)}
  // Six sweeping, double-sided pearl shells. Geometry is generated once, not per frame.
  function shell(cx,cz,width,depth,height,tilt){
   const group=new T.Group();group.rotation.z=tilt;group.position.set(cx,0,cz);g.add(group);
   const at=(u,v)=>{const s=Math.max(0,Math.sin(Math.PI*v));return new T.Vector3(u*width*Math.pow(s,.32),.91+height*Math.pow(s,.85)*(1-.42*u*u), (v-.5)*depth)};
   const vertices=[],indices=[],nu=16,nv=30;
   for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const p=at(i/nu*2-1,j/nv);vertices.push(p.x,p.y,p.z)}
   for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;indices.push(a,b,a+1,a+1,b,b+1)}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(group,geo,pearl);
   for(const u of [-1,-.48,0,.48,1]){const pts=[];for(let i=0;i<=30;i++)pts.push(at(u,i/30));tube(group,u===-1||u===1?gold:marble,pts,u===0?.014:.019)}
  }
  shell(-.68,-.22,.66,2.75,2.06,.13);shell(.68,-.22,.66,2.75,2.06,-.13);
  shell(-1.16,.14,.43,2.28,1.44,.21);shell(1.16,.14,.43,2.28,1.44,-.21);
  shell(-.34,.45,.44,2.02,1.37,.08);shell(.34,.45,.44,2.02,1.37,-.08);
  for(const side of [-1,1]){
   box(g,gold,.045,.48,.045,side*1.48,.56,1.16);
   mesh(g,new T.SphereGeometry(.09,12,8),light,side*1.48,.84,1.16);
  }
  g.userData.footprintRadius=2.35;
  return g;
 }
 const api={chooseSites,buildTheater,buildOpera,buildShoppingCenter,updateDisplays};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.CultureLandmarks=api;
})(typeof globalThis!=='undefined'?globalThis:this);
