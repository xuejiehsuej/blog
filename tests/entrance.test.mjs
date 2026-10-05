import {test} from 'node:test';
import assert from 'node:assert/strict';
test('a hidden entrance needs five consecutive taps and resets after gaps',async()=>{
  const {createKnock}=await import('../assets/entrance.js');
  const knock=createKnock();
  for(const t of [0,200,400,600])assert.equal(knock(t),false);
  assert.equal(knock(800),true);
  assert.equal(knock(1000),false);
  assert.equal(knock(2500),false);
  for(const t of [2700,2900,3100])assert.equal(knock(t),false);
  assert.equal(knock(3300),true);
});
