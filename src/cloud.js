(async()=>{
'use strict';
const config={url:'https://xnghtmbdwjjriyojwlmr.supabase.co',key:'sb_publishable_TiSitqXtXAuIuT3gL8Mtsg_t41OFALY'};
const panel=document.getElementById('cloud');if(!panel)return;
const mode=document.body.dataset.mode==='study'?'study':'exam';
const storeKey='fizio-tr-midterm-2026:'+mode+':v1';
const status=document.createElement('span');status.className='muted';status.id='cloudStatus';
const email=document.createElement('input');email.type='email';email.placeholder='E-poçt';email.autocomplete='email';email.setAttribute('aria-label','E-poçt');email.required=true;
const pwd=document.createElement('input');pwd.type='password';pwd.placeholder='Şifrə';pwd.autocomplete='current-password';pwd.setAttribute('aria-label','Şifrə');pwd.required=true;
const login=document.createElement('button');login.textContent='Daxil ol';const signup=document.createElement('button');signup.textContent='Qeydiyyat';signup.className='secondary';
const logout=document.createElement('button');logout.textContent='Çıxış';logout.className='secondary';logout.hidden=true;
panel.append(status,email,pwd,login,signup,logout);
let client,user=null,ready=false,writeTimer=null,loading=false;
const message=x=>{status.textContent=x};
try{if(!window.supabase?.createClient)throw Error('Supabase kitabxanası yüklənmədi');client=window.supabase.createClient(config.url,config.key);window.fizioCloud={save:payload=>{if(!user||!ready||loading)return;clearTimeout(writeTimer);writeTimer=setTimeout(async()=>{const {error}=await client.from('fizio_user_progress').upsert({user_id:user.id,mode,payload,updated_at:new Date().toISOString()},{onConflict:'user_id,mode'});if(error)message('Sinxronizasiya xətası: '+error.message);else message('Buludla sinxronlaşdırıldı · '+user.email)},650)}}catch(e){message('Bulud bağlantısı mümkün olmadı: '+e.message);return}
async function hydrate(u){user=u;ready=false;clearTimeout(writeTimer);email.hidden=!!u;pwd.hidden=!!u;login.hidden=!!u;signup.hidden=!!u;logout.hidden=!u;if(!u){message('Bulud hesabı: daxil olmamısınız (lokal yaddaş işləyir)');return}message('Bulud məlumatları yüklənir…');loading=true;const {data,error}=await client.from('fizio_user_progress').select('payload').eq('user_id',u.id).eq('mode',mode).maybeSingle();loading=false;if(error){message('Bulud oxuma xətası: '+error.message);return}if(data?.payload){window.fizioCloudApply?.(data.payload)}else{let local;try{local=JSON.parse(localStorage.getItem(storeKey)||'{}')}catch{local={}}const {error:uploadError}=await client.from('fizio_user_progress').upsert({user_id:u.id,mode,payload:local,updated_at:new Date().toISOString()},{onConflict:'user_id,mode'});if(uploadError){message('Bulud yaddaşına köçürmə mümkün olmadı: '+uploadError.message);return}}ready=true;message('Bulud aktiv · '+u.email)}
async function auth(kind){if(!email.value.trim()||!pwd.value){message('E-poçt və şifrə daxil edin');return}login.disabled=signup.disabled=true;message('Yoxlanılır…');try{const credentials={email:email.value.trim(),password:pwd.value};const {data,error}=kind==='login'?await client.auth.signInWithPassword(credentials):await client.auth.signUp({ ...credentials,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;if(kind==='signup'&&!data.session){message('Qeydiyyat yaradıldı. E-poçt təsdiqi tələb oluna bilər.');return}await hydrate(data.user)}catch(e){message('Hesab xətası: '+e.message)}finally{login.disabled=signup.disabled=false;pwd.value=''}}
login.onclick=()=>auth('login');signup.onclick=()=>auth('signup');
logout.onclick=async()=>{ready=false;await client.auth.signOut();localStorage.removeItem('fizio-tr-midterm-2026:exam:v1');localStorage.removeItem('fizio-tr-midterm-2026:study:v1');location.reload()};
const {data:{session},error}=await client.auth.getSession();if(error)message('Sessiya xətası: '+error.message);else await hydrate(session?.user||null);
client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT')hydrate(null);if(event==='SIGNED_IN'&&session?.user&&session.user.id!==user?.id){setTimeout(()=>hydrate(session.user),0)}});
})();