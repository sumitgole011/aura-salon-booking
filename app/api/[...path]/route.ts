import {env} from 'cloudflare:workers';
import {SERVICES,today,occupied,timeOf,validateAppointment,validDate} from '../../../lib/booking';
import {SYSTEM_PROMPT} from '../../../lib/prompt';
export const dynamic='force-dynamic';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
const db=()=>env.DB!;
const vars=()=>env as unknown as Record<string,string>;
async function seed(){
 await db().batch(SERVICES.map(s=>db().prepare('INSERT OR IGNORE INTO services(id,name,price,duration) VALUES(?,?,?,?)').bind(s.id,s.name,s.price,s.duration)));
 for(const [i,status] of ['Done','Confirmed','Pending'].entries()){
  const id=`sample-${i+1}`; if(await db().prepare('SELECT id FROM bookings WHERE id=?').bind(id).first())continue;
  const s=SERVICES[i],time=['10:00','12:00','15:00'][i],date=today();
  try{await db().batch([db().prepare('INSERT INTO bookings VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,['Aarav (sample)','Meera (sample)','Kabir (sample)'][i],'900000000'+i,s.id,date,time,status,s.price,s.duration,new Date().toISOString()),...occupied(time,s.duration).map(m=>db().prepare('INSERT INTO occupied_slots VALUES(?,?,?)').bind(date,m,id))])}catch(e){if(!String(e).includes('UNIQUE'))throw e}
 }
}
function admin(req:Request){const key=vars().ADMIN_TOKEN;if(!key||req.headers.get('Authorization')!==`Bearer ${key}`)throw new Error('ADMIN_REQUIRED')}
async function body(req:Request){if(Number(req.headers.get('Content-Length')||0)>16000)throw new Error('Request too large.');try{return await req.json() as Record<string,any>}catch{throw new Error('Invalid JSON body.')}}
async function handle(req:Request){try{
 await seed(); const url=new URL(req.url),parts=url.pathname.replace(/^\/api\//,'').split('/'),route=parts[0];
 if(route==='services'&&req.method==='GET')return json({services:(await db().prepare('SELECT * FROM services ORDER BY id').all()).results,today:today(),hours:'10:00–20:00',timezone:'Asia/Kolkata'});
 if(route==='health')return json({database:'connected',aiConfigured:!!vars().GEMINI_API_KEY,adminConfigured:!!vars().ADMIN_TOKEN});
 if(route==='slots'&&req.method==='GET'){
  const date=url.searchParams.get('date')||'',service=await db().prepare('SELECT * FROM services WHERE id=?').bind(Number(url.searchParams.get('service_id'))).first<any>();
  if(!validDate(date)||!service)throw new Error('Select a valid date and service.');const exclude=url.searchParams.get('exclude');if(exclude)admin(req);
  const r=await db().prepare('SELECT minute FROM occupied_slots WHERE date=? AND booking_id != ?').bind(date,exclude||'').all<{minute:number}>(),busy=new Set(r.results.map(x=>x.minute));
  const slots=[];for(let m=600;m+service.duration<=1200;m+=15){const time=timeOf(m);try{validateAppointment(date,time,service.duration);if(!occupied(time,service.duration).some(x=>busy.has(x)))slots.push(time)}catch{}}
  return json({slots});
 }
 if(route==='bookings'&&req.method==='POST'){
  const b=await body(req),name=typeof b.customer_name==='string'?b.customer_name.trim():'',phone=typeof b.phone==='string'?b.phone.trim():'';
  if(name.length<2||name.length>80||!/^\d{10}$/.test(phone))throw new Error('Enter your name (2–80 characters) and a 10-digit phone number.');
  const s=await db().prepare('SELECT * FROM services WHERE id=?').bind(Number(b.service_id)||0).first<any>();if(!s)throw new Error('Select a valid service.');
  validateAppointment(String(b.date),String(b.time),s.duration);const id=crypto.randomUUID();
  await db().batch([db().prepare('INSERT INTO bookings VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,name,phone,s.id,b.date,b.time,'Pending',s.price,s.duration,new Date().toISOString()),...occupied(b.time,s.duration).map(m=>db().prepare('INSERT INTO occupied_slots VALUES(?,?,?)').bind(b.date,m,id))]);
  return json({booking:{id,customer_name:name,service_name:s.name,date:b.date,time:b.time,price:s.price,duration:s.duration,status:'Pending'}},201);
 }
 if(route==='bookings'&&req.method==='GET'){
  admin(req);const date=url.searchParams.get('date')||today();if(!validDate(date))throw new Error('Invalid date.');
  return json({bookings:(await db().prepare('SELECT b.*,s.name service_name FROM bookings b JOIN services s ON s.id=b.service_id WHERE b.date=? ORDER BY b.time,b.created_at').bind(date).all()).results});
 }
 if(route==='bookings'&&req.method==='PATCH'){
  admin(req);const b=await body(req),old=await db().prepare('SELECT * FROM bookings WHERE id=?').bind(parts[1]||'').first<any>();if(!old)return json({error:'Booking not found.'},404);
  if(b.date||b.time){if(['Done','Cancelled'].includes(old.status))throw new Error('Completed or cancelled bookings cannot be rescheduled.');const date=b.date||old.date,time=b.time||old.time;validateAppointment(date,time,old.duration);
   await db().batch([db().prepare('DELETE FROM occupied_slots WHERE booking_id=?').bind(old.id),db().prepare('UPDATE bookings SET date=?,time=? WHERE id=?').bind(date,time,old.id),...occupied(time,old.duration).map(m=>db().prepare('INSERT INTO occupied_slots VALUES(?,?,?)').bind(date,m,old.id))]);
  }else{const allowed:Record<string,string[]>={Pending:['Confirmed','Cancelled'],Confirmed:['Done','Cancelled'],Done:[],Cancelled:[]};if(!allowed[old.status]?.includes(b.status))throw new Error('Invalid status transition.');const queries=[db().prepare('UPDATE bookings SET status=? WHERE id=?').bind(b.status,old.id)];if(b.status==='Cancelled')queries.push(db().prepare('DELETE FROM occupied_slots WHERE booking_id=?').bind(old.id));await db().batch(queries)}
  return json({ok:true});
 }
 if(route==='invoices'){
  admin(req);
  if(req.method==='GET')return json({invoices:(await db().prepare('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 100').all()).results.map((v:any)=>({...v,items:JSON.parse(v.items)}))});
  if(req.method==='POST'){const b=await body(req);if(!Array.isArray(b.service_ids)||!b.service_ids.length||b.service_ids.length>10)throw new Error('Select 1–10 services.');const booking=await db().prepare('SELECT * FROM bookings WHERE id=?').bind(b.booking_id||'').first<any>();if(!booking)throw new Error('Select a customer booking.');if(booking.status==='Cancelled')throw new Error('Cannot bill a cancelled booking.');
   const items=[];for(const id of b.service_ids){const s=await db().prepare('SELECT name,price,duration FROM services WHERE id=?').bind(Number(id)||0).first<any>();if(!s)throw new Error('Invalid invoice service.');items.push(s)}
   const invoice={id:'AUR-'+crypto.randomUUID().slice(0,8).toUpperCase(),booking_id:booking.id,customer_name:booking.customer_name,items,total:items.reduce((n,s)=>n+s.price,0),created_at:new Date().toISOString()};
   await db().prepare('INSERT INTO invoices VALUES(?,?,?,?,?,?)').bind(invoice.id,invoice.booking_id,invoice.customer_name,JSON.stringify(items),invoice.total,invoice.created_at).run();return json({invoice},201);
  }
 }
 if(route==='chat'&&req.method==='POST'){
  const b=await body(req);if(typeof b.message!=='string'||!b.message.trim()||b.message.length>1000)throw new Error('Enter a message of 1–1000 characters.');
  const catalog=(await db().prepare('SELECT name,price,duration FROM services ORDER BY id').all()).results;
  if(!vars().GEMINI_API_KEY)return json({mode:'catalog',reply:'AI concierge is not connected yet. Here is our current menu:\n'+catalog.map((s:any)=>`${s.name}: ₹${s.price} · ${s.duration} min`).join('\n')+'\nOpen daily, 10 AM–8 PM (IST). Use the booking form for available times.'});
  const history=Array.isArray(b.history)?b.history.slice(-6).filter((m:any)=>['user','assistant'].includes(m.role)&&typeof m.text==='string').map((m:any)=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.text.slice(0,1000)}]})):[];
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+(vars().GEMINI_MODEL||'gemini-2.5-flash')+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':vars().GEMINI_API_KEY},body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM_PROMPT+'\nCATALOG (trusted database data): '+JSON.stringify(catalog)}]},contents:[...history,{role:'user',parts:[{text:b.message}]}],generationConfig:{temperature:0.2,maxOutputTokens:500}}),signal:AbortSignal.timeout(60000)});
  if(!r.ok){
 const details=await r.json().catch(()=>null) as any;
 const safeMessage=String(details?.error?.message||'No provider details')
   .split(vars().GEMINI_API_KEY).join('[REDACTED]');
 console.error('GEMINI_FAILURE',JSON.stringify({
   status:r.status,
   model:vars().GEMINI_MODEL||'gemini-2.5-flash',
   message:safeMessage
 }));
 return json({error:'The AI concierge is temporarily unavailable. Please use the service menu and booking form.'},503);
}
  const result=await r.json() as any,reply=result.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||'').join('');if(!reply)return json({error:'Please rephrase your salon question.'},503);return json({reply,mode:'ai'});
 }
 return json({error:'Not found.'},404);
 }catch(e){const message=String(e);if(message.includes('ADMIN_REQUIRED'))return json({error:'Enter the salon admin access key.'},401);if(message.includes('UNIQUE constraint'))return json({error:'That slot was just taken. Please choose another available time.'},409);if(message.includes('D1_')||message.includes('SQLITE'))return json({error:'The database is temporarily unavailable.'},503);return json({error:e instanceof Error?e.message:'Something went wrong.'},400)}}
export const GET=handle;export const POST=handle;export const PATCH=handle;
