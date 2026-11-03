// Run with: node --test tests/cozy-home.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'cozy-home.js'), 'utf8'), context);
const home = context.window.YunseulHome;
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`);

test('Bedtime is local midnight inclusive to 07:00 exclusive', () => {
  for(let hour=0;hour<24;hour++) assert.equal(home.isBedtime({getHours:()=>hour}),hour<7,`hour=${hour}`);
  assert.equal(home.isBedtime(new Date(2026,10,2,6,59,59,999)),true);
  assert.equal(home.isBedtime(new Date(2026,10,2,7,0,0,0)),false);
});
test('Daytime UFO waits retain the original 50–110 second distribution', () => {
  assert.equal(home.skyTiming.ufoWait(()=>0),50);
  assert.equal(home.skyTiming.ufoWait(()=>1),110);
  assert.equal(home.skyTiming.ufoInitial,20);
});
test('Every nighttime UFO start-to-start interval is half the daytime interval', () => {
  const sky=home.skyTiming;
  for(let i=0;i<=1000;i++) {
    const random=()=>i/1000;
    close((sky.ufoWait(random,true)+sky.ufoDuration)*2,sky.ufoWait(random,false)+sky.ufoDuration);
    assert(sky.ufoWait(random,true)>0);
  }
  close(sky.ufoWait(()=>.5,true)+sky.ufoDuration,44.2);
});
test('Meteor frequency is 30 percent of the nighttime UFO frequency, not 30 percent of its wait', () => {
  const sky=home.skyTiming;assert.equal(sky.meteorProbability,.30);
  for(let i=0;i<=1000;i++) {
    const random=()=>i/1000;
    close((1/sky.meteorWait(random))/(1/(sky.ufoWait(random,true)+sky.ufoDuration)),.30);
  }
  close(sky.meteorWait(()=>.5),147.33333333333334);
});
test('Long-run average intervals preserve the frequency ratio', () => {
  const sky=home.skyTiming;let day=0,night=0,meteor=0;
  for(let i=0;i<10000;i++) {
    const random=()=>((i*7919)%10000)/10000;
    day+=sky.ufoWait(random)+sky.ufoDuration;
    night+=sky.ufoWait(random,true)+sky.ufoDuration;
    meteor+=sky.meteorWait(random);
  }
  close(night/day,.5);close(night/meteor,.3);
});
test('The shared sky cadence is immutable', () => assert.ok(Object.isFrozen(home.skyTiming)));
