/* Branch-led cherry trees and proximity-driven petals. Three.js r128, no image assets. */
(()=>{
'use strict';
window.SakuraGarden={create(T,{radius=6}={}){
 const trees=[],up=new T.Vector3(0,1,0),dummy=new T.Object3D(),player=new T.Vector3(),normal=new T.Vector3();
 const bark=new T.MeshStandardMaterial({color:0x654438,roughness:.95});
 const flowers=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.85});
 const petalMaterial=new T.MeshStandardMaterial({color:0xffc9df,side:T.DoubleSide,roughness:.8});
 const petalShape=new T.Shape();
 petalShape.moveTo(0,-.55);petalShape.bezierCurveTo(-.7,-.05,-.5,.7,-.12,.48);
 petalShape.lineTo(0,.36);petalShape.lineTo(.12,.48);petalShape.bezierCurveTo(.5,.7,.7,-.05,0,-.55);
 const petalGeometry=new T.ShapeGeometry(petalShape,5);
 const palette=[0xfff2f7,0xffdce9,0xffc2da,0xffa9cd].map(c=>new T.Color(c));
 // Merge real geometry once, instead of issuing one draw call for every flower.
 function batch(){const positions=[],normals=[],colors=[];return {
  add(geometry,matrix,color){const geo=geometry.index?geometry.toNonIndexed():geometry.clone();geo.applyMatrix4(matrix);
   positions.push(...geo.attributes.position.array);normals.push(...geo.attributes.normal.array);
   if(color)for(let i=0;i<geo.attributes.position.count;i++)colors.push(color.r,color.g,color.b);geo.dispose();},
  mesh(material){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));if(colors.length)geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeBoundingSphere();const mesh=new T.Mesh(geo,material);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
 };}
 // A single five-petal flower with small gaps and a contrasting center.
 const flowerShape=new T.Shape();
 for(let i=0;i<=40;i++){const a=i*Math.PI*2/40,r=.74+.26*Math.cos(a*5);const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)flowerShape.moveTo(x,y);else flowerShape.lineTo(x,y);}
 const flowerGeometry=new T.ShapeGeometry(flowerShape,1),centerGeometry=new T.CircleGeometry(.15,7),gold=new T.Color(0xd889a2);
 function grow(g,rnd){
  g.name='sakura-gap-tree';const branches=batch(),bloom=batch(),tips=[];
  function limb(a,b,r1,r2){const delta=b.clone().sub(a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,delta.clone().normalize());dummy.scale.set(1,1,1);dummy.updateMatrix();const geo=new T.CylinderGeometry(r2,r1,delta.length(),7);branches.add(geo,dummy.matrix);geo.dispose();}
  const lean=(rnd()-.5)*.22,base=new T.Vector3(0,0,0),fork=new T.Vector3(lean,.73,0);
  limb(base,new T.Vector3(lean*.3,.34,.04),.13,.105);limb(new T.Vector3(lean*.3,.34,.04),fork,.105,.076);
  for(let i=0;i<6;i++){
   const angle=i*Math.PI*2/6+(rnd()-.5)*.5,reach=.66+rnd()*.38;
   const elbow=new T.Vector3(Math.cos(angle)*reach*.48+lean,1.08+rnd()*.2,Math.sin(angle)*reach*.48);
   const tip=new T.Vector3(Math.cos(angle)*reach,1.48+rnd()*.43,Math.sin(angle)*reach);
   limb(fork,elbow,.065,.038);limb(elbow,tip,.038,.016);
   for(let j=0;j<4;j++){
    const a=angle+(j-1.5)*.45,end=tip.clone().add(new T.Vector3(Math.cos(a)*(.18+rnd()*.28),.08+rnd()*.24,Math.sin(a)*(.18+rnd()*.28)));
    const start=elbow.clone().lerp(tip,.35+j*.16);limb(start,end,.019,.006);tips.push(end);
    // Open, irregular sprays follow each twig; no opaque spherical crown.
    for(let k=0;k<42;k++){
     const t=rnd(),p=start.clone().lerp(end,t);p.x+=(rnd()-.5)*.36;p.y+=(rnd()-.5)*.3;p.z+=(rnd()-.5)*.36;
     dummy.position.copy(p);dummy.rotation.set(rnd()*Math.PI,rnd()*Math.PI*2,rnd()*Math.PI);dummy.scale.setScalar(.052+rnd()*.03);dummy.updateMatrix();bloom.add(flowerGeometry,dummy.matrix,palette[Math.floor(rnd()*palette.length)]);
     dummy.translateZ(.007);dummy.updateMatrix();bloom.add(centerGeometry,dummy.matrix,gold);
    }
   }
  }
  g.add(branches.mesh(bark),bloom.mesh(flowers));
  const count=64,fall=new T.InstancedMesh(petalGeometry,petalMaterial,count);fall.instanceMatrix.setUsage(T.DynamicDrawUsage);fall.frustumCulled=false;fall.visible=false;fall.name='sakura-falling-petals';g.add(fall);
  const particles=Array.from({length:count},()=>({age:rnd()*7,life:5+rnd()*3,tip:tips[Math.floor(rnd()*tips.length)].clone(),phase:rnd()*Math.PI*2,size:.045+rnd()*.035}));
  const state={root:g,fall,particles,rnd,strength:0};trees.push(state);
 }
 function update(dt,time,world,character){
  if(!character)return;world.updateWorldMatrix(true,false);character.getWorldPosition(player);world.worldToLocal(player);normal.copy(player).normalize();
  for(const tree of trees){
   const g=tree.root;if(!g.userData.n)continue;
   const distance=radius*Math.acos(T.MathUtils.clamp(normal.dot(g.userData.n),-1,1));
   const target=1-T.MathUtils.smoothstep(distance,1.1,3.6);tree.strength+=(target-tree.strength)*Math.min(1,dt*3);
   tree.fall.visible=tree.strength>.012;if(!tree.fall.visible)continue;
   const scale=g.scale.x;
   for(let i=0;i<tree.particles.length;i++){
    const p=tree.particles[i];p.age+=dt;if(p.age>=p.life){p.age%=p.life;}
    const t=p.age/p.life,wind=.18*p.age+.11*Math.sin(time*.8+p.phase);
    const x=p.tip.x+wind+.16*Math.sin(p.age*2.4+p.phase),z=p.tip.z+.17*p.age+.17*Math.cos(p.age*1.8+p.phase);
    // Follow the curved planet surface, not a flat plane through the tree.
    const ground=(Math.sqrt(Math.max(0,(radius+.012)**2-scale*scale*(x*x+z*z)))-(radius-.03))/scale;
    const y=T.MathUtils.lerp(p.tip.y,ground,t)+Math.sin(t*Math.PI)*.12;
    dummy.position.set(x,y,z);dummy.rotation.set(p.phase+p.age*1.6,p.age*.8,Math.sin(p.age*2+p.phase)*.7);
    const fade=Math.min(1,t*8,(1-t)*6)*tree.strength;dummy.scale.setScalar(p.size*Math.max(0,fade));dummy.updateMatrix();tree.fall.setMatrixAt(i,dummy.matrix);
   }
   tree.fall.instanceMatrix.needsUpdate=true;
  }
 }
 return {grow,update,trees};
}};
})();
