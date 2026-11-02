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

test('Local midnight starts sleep; six in the morning ends automatic sleep entry', () => {
  for (const [hour, expected] of [[0, true], [1, true], [5, true], [6, false], [12, false], [23, false]]) {
    assert.equal(home.isBedtime({ getHours: () => hour }), expected, `hour=${hour}`);
  }
});

test('UFO wait preserves the existing 50–110 second distribution', () => {
  assert.equal(home.skyTiming.ufoWait(() => 0), 50);
  assert.equal(home.skyTiming.ufoWait(() => 1), 110);
  assert.equal(home.skyTiming.ufoInitial, 20);
});

test('Meteor start intervals include UFO animation duration and are exactly half', () => {
  const sky = home.skyTiming;
  for (let i = 0; i <= 1000; i++) {
    const random = () => i / 1000;
    assert.equal(sky.meteorWait(random) * 2, sky.ufoWait(random) + sky.ufoDuration);
  }
  assert.equal(sky.meteorWait(() => .5), 44.2);
});

test('The shared sky cadence is immutable', () => {
  assert.ok(Object.isFrozen(home.skyTiming));
});
