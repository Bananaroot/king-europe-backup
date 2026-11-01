export default {
 async fetch(request, env) {
  const origin=request.headers.get('Origin')||'';
  const allowed=origin==='https://bananaroot.github.io';
  const headers={'Access-Control-Allow-Origin':allowed?origin:'https://bananaroot.github.io','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Admin-Key','Cache-Control':'no-store','Vary':'Origin'};
  const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json;charset=utf-8'}});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  const url=new URL(request.url);
  if(url.pathname==='/event'&&request.method==='POST') {
   if(!allowed)return json({ok:false,error:'origin'},403);
   let body;try{body=await request.json()}catch(_){return json({ok:false,error:'json'},400)}
   const {event,test,campaign,session}=body||{};
   if(!['result_view','shop_click'].includes(event)||typeof test!=='string'||typeof session!=='string')return json({ok:false,error:'invalid'},400);
   if(!/^[a-zA-Z0-9_-]{1,90}$/.test(test)||!/^[a-zA-Z0-9_-]{1,90}$/.test(session))return json({ok:false,error:'invalid_identifier'},400);
   const cam=typeof campaign==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(campaign)?campaign:'diretto';
   const dedup=event==='result_view'?`${event}:${test}:${session}`:crypto.randomUUID();
   await env.ANALYTICS_DB.prepare('INSERT OR IGNORE INTO events (id,event,test,campaign,created_at) VALUES (?,?,?,?,?)').bind(dedup,event,test,cam,new Date().toISOString()).run();
   return json({ok:true});
  }
  if(url.pathname==='/stats'&&request.method==='GET'){
   if(!env.ADMIN_KEY||request.headers.get('X-Admin-Key')!==env.ADMIN_KEY)return json({ok:false,error:'unauthorized'},401);
   const data=await env.ANALYTICS_DB.prepare('SELECT test,campaign,event,COUNT(*) AS total FROM events GROUP BY test,campaign,event ORDER BY test,campaign,event').all();
   return json({ok:true,data:data.results});
  }
  return json({ok:false,error:'not_found'},404);
 }
};
