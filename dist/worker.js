!function(t){var e={};function n(s){if(e[s])return e[s].exports;var r=e[s]={i:s,l:!1,exports:{}};return t[s].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=t,n.c=e,n.d=function(t,e,s){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(s,r,function(e){return t[e]}.bind(null,r));return s},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=1)}([function(t,e){t.exports={Router:(t={})=>new Proxy(t,{get:(t,e,n)=>"handle"===e?async(e,...n)=>{for(let[s,r]of t.r.filter(t=>t[2]===e.method||"ALL"===t[2])){let t,a,o;if(t=(o=new URL(e.url)).pathname.match(s)){e.params=t.groups,e.query=e.query||Object.fromEntries(o.searchParams.entries());for(let t of r)if(void 0!==(a=await t(e.proxy||e,...n)))return a}}}:(s,...r)=>(t.r=t.r||[]).push([`^${((t.base||"")+s).replace(/(\/?)\*/g,"($1.*)?").replace(/\/$/,"").replace(/:(\w+|\()(\?)?(\.)?/g,"$2(?<$1>[^/$3]+)$2$3").replace(/\.(?=[\w(])/,"\\.")}/*$`,r,e.toUpperCase()])&&n})}},function(t,e,n){"use strict";n.r(e);var s=n(0);const r=Object(s.Router)(),a=["/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic","/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6","/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS","/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN"],o={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,GET","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"86400"};r.options("/pinset/:did/request",async t=>new Response(null,{headers:o})),r.options("/pinset/:did/request/:pinsetRecordID",async t=>new Response(null,{headers:o})),r.get("/pinset/:did/latest",async t=>{const e=t.query.assetId,n=e?`${t.params.did}_${e}`:t.params.did,s=await PINS.get(n);return s?new Response(JSON.stringify({latestCommitId:s}),{headers:{"Content-Type":"application/json",...o},status:200}):new Response(JSON.stringify({status:"Not Found"}),{headers:{"Content-Type":"application/json",...o},status:404})}),r.get("/pinset/:did/request/:pinsetRecordID",async t=>{const e=t.query.assetId,n=e?`${t.params.did}_${e}`:t.params.did,s=await fetch("https://gateway.ceramic.network/api/v0/streams/"+t.params.pinsetRecordID),r=await s.json();if(!r||!r.state||!r.state.metadata)return new Response(JSON.stringify({error:"Malformed response"}),{headers:{"Content-Type":"application/json",...o},status:500});if(!r.state.metadata.controllers.includes(t.params.did))return new Response(JSON.stringify({error:"Record not controlled by DID"}),{headers:{"Content-Type":"application/json",...o},status:400});if(!(r.state.content&&r.state.content.root||r.state.next&&r.state.next.content.root))return new Response(JSON.stringify({error:"Bad record found"}),{headers:{"Content-Type":"application/json",...o},status:400});const a=(r.state.next?r.state.next.content:r.state.content).root.replace("ipfs://",""),i=await PINS.get(a);if(!i)return new Response(JSON.stringify({status:"Not Found"}),{headers:{"Content-Type":"application/json",...o},status:404});const p=await fetch("https://api.estuary.tech/pinning/pins/"+i,{method:"GET",headers:{Authorization:"Bearer "+ESTUARY_API_KEY}}),d=await p.json();return d.status?("pinned"==d.status&&await PINS.put(n,t.params.pinsetRecordID),new Response(JSON.stringify({status:d.status}),{headers:{"Content-Type":"application/json",...o},status:200})):new Response(JSON.stringify({error:"Malformed pin response"}),{headers:{"Content-Type":"application/json",...o},status:500})}),r.post("/pinset/:did/request",async t=>{const e=t.query.assetId,n=e?`${t.params.did}_${e}`:t.params.did,s=await t.json();if(!s.pinsetRecordID)return new Response(JSON.stringify({error:"Could not find field 'pinsetRecordID'"}),{headers:{"Content-Type":"application/json",...o},status:400});const r=await fetch("https://gateway.ceramic.network/api/v0/streams/"+s.pinsetRecordID),i=await r.json();if(!i||!i.state||!i.state.metadata)return new Response(JSON.stringify({error:"Malformed response"}),{headers:{"Content-Type":"application/json",...o},status:500});if(!i.state.metadata.controllers.includes(t.params.did))return new Response(JSON.stringify({error:"Record not controlled by DID"}),{headers:{"Content-Type":"application/json",...o},status:400});if(!(i.state.content&&i.state.content.root||i.state.next&&i.state.next.content.root))return new Response(JSON.stringify({error:"Bad record found"}),{headers:{"Content-Type":"application/json",...o},status:400});const p=(i.state.next?i.state.next.content:i.state.content).root.replace("ipfs://",""),d=await PINS.get(p);if(d){const t=await fetch("https://api.estuary.tech/pinning/pins/"+d,{method:"GET",headers:{Authorization:"Bearer "+ESTUARY_API_KEY}}),e=await t.json();return e.status?("pinned"==e.status&&await PINS.put(n,s.pinsetRecordID),new Response(JSON.stringify({status:e.status}),{headers:{"Content-Type":"application/json",...o},status:200})):new Response(JSON.stringify({error:"Malformed pin response: "+JSON.stringify(e)}),{headers:{"Content-Type":"application/json",...o},status:500})}const c=await fetch("https://api.estuary.tech/pinning/pins",{method:"POST",headers:{Authorization:"Bearer "+ESTUARY_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({name:p,cid:p,origins:a})}),u=await c.json();return u.status?(await PINS.put(p,u.requestid),"pinned"==u.status&&await PINS.put(n,s.pinsetRecordID),new Response(JSON.stringify({status:u.status}),{headers:{"Content-Type":"application/json",...o},status:201})):new Response(JSON.stringify({error:"Malformed pin response: "+JSON.stringify(u)}),{headers:{"Content-Type":"application/json",...o},status:500})}),r.all("*",()=>new Response("404, not found!",{status:404})),addEventListener("fetch",t=>{t.respondWith(r.handle(t.request))})}]);