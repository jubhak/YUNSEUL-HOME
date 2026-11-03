// Local integration test: npm install --no-save playwright three@0.128.0
// npx playwright install chromium && node tests/home-browser.cjs
// Starts its own static server; mocks ONLY API responses and the CDN Three.js script.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const server = http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,buf)=>{
    if(err){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(buf);
  });
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.route('**/api/**',r=>r.fulfill({json:{ok:true,items:[],unread:0}}));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.addInitScript(()=>{
    const native=performance.now.bind(performance);window.__testTimeOffset=0;
    Object.defineProperty(performance,'now',{value:()=>native()+window.__testTimeOffset});
  });
  await page.clock.setFixedTime(new Date('2026-11-02T02:00:00'));
  await page.goto(`http://127.0.0.1:${server.address().port}/?homeTest=1`);
  await page.waitForFunction(()=>window.__yunseulHomeTest?.room.state.sleeping,null,{timeout:60000});
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#load')).visibility==='hidden');
  const state=()=>page.evaluate(()=>__yunseulHomeTest.room.state);
  const step=seconds=>page.evaluate(seconds=>{for(let i=0;i<seconds*60;i++)__yunseulHomeTest.room.tick(1/60);},seconds);
  let s=await state();assert.equal(s.sleeping,true);assert(s.pets.every(p=>p.resting&&p.eyesClosed));assert.equal(s.lights.lamp,0);assert(s.lights.moon>0);
  console.log('PASS bedtime arrival: both children and both pets sleeping under moonlight');
  const floor=await page.evaluate(()=>__yunseulHomeTest.room.screenPoint('floor'));
  await page.mouse.click(floor.x,floor.y);await step(2);
  s=await state();assert(s.characters.every(c=>c.awake));assert(!s.sleeping);
  console.log('PASS click wake: boy wakes first and girl follows');
  const before=s.characters.map(c=>c.position);
  await page.mouse.click(floor.x,floor.y);await step(2);
  s=await state();assert(Math.hypot(s.characters[0].position[0]-before[0][0],s.characters[0].position[2]-before[0][2])>.2);
  const boyDelta=s.characters[0].position.map((n,i)=>n-before[0][i]),girlDelta=s.characters[1].position.map((n,i)=>n-before[1][i]);
  assert(Math.hypot(boyDelta[0]-girlDelta[0],boyDelta[2]-girlDelta[2])>.1);
  console.log('PASS independent movement: only boy receives click goal');
  const camera=s.camera;
  await page.mouse.move(800,600);await page.mouse.down({button:'right'});await page.mouse.move(1030,650,{steps:5});await page.mouse.up({button:'right'});
  s=await state();assert.notDeepEqual(s.camera,camera);assert(s.characters.every(c=>c.awake));
  console.log('PASS right-button orbit without movement/wake commands');
  await page.evaluate(()=>{window.__testTimeOffset+=61000;__yunseulHomeTest.room.tick(0);});
  assert.equal((await state()).journey,'bed');await step(25);
  s=await state();assert(s.sleeping);assert(s.pets.every(p=>p.resting));
  console.log('PASS 60-second interior idle: walk, settle, sleep, pets follow and lie down');
  const door=await page.evaluate(()=>__yunseulHomeTest.room.screenPoint('door'));
  // The actual 3D door must route the boy before switching scenes.
  await page.mouse.click(door.x,door.y);assert((await state()).open);assert.equal((await state()).journey,'exit');
  await step(25);assert(!(await state()).open);
  console.log('PASS exit: no scene change until boy reaches door');
  // House clicking from a distance must walk BEFORE asking for confirmation.
  await page.evaluate(()=>{__yunseulHomeTest.world.quaternion.identity();});
  let confirmations=0;page.on('dialog',async d=>{assert.equal(d.message(),'집 안으로 들어갈까요?');confirmations++;await d.accept();});
  await page.evaluate(()=>__yunseulHomeTest.goHome(false));
  assert(!(await state()).open);
  await page.waitForFunction(()=>__yunseulHomeTest.room.isOpen,null,{timeout:180000});
  assert.equal(confirmations,1);assert(!(await state()).sleeping);
  console.log('PASS exterior manual entry: far-away walk, then confirmation, then interior');
  await page.click('#homeExit');await step(25);
  assert(!(await state()).open);
  await page.evaluate(()=>{__yunseulHomeTest.world.quaternion.identity();__yunseulHomeTest.idle();});
  await page.waitForFunction(()=>__yunseulHomeTest.room.isOpen,null,{timeout:180000});
  assert.equal(confirmations,1);assert.equal((await state()).journey,'bed');
  await step(30);s=await state();assert(s.sleeping&&s.pets.every(p=>p.resting));
  console.log('PASS AI return: exterior idle, auto walk/entry without dialog, doorstep-to-bed sleep');
  // Right-drag at night should never wake the sleepers.
  await page.mouse.move(650,550);await page.mouse.down({button:'right'});await page.mouse.move(700,560);await page.mouse.up({button:'right'});
  assert((await state()).sleeping);
  await page.screenshot({path:process.env.HOME_SCREENSHOT||path.join(root,'home-night-preview.png')});
  // Re-open in daytime after changing the clock; do not force daytime users into bed.
  await page.clock.setFixedTime(new Date('2026-11-02T07:00:00'));await step(2);assert(!(await state()).sleeping);
  console.log('PASS 07:00 boundary: sleepers wake automatically');
  await page.evaluate(()=>{
    const t=__yunseulHomeTest;t.night();const m=t.meteors;m.update(0);
    const count=m.state.count;m.update(m.state.wait+.001);
    if(m.state.count!==count+1)throw Error('meteor failed to spawn at night');
    t.day();m.update(1000);
    if(m.state.active||m.state.count!==count+1)throw Error('meteor appeared during daytime');
    t.night();
  });
  console.log('PASS meteors spawn at night only');
  assert.deepEqual(errors,[]);console.log('PASS no uncaught JavaScript errors');
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
