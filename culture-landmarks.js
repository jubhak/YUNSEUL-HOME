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
  const {mat,mesh,box,tube}=tools(T),g=new T.Group();g.name='yunseul-cinema-sculpture';
  const pearl=mat(0xfff5ef,{metalness:.23,roughness:.27}),gold=mat(0xe6b882,{metalness:.65,roughness:.28});
  const glass=mat(0x36516e,{metalness:.5,roughness:.17}),light=mat(0xffc9e6,{emissive:0xff88ce,emissiveIntensity:.7});
  // Preserve the former 3.65 x 2.80 site exactly. Height, not land area, grows.
  box(g,pearl,3.65,.16,2.8,0,.04,0);box(g,gold,3.42,.07,2.60,0,.155,0);
  box(g,glass,3.08,2.7,2.24,0,1.58,0);
  box(g,pearl,3.30,.15,2.42,0,1.02,0);box(g,gold,3.32,.045,2.44,0,1.12,0);
  for(const x of [-1.25,1.25])box(g,pearl,.15,.77,.15,x,.59,1.17);
  for(const x of [-.23,.23])box(g,glass,.43,.75,.04,x,.59,1.145);
  box(g,gold,.024,.18,.05,0,.57,1.18);
  box(g,pearl,1.6,.13,.40,0,.97,1.18);
  // A continuous, black-framed second-storey L display spans front + right.
  box(g,glass,3.27,1.60,.07,0,2.06,1.17);box(g,glass,.07,1.60,2.31,1.60,2.06,.035);
  const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=440;
  const ctx=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);texture.encoding=T.sRGBEncoding;
  const frontTex=texture.clone(),sideTex=texture.clone();frontTex.repeat.x=3.2/5.5;sideTex.repeat.x=2.3/5.5;sideTex.offset.x=3.2/5.5;
  const screenMat=t=>new T.MeshBasicMaterial({map:t,toneMapped:false});
  mesh(g,new T.PlaneGeometry(3.2,1.48),screenMat(frontTex),0,2.06,1.212);
  const side=mesh(g,new T.PlaneGeometry(2.3,1.48),screenMat(sideTex),1.642,2.06,.062);side.rotation.y=Math.PI/2;
  for(const y of [1.29,2.83]){box(g,gold,3.30,.035,.045,0,y,1.23);box(g,gold,.045,.035,2.35,1.66,y,.065)}
  // Tapered, twisting pearl ribbons replace repetitive apartment-like floors.
  mesh(g,new T.CylinderGeometry(.38,1.38,4.65,40),glass,0,5.10,-.10).scale.z=.66;
  for(let k=0;k<7;k++){
   const pts=[];for(let j=0;j<=42;j++){const u=j/42,a=k*Math.PI*2/7+u*1.28,r=1.51*(1-u)+.30*u;pts.push(new T.Vector3(Math.cos(a)*r,2.93+u*4.9,Math.sin(a)*r*.70-.1))}
   tube(g,pearl,pts,.105);tube(g,gold,pts.map(v=>v.clone().add(new T.Vector3(.035,0,.015))),.018);
  }
  const crown=mesh(g,new T.TorusGeometry(.47,.065,10,60),gold,0,7.86,-.1);crown.rotation.x=Math.PI/2;
  mesh(g,new T.OctahedronGeometry(.28),light,0,8.28,-.1);
  tube(g,gold,[new T.Vector3(0,7.85,-.1),new T.Vector3(0,8.65,-.1)],.025);
  // Real-time anamorphic animation: one panoramic film mapped over both faces.
  g.userData.display={canvas,ctx,texture,frontTex,sideTex,last:-1};
  g.userData.footprintRadius=2.35;g.userData.height=8.68;return g;
 }
 function updateDisplays(g,time){
  const d=g.userData.display;if(!d||Math.floor(time*24)===d.last)return;d.last=Math.floor(time*24);
  const c=d.ctx,w=d.canvas.width,h=d.canvas.height,corner=w*3.2/5.5;
  c.fillStyle='#08172e';c.fillRect(0,0,w,h);
  const bg=c.createRadialGradient(corner,210,20,corner,210,700);bg.addColorStop(0,'#346e9b');bg.addColorStop(1,'#081326');c.fillStyle=bg;c.fillRect(0,0,w,h);
  // Receding room edges and corner perspective sell the screen's depth.
  c.strokeStyle='#6cbce377';c.lineWidth=3;
  for(let i=0;i<8;i++){const x=i*w/7;c.beginPath();c.moveTo(corner,190);c.lineTo(x,h);c.stroke()}
  c.strokeRect(38,28,w-76,h-56);c.strokeRect(190,75,w-380,h-150);
  const z=(Math.sin(time*.8)+1)/2,x=corner+Math.sin(time*.57)*155,y=210+Math.sin(time*1.1)*40,r=57+z*102;
  c.save();c.translate(x,y);c.rotate(Math.sin(time*.7)*.18);
  c.shadowColor='#79e5ff';c.shadowBlur=30;
  // A luminous pearl-whale swims out of the perspective box and across the seam.
  const body=c.createRadialGradient(-r*.3,-r*.35,4,0,0,r*1.4);body.addColorStop(0,'#ffffff');body.addColorStop(.38,'#b4ecff');body.addColorStop(1,'#547dbd');c.fillStyle=body;
  c.beginPath();c.ellipse(0,0,r*1.5,r*.73,0,0,Math.PI*2);c.fill();
  c.beginPath();c.moveTo(-r*1.15,0);c.quadraticCurveTo(-r*2.2,-r*1.05,-r*2.05,-r*.1);c.quadraticCurveTo(-r*2.45,r*.7,-r*1.15,r*.24);c.fill();
  c.fillStyle='#82acd9';c.beginPath();c.ellipse(0,r*.48,r*.60,r*.17,.45,0,Math.PI*2);c.fill();
  c.shadowBlur=0;c.fillStyle='#14293f';c.beginPath();c.arc(r*.82,-r*.13,r*.065,0,7);c.fill();c.fillStyle='white';c.beginPath();c.arc(r*.84,-r*.15,r*.022,0,7);c.fill();c.restore();
  for(let i=0;i<18;i++){const bx=(i*139+Math.sin(time+i)*25)%w,by=h-((time*38+i*71)%h);c.strokeStyle='#c7f1ff99';c.lineWidth=2;c.beginPath();c.arc(bx,by,4+i%5*2,0,7);c.stroke()}
  c.fillStyle='#e1f7ff';c.font='600 20px sans-serif';c.fillText('YUNSEUL · DREAM IN 3D',54,407);
  d.texture.needsUpdate=d.frontTex.needsUpdate=d.sideTex.needsUpdate=true;
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
