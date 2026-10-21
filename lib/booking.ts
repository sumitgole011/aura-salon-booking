export const SERVICES=[{id:1,name:'Haircut',price:200,duration:30},{id:2,name:'Beard Trim',price:100,duration:15},{id:3,name:'Hair Spa',price:800,duration:45},{id:4,name:'Facial',price:500,duration:40},{id:5,name:'Bridal Makeup',price:5000,duration:120}];
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const minuteOf=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3));
export const timeOf=(m:number)=>`${Math.floor(m/60).toString().padStart(2,'0')}:${(m%60).toString().padStart(2,'0')}`;
export function occupied(time:string,duration:number){return Array.from({length:Math.ceil(duration/5)},(_,i)=>minuteOf(time)+i*5)}
export function validDate(date:string){return /^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date}
export function validateAppointment(date:string,time:string,duration:number){
 if(!validDate(date)||date<today())throw new Error('Choose today or a future date.');
 if(!/^\d{2}:\d{2}$/.test(time)||Number(time.slice(3))>59)throw new Error('Choose a valid time.');
 const m=minuteOf(time); if(m<600||m+duration>1200||m%15!==0)throw new Error('Choose a 15-minute start time between 10 AM and closing at 8 PM.');
 if(Date.parse(`${date}T${time}:00+05:30`)<=Date.now())throw new Error('This time has already passed. Choose another slot.');
 if(date>new Date(Date.now()+90*86400000).toISOString().slice(0,10))throw new Error('Bookings open up to 90 days ahead.');
}
