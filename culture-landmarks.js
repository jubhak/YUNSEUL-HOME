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
  const {mat,mesh,box}=tools(T),g=new T.Group();g.name='avenue-franc-five-storey-theater';
  const stone=mat(0xf4e7d2),ivory=mat(0xfff9ed),bronze=mat(0xc49b63,{metalness:.45,roughness:.32}),frame=mat(0x405c65,{metalness:.35});
  const glass=mat(0x87b9c6,{metalness:.3,roughness:.16,emissive:0x466d78,emissiveIntensity:.19}),warm=mat(0xffd99b,{emissive:0xffbc65,emissiveIntensity:.32});
  const green=mat(0x639c77),terracotta=mat(0xd58b69);
  box(g,stone,3.65,.16,2.8,0,.04,0);
  box(g,ivory,3.42,.08,2.60,0,.16,0);
  // Five real, separately modelled floors, with open-air upper terraces.
  for(let floor=0;floor<5;floor++){
   const f=new T.Group();f.name='theater-floor-'+(floor+1);g.add(f);
   const y=.22+floor*.61,depth=2.24-(floor>=3?(floor-2)*.16:0),z=-(2.24-depth)/2,front=z+depth/2;
   box(f,glass,3.08,.50,depth,0,y+.285,z);
   box(f,ivory,3.30,.11,2.42,0,y,0);
   box(f,bronze,3.32,.025,2.44,0,y+.065,0);
   for(let i=-4;i<=4;i++)box(f,i%2?bronze:ivory,.045,.50,.07,i*.365,y+.285,front+.02);
   for(const side of [-1,1]){
    for(const end of [-1,1])box(f,stone,.13,.51,.10,side*1.56,y+.285,z+end*depth/2);
    for(let k=0;k<4;k++)box(f,bronze,.065,.5,.035,side*1.55,y+.285,z-depth/2+depth*(k+1)/5);
   }
   if(floor===0){
    box(f,frame,.82,.49,.09,0,y+.25,front+.07);
    for(const side of [-1,1]){box(f,glass,.36,.44,.025,side*.2,y+.25,front+.125);box(f,bronze,.015,.14,.03,side*.07,y+.27,front+.15)}
   }else{
    box(f,bronze,3.18,.035,.10,0,y+.19,1.24);
    for(const side of [-1,1])box(f,warm,.3,.32,.035,side*1.25,y+.28,front+.07);
   }
   if(floor>=3){
    for(const x of [-1.12,1.12]){box(f,terracotta,.55,.10,.22,x,y+.12,1.09);box(f,green,.52,.13,.19,x,y+.22,1.09)}
    box(f,bronze,3.22,.025,.025,0,y+.32,1.23);
    for(const x of [-1.58,-.78,0,.78,1.58])box(f,bronze,.02,.28,.02,x,y+.19,1.23);
   }
  }
  box(g,ivory,3.38,.13,2.46,0,3.29,0);
  box(g,bronze,3.40,.035,2.48,0,3.37,0);
  // Rooftop pergola, understated lighting and a sheltered street-facing entrance.
  for(const x of [-1.25,1.25])for(const z of [-.73,.65])box(g,bronze,.035,.27,.035,x,3.52,z);
  for(let i=0;i<9;i++)box(g,ivory,.07,.04,1.52,-1.28+i*.32,3.67,-.04);
  box(g,bronze,1.54,.055,.55,0,.84,1.30);
  box(g,warm,1.45,.018,.45,0,.805,1.30);
  for(const side of [-1,1]){
   box(g,stone,.44,.22,.28,side*1.44,.28,1.16);
   mesh(g,new T.SphereGeometry(.22,12,8),green,side*1.44,.48,1.16).scale.set(1,.65,.7);
  }
  g.userData.footprintRadius=2.35;g.userData.floorCount=5;
  return g;
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
 const api={chooseSites,buildTheater,buildOpera};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.CultureLandmarks=api;
})(typeof globalThis!=='undefined'?globalThis:this);
