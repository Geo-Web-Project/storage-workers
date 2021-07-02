!function(e){var t={};function n(s){if(t[s])return t[s].exports;var o=t[s]={i:s,l:!1,exports:{}};return e[s].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,s){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(s,o,function(t){return e[t]}.bind(null,o));return s},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t){e.exports={Router:(e={})=>new Proxy(e,{get:(e,t,n)=>"handle"===t?async(t,...n)=>{for(let[s,o]of e.r.filter(e=>e[2]===t.method||"ALL"===e[2])){let e,r,a;if(e=(a=new URL(t.url)).pathname.match(s)){t.params=e.groups,t.query=t.query||Object.fromEntries(a.searchParams.entries());for(let e of o)if(void 0!==(r=await e(t.proxy||t,...n)))return r}}}:(s,...o)=>(e.r=e.r||[]).push([`^${((e.base||"")+s).replace(/(\/?)\*/g,"($1.*)?").replace(/\/$/,"").replace(/:(\w+|\()(\?)?(\.)?/g,"$2(?<$1>[^/$3]+)$2$3").replace(/\.(?=[\w(])/,"\\.")}/*$`,o,t.toUpperCase()])&&n})}},function(e,t,n){"use strict";n.r(t);var s=n(0);const o=Object(s.Router)(),r=PINATA_ACCESS_TOKEN,a={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST","Access-Control-Max-Age":"86400"};o.options("/pinset/:did/request",async e=>new Response(null,{headers:a})),o.options("/pinset/:did/request/:pinsetRecordID",async e=>new Response(null,{headers:a})),o.get("/pinset/:did/request/:pinsetRecordID",async e=>{const t=await fetch("https://gateway.ceramic.network/api/v0/streams/"+e.params.pinsetRecordID),n=await t.json();if(!n||!n.state||!n.state.metadata)return new Response(JSON.stringify({error:"Malformed response"}),{headers:{"Content-Type":"application/json",...a},status:500});if(!n.state.metadata.controllers.includes(e.params.did))return new Response(JSON.stringify({error:"Record not controlled by DID"}),{headers:{"Content-Type":"application/json",...a},status:400});if(!(n.state.content&&n.state.content.root||n.state.next&&n.state.next.content.root))return new Response(JSON.stringify({error:"Bad record found"}),{headers:{"Content-Type":"application/json",...a},status:400});const s=(n.state.next?n.state.next.content:n.state.content).root.replace("ipfs://",""),o=await PINS.get(s);if(!o)return new Response(JSON.stringify({status:"Not Found"}),{headers:{"Content-Type":"application/json",...a},status:404});const i=await fetch("https://api.pinata.cloud/psa/pins/"+o,{method:"GET",headers:{Authorization:"Bearer "+r}}),p=await i.json();return p.status?new Response(JSON.stringify({status:p.status}),{headers:{"Content-Type":"application/json",...a},status:200}):new Response(JSON.stringify({error:"Malformed pin response"}),{headers:{"Content-Type":"application/json",...a},status:500})}),o.post("/pinset/:did/request",async e=>{const t=await e.json();if(!t.pinsetRecordID)return new Response(JSON.stringify({error:"Could not find field 'pinsetRecordID'"}),{headers:{"Content-Type":"application/json",...a},status:400});const n=await fetch("https://gateway.ceramic.network/api/v0/streams/"+t.pinsetRecordID),s=await n.json();if(!s||!s.state||!s.state.metadata)return new Response(JSON.stringify({error:"Malformed response"}),{headers:{"Content-Type":"application/json",...a},status:500});if(!s.state.metadata.controllers.includes(e.params.did))return new Response(JSON.stringify({error:"Record not controlled by DID"}),{headers:{"Content-Type":"application/json",...a},status:400});if(!(s.state.content&&s.state.content.root||s.state.next&&s.state.next.content.root))return new Response(JSON.stringify({error:"Bad record found"}),{headers:{"Content-Type":"application/json",...a},status:400});const o=(s.state.next?s.state.next.content:s.state.content).root.replace("ipfs://",""),i=await PINS.get(o);if(i){const e=await fetch("https://api.pinata.cloud/psa/pins/"+i,{method:"GET",headers:{Authorization:"Bearer "+r}}),t=await e.json();return t.status?new Response(JSON.stringify({status:t.status}),{headers:{"Content-Type":"application/json",...a},status:200}):new Response(JSON.stringify({error:"Malformed pin response"}),{headers:{"Content-Type":"application/json",...a},status:500})}const p=await fetch("https://api.pinata.cloud/psa/pins",{method:"POST",headers:{Authorization:"Bearer "+r,"Content-Type":"application/json"},body:JSON.stringify({name:o,cid:o,origins:["/dns4/ipfs-clay-1.ceramic.geoweb.network/tcp/4012/ws/p2p/QmbDGaByZoomn3NQQjZzwaPWH6ei3ptzWK7a7ECtS35DKL"]})}),c=await p.json();return c.status?(await PINS.put(o,c.requestid),new Response(JSON.stringify({status:c.status}),{headers:{"Content-Type":"application/json",...a},status:201})):new Response(JSON.stringify({error:"Malformed pin response"}),{headers:{"Content-Type":"application/json",...a},status:500})}),o.all("*",()=>new Response("404, not found!",{status:404})),addEventListener("fetch",e=>{e.respondWith(o.handle(e.request))})}]);