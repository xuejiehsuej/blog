import {test} from 'node:test';
import assert from 'node:assert/strict';
test('encrypted archive roundtrips, hides text, rejects wrong passwords and tampering',async()=>{
  const {seal,unseal}=await import('../assets/crypto.js');
  const data=[{title:'未公开的想法',body:'只在解锁后显示'}];
  const encrypted=await seal(data,'雨停之后');
  assert.ok(!JSON.stringify(encrypted).includes(data[0].title));
  assert.deepEqual(await unseal(encrypted,'雨停之后'),data);
  await assert.rejects(()=>unseal(encrypted,'错误口令'));
  await assert.rejects(()=>unseal({...encrypted,cipher:'AAAA'+encrypted.cipher.slice(4)},'雨停之后'));
});
