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
  let confirmations=0;page.on('dialog',async d=>{confirmations++;await d.dismiss();});
  await page.evaluate(()=>__yunseulHomeTest.goHome(false));
  assert(!(await state()).open);
  await page.waitForSelector('#homeEntryDialog[open]',{timeout:180000});
  assert(!(await state()).open);assert.equal(confirmations,0);
  await page.screenshot({path:path.join(root,'home-entry-preview.png')});
  assert.equal(await page.locator(':focus').getAttribute('value'),'cancel');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#homeEntryDialog').open);
  assert(!(await state()).open);
  await page.evaluate(()=>__yunseulHomeTest.entryPrompt());
  await page.click('.home-entry-cancel');
  await page.waitForFunction(()=>!document.querySelector('#homeEntryDialog').open);
  assert(!(await state()).open);
  await page.evaluate(()=>__yunseulHomeTest.entryPrompt());
  await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('value'),'enter');
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>__yunseulHomeTest.room.isOpen);
  assert.equal(confirmations,0);assert(!(await state()).sleeping);
  console.log('PASS exterior manual entry: walk, styled layer, Escape/cancel, keyboard entry, no native confirm');
  // Observe the actual intermediate stages, not just the final sleeping pose.
  const sequential=await page.evaluate(()=>{
    const room=__yunseulHomeTest.room;room.sleep(0);
    let watch=false,following=false,settling=false,watchTicks=0;
    for(let i=0;i<2400;i++) {
      room.tick(1/60);const s=room.state;
      if(s.stage==='watch'){watch=true;watchTicks++;if(s.boyAwake||!s.girlAwake)throw Error('girl did not watch awake');}
      if(s.stage==='girl-walk')following=true;
      if(s.stage==='girl-settle'){settling=true;if(s.boyAwake||!s.girlAwake)throw Error('invalid sequential settling');}
      if(s.sleeping&&!s.journey)return {watch,following,settling,watchTicks};
    }
    throw Error('sequential sleep never completed');
  });
  assert(sequential.watch&&sequential.following&&sequential.settling);assert(sequential.watchTicks>=98);
  console.log('PASS sequential sleep: boy lies first, girl watches 1.65 seconds, walks, then lies down');
  // Wake during watch and during the girl settling; no stale delayed sleep may fire.
  for(const stage of ['watch','girl-settle']) {
    await page.evaluate(stage=>{
      const r=__yunseulHomeTest.room;r.wake();for(let i=0;i<120;i++)r.tick(1/60);r.sleep(1);
      for(let i=0;i<2400;i++){r.tick(1/60);if(r.state.stage===stage){r.wake();break;}}
      for(let i=0;i<240;i++)r.tick(1/60);
      if(r.state.sleeping||r.state.journey||r.state.characters.some(c=>!c.awake))throw Error('wake interruption failed: '+stage);
    },stage);
  }
  console.log('PASS interrupted sequential sleep and alternate bed: both children remain awake');
  await page.click('#homeExit');await step(25);
  assert(!(await state()).open);
  await page.evaluate(()=>{__yunseulHomeTest.world.quaternion.identity();__yunseulHomeTest.idle();});
  await page.waitForFunction(()=>__yunseulHomeTest.room.isOpen,null,{timeout:180000});
  assert.equal(confirmations,0);assert.equal((await state()).journey,'bed');
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
  const brightness=await page.evaluate(()=>{
    const t=__yunseulHomeTest;t.day();t.room.tick(0);const day=t.room.state.lights;
    t.room.sleep(0);for(let i=0;i<2400;i++)t.room.tick(1/60);
    const nap=t.room.state.lights;
    if(t.room.state.characters.some(c=>c.awake))throw Error('day nap incomplete');
    t.night();t.room.tick(0);const night=t.room.state.lights;
    t.day();t.room.tick(0);return {day,nap,night};
  });
  assert(brightness.nap.ambient>brightness.night.ambient*3);
  assert(brightness.nap.ambient<brightness.day.ambient);assert(brightness.nap.lamp>0);assert.equal(brightness.night.lamp,0);
  await page.screenshot({path:path.join(root,'home-day-nap-preview.png')});
  console.log('PASS daytime nap stays warm and brighter; night sleep remains dim');
  await page.evaluate(()=>__yunseulHomeTest.room.leave());
  await page.setViewportSize({width:360,height:740});
  await page.evaluate(()=>__yunseulHomeTest.entryPrompt());
  const bounds=await page.locator('#homeEntryDialog').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=360);
  await page.screenshot({path:path.join(root,'home-entry-mobile-preview.png')});
  await page.mouse.click(3,3);await page.waitForFunction(()=>!document.querySelector('#homeEntryDialog').open);
  assert(!(await state()).open);
  console.log('PASS mobile layer fits viewport and backdrop cancels');
  assert.deepEqual(errors,[]);console.log('PASS no uncaught JavaScript errors');
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
