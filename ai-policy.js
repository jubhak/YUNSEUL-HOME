/* Shared AI timing policy; seconds of active simulation, independent of rendering. */
(function(root){
 'use strict';
 const RULES=Object.freeze({
  slide:Object.freeze({hold:0,cooldown:30}),
  swing:Object.freeze({hold:20,cooldown:30}),
  bed:Object.freeze({hold:120,cooldown:60}),
  tea:Object.freeze({hold:30,cooldown:60}),
  towel:Object.freeze({hold:30,cooldown:60})
 });
 class YunseulAiPolicy{
  constructor(){this.time=0;this.until=Object.create(null)}
  tick(dt){if(Number.isFinite(dt)&&dt>0)this.time+=dt}
  available(kind){return this.time+1e-8>=(this.until[kind]||0)}
  complete(kind){if(RULES[kind])this.until[kind]=this.time+RULES[kind].cooldown}
  hold(kind,elapsed){return !!RULES[kind]&&elapsed+1e-8>=RULES[kind].hold}
 }
 YunseulAiPolicy.RULES=RULES;
 if(typeof module==='object'&&module.exports)module.exports=YunseulAiPolicy;
 else root.YunseulAiPolicy=YunseulAiPolicy;
})(typeof window!=='undefined'?window:globalThis);
