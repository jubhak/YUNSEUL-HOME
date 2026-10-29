/* Procedural cinema interior. The live iframe is aligned with a real 3D screen.
 * No video texture: cross-origin YouTube retains its native controls/subtitles. */
(function(root){
 'use strict';
 function mount(host,screen){
  const T=root.THREE,scene=new T.Scene();
  scene.background=new T.Color(0x102c32);
  const camera=new T.PerspectiveCamera(48,1,.1,100);
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(root.devicePixelRatio||1,2));
  renderer.outputEncoding=T.sRGBEncoding;
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  const materials=[],geometries=[];
  const mat=(color,extra)=>{const m=new T.MeshStandardMaterial(Object.assign({color,roughness:.7},extra));materials.push(m);return m};
  const pearl=mat(0xfff0d8),gold=mat(0xd8b583,{metalness:.5,roughness:.3}),mint=mat(0x88bcae);
  const wall=mat(0x234b4e),wood=mat(0x25424a),rose=mat(0xce8296),dark=mat(0x10252d);
  const glow=mat(0xffdfaa,{emissive:0xffc879,emissiveIntensity:.7});
  const screenMat=mat(0x03070a,{emissive:0x10252d});
  function box(m,w,h,d,x,y,z){const geo=new T.BoxGeometry(w,h,d);geometries.push(geo);const o=new T.Mesh(geo,m);o.position.set(x,y,z);scene.add(o);return o}
  scene.add(new T.HemisphereLight(0xe3f8ff,0x26302e,.85));
  const light=new T.PointLight(0xb5e8ef,1.35,32);light.position.set(0,5,-3);scene.add(light);
  const warm=new T.PointLight(0xffd6a0,.8,35);warm.position.set(0,7,7);scene.add(warm);
  box(wall,23,12,.4,0,4,-6);box(wood,23,.3,30,0,-1,6);
  box(dark,23,.3,30,0,10,6);
  for(const side of [-1,1]){
   box(wall,.4,12,30,side*11.5,4,6);
   for(let i=0;i<8;i++){
    box(i%2?mint:pearl,.16,7.5,.12,side*11.2,3.5,-4+i*2.8);
    box(glow,.19,.08,1.5,side*11.05,.1,-3+i*2.8);
   }
   // Softly faceted proscenium pillars and gold edge trims echo the pavilion outside.
   box(mint,.9,9,.65,side*8,3.5,-5.45);
   box(gold,.1,9,.72,side*7.48,3.5,-5.4);
   for(let i=0;i<5;i++)box(i%2?rose:wall,.32,8,.5,side*(6.85+i*.23),3.4,-5.35);
  }
  box(pearl,16.8,.6,.8,0,7.8,-5.45);box(gold,16.8,.08,.86,0,7.43,-5.4);
  // Screen is parallel to the camera, so projecting its corners gives an exact DOM rectangle.
  box(gold,12.5,7.25,.20,0,3.1,-5.2);
  box(dark,12.28,7.03,.22,0,3.1,-5.05);
  box(screenMat,12,6.75,.05,0,3.1,-4.9);
  box(pearl,15,.25,2.3,0,-.6,-4.2);box(gold,15,.07,2.35,0,-.43,-4.2);
  for(let row=0;row<4;row++){
   const z=2+row*2.35,y=-.65+row*.16;
   box(wood,21,.22,2.35,0,y-.15,z);
   for(let col=-5;col<=5;col++){
    if(col===0)continue; // illuminated central aisle
    const x=col*1.7,m=row%2?mint:rose;
    box(dark,.95,.6,.8,x,y+.4,z);
    box(m,1.2,.28,1.0,x,y+.8,z);
    box(m,1.22,1.25,.3,x,y+1.35,z+.45);
    for(const s of [-1,1])box(gold,.13,.38,.95,x+s*.66,y+1,z);
   }
   for(const s of [-1,1])box(glow,.08,.035,1.6,s*.87,y+.02,z);
  }
  let disposed=false;
  function resize(){
   if(disposed)return;
   const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
   camera.aspect=w/h;
   // Keep the screen between header and seats, including portrait/short landscape phones.
   const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));
   const dist=Math.max(12/(2*tan*camera.aspect*.83),6.75/(2*tan*.60));
   camera.position.set(0,3.1,-4.875+dist);camera.lookAt(0,3.1,-5);
   camera.far=Math.max(100,dist+60);camera.updateProjectionMatrix();camera.updateMatrixWorld();
   renderer.setSize(w,h,false);
   const tl=new T.Vector3(-6,6.475,-4.875).project(camera);
   const br=new T.Vector3(6,-.275,-4.875).project(camera);
   Object.assign(screen.style,{left:(tl.x+1)*w/2+'px',top:(1-tl.y)*h/2+'px',width:(br.x-tl.x)*w/2+'px',height:(tl.y-br.y)*h/2+'px'});
   renderer.render(scene,camera);
  }
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  return {resize,dispose(){disposed=true;observer.disconnect();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()}};
 }
 root.YunseulCinema={mount};
})(window);
