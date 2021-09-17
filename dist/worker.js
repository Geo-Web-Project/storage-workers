!function(t){var e={};function n(s){if(e[s])return e[s].exports;var o=e[s]={i:s,l:!1,exports:{}};return t[s].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,s){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(s,o,function(e){return t[e]}.bind(null,o));return s},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=1)}([function(t,e){t.exports={Router:(t={})=>new Proxy(t,{get:(t,e,n)=>"handle"===e?async(e,...n)=>{for(let[s,o]of t.r.filter(t=>t[2]===e.method||"ALL"===t[2])){let t,r,a;if(t=(a=new URL(e.url)).pathname.match(s)){e.params=t.groups,e.query=e.query||Object.fromEntries(a.searchParams.entries());for(let t of o)if(void 0!==(r=await t(e.proxy||e,...n)))return r}}}:(s,...o)=>(t.r=t.r||[]).push([`^${((t.base||"")+s).replace(/(\/?)\*/g,"($1.*)?").replace(/\/$/,"").replace(/:(\w+|\()(\?)?(\.)?/g,"$2(?<$1>[^/$3]+)$2$3").replace(/\.(?=[\w(])/,"\\.")}/*$`,o,e.toUpperCase()])&&n})}},function(t,e,n){"use strict";n.r(e);var s=n(0);const o=Object(s.Router)(),r=["/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic","/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6","/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS","/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN"],a={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,GET","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"86400"};o.options("/pinset/:did/request",async t=>new Response(null,{headers:a})),o.options("/pinset/:did/request/:pinsetRecordID",async t=>new Response(null,{headers:a})),o.get("/pinset/:did/latest",async t=>{const e=await PINS.get(t.params.did);return e?new Response(JSON.stringify({latestCommitId:e}),{headers:{"Content-Type":"application/json",...a},status:200}):new Response(JSON.stringify({status:"Not Found"}),{headers:{"Content-Type":"application/json",...a},status:404})}),o.get("/pinset/:did/request/:pinsetRecordID",async t=>{const e=await fetch("https://gateway-clay.ceramic.network/api/v0/streams/"+t.params.pinsetRecordID),n=await e.json();if(!n||!n.state||!n.state.metadata)return new Response(JSON.stringify({error:"Malformed response"}),{headers:{"Content-Type":"application/json",...a},status:500});if(!n.state.metadata.controllers.includes(t.params.did))return new Response(JSON.stringify({error:"Record not controlled by DID"}),{headers:{"Content-Type":"application/json",...a},status:400});if(!(n.state.content&&n.state.content.root||n.state.next&&n.state.next.content.root))return new Response(JSON.stringify({error:"Bad record found"}),{headers:{"Content-Type":"application/json",...a},status:400});const s=(n.state.next?n.state.next.content:n.state.content).root.replace("ipfs://",""),o=await PINS.get(s);if(!o)return new Response(JSON.stringify({status:"Not Found"}),{headers:{"Content-Type":"application/json",...a},status:404});const r=await fetch("https://api.estuary.tech/pinning/pins/"+o,{method:"GET",headers:{Authorization:"Bearer "+ESTUARY_API_KEY}}),i=await r.json();return i.status?("pinned"==i.status&&await PINS.put(t.params.did,t.params.pinsetRecordID),new Response(JSON.stringify({status:i.status}),{headers:{"Content-Type":"application/json",...a},status:200})):new Response(JSON.stringify({error:"Malformed pin response"}),{headers:{"Content-Type":"application/json",...a},status:500})}),o.post("/pinset/:did/request",async t=>{const e=await t.json();if(!e.pinsetRecordID)return new Response(JSON.stringify({error:"Could not find field 'pinsetRecordID'"}),{headers:{"Content-Type":"application/json",...a},status:400});const n=await fetch("https://gateway-clay.ceramic.network/api/v0/streams/"+e.pinsetRecordID),s=await n.json();if(!s||!s.state||!s.state.metadata)return new Response(JSON.stringify({error:"Malformed response"}),{headers:{"Content-Type":"application/json",...a},status:500});if(!s.state.metadata.controllers.includes(t.params.did))return new Response(JSON.stringify({error:"Record not controlled by DID"}),{headers:{"Content-Type":"application/json",...a},status:400});if(!(s.state.content&&s.state.content.root||s.state.next&&s.state.next.content.root))return new Response(JSON.stringify({error:"Bad record found"}),{headers:{"Content-Type":"application/json",...a},status:400});const o=(s.state.next?s.state.next.content:s.state.content).root.replace("ipfs://",""),i=await PINS.get(o);if(i){const n=await fetch("https://api.estuary.tech/pinning/pins/"+i,{method:"GET",headers:{Authorization:"Bearer "+ESTUARY_API_KEY}}),s=await n.json();return s.status?("pinned"==s.status&&await PINS.put(t.params.did,e.pinsetRecordID),new Response(JSON.stringify({status:s.status}),{headers:{"Content-Type":"application/json",...a},status:200})):new Response(JSON.stringify({error:"Malformed pin response: "+JSON.stringify(s)}),{headers:{"Content-Type":"application/json",...a},status:500})}const p=await fetch("https://api.estuary.tech/pinning/pins",{method:"POST",headers:{Authorization:"Bearer "+ESTUARY_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({name:o,cid:o,origins:r})}),d=await p.json();return d.status?(await PINS.put(o,d.requestid),"pinned"==d.status&&await PINS.put(t.params.did,e.pinsetRecordID),new Response(JSON.stringify({status:d.status}),{headers:{"Content-Type":"application/json",...a},status:201})):new Response(JSON.stringify({error:"Malformed pin response: "+JSON.stringify(d)}),{headers:{"Content-Type":"application/json",...a},status:500})}),o.all("*",()=>new Response("404, not found!",{status:404})),addEventListener("fetch",t=>{t.respondWith(o.handle(t.request))})}]);