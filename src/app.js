(()=>{'use strict';
const DATA=window.EXAM_QUESTIONS||[],study=document.body.dataset.mode==='study',key='fizio-tr-midterm-2026:'+ (study?'study':'exam')+':v1',byNum=new Map(DATA.map(q=>[q.number,q])),$=id=>document.getElementById(id);
let s;try{s=JSON.parse(localStorage.getItem(key))||{}}catch{s={}}
s.answers??={};s.checked??={};s.errors??={};s.status??={};s.number??=1;s.shuffle??=false;s.auto??=false;s.filter??='all';s.search??='';s.studyShuffle??=false;s.show??=false;
let n=s.number,practice=false,wrongNums=[],pa={},pc={};
const save=()=>{s.number=n;localStorage.setItem(key,JSON.stringify(s));window.fizioCloud?.save?.(s)},ans=()=>practice?pa:s.answers,checked=()=>practice?pc:s.checked;
const shuffled=(a,seed)=>{let x=[...a];for(let i=x.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[x[i],x[j]]=[x[j],x[i]]}return x};
function subset(){if(practice)return wrongNums.map(i=>byNum.get(i));let a=DATA;if(study){a=a.filter(q=>(s.filter==='all'||(s.filter==='new'?!s.status[q.number]:s.status[q.number]===s.filter))&&(!s.search||[q.question,...q.options.map(o=>o.text)].join(' ').toLocaleLowerCase('az').includes(s.search.toLocaleLowerCase('az'))));if(s.studyShuffle)a=shuffled(a,8801)}return a}
function go(target,force=false){if(!byNum.has(target))return;if(study&&force){s.filter='all';s.search='';s.studyShuffle=false;$('filter').value='all';$('search').value='';$('studyShuffle').checked=false}if(practice&&!wrongNums.includes(target))practice=false;n=target;s.show=false;save();render()}
function move(delta){const items=subset().map(q=>q.number),i=items.indexOf(n);if(i<0){if(items.length)go(items[0]);return}if(items[i+delta])go(items[i+delta])}
function verify(){if(!ans()[n])return;checked()[n]=true;if(!practice&&ans()[n]!==byNum.get(n).answer)s.errors[n]=true;save();render()}
function stats(){if(study){const known=Object.values(s.status).filter(x=>x==='known').length,rep=Object.values(s.status).filter(x=>x==='repeat').length;$('stats').textContent='Ümumi: '+DATA.length+' · Bildim: '+known+' · Təkrar et: '+rep+' · İşlənməmiş: '+(DATA.length-known-rep);return}
let a=ans(),c=checked(),all=practice?wrongNums.map(x=>byNum.get(x)):DATA,correct=all.filter(q=>c[q.number]&&a[q.number]===q.answer).length,incorrect=all.filter(q=>c[q.number]&&a[q.number]!==q.answer).length,done=all.filter(q=>a[q.number]).length;
$('stats').textContent=(practice?'Səhvlərin təkrarı':'İmtahan')+' · Cavablandırıldı: '+done+' · Düzgün: '+correct+' · Səhv: '+incorrect+' · Qalan: '+(all.length-done)}
function render(){const q=byNum.get(n);if(!q)return;stats();const a=ans(),c=checked(),verified=!!c[n],card=$('card');card.replaceChildren();
const p=document.createElement('p');p.className='muted';p.textContent='Sual '+n+' / '+DATA.length;card.append(p);
const title=document.createElement('h2');title.textContent=q.question;card.append(title);
const opts=study?q.options:(s.shuffle?shuffled(q.options,n*9187+73):q.options);
for(const o of opts){const lab=document.createElement('label');lab.className='option';if(study&&s.show&&o.id===q.answer)lab.classList.add('good');if(!study){if(verified&&o.id===q.answer)lab.classList.add('good');if(verified&&a[n]===o.id&&o.id!==q.answer)lab.classList.add('bad');if(!verified&&a[n]===o.id)lab.classList.add('selected')}
const inp=document.createElement('input');inp.type='radio';inp.name='choice';inp.checked=!study&&a[n]===o.id;inp.disabled=study||verified;const span=document.createElement('span');span.textContent=o.id+') '+o.text;lab.append(inp,span);if(!study)lab.addEventListener('click',()=>{if(verified)return;a[n]=o.id;save();if(s.auto)verify();else render()});card.append(lab)}
const actions=document.createElement('div');actions.className='controls';function button(text,fn,cls){const b=document.createElement('button');b.textContent=text;b.className=cls||'';b.onclick=fn;actions.append(b)}
button('← Əvvəlki',()=>move(-1),'secondary');
if(study){button(s.show?'Cavabı gizlət':'Düzgün cavabı göstər',()=>{s.show=!s.show;save();render()});button('Bildim',()=>{s.status[n]='known';save();render()});button('Təkrar et',()=>{s.status[n]='repeat';save();render()})}else if(!verified)button('Bu sualı yoxla',verify);
button('Növbəti →',()=>move(1),'secondary');card.append(actions);
const panel=$('numbers');panel.replaceChildren();const list=subset();for(const item of list){const i=item.number,b=document.createElement('button');b.textContent=i;b.className=(i===n?'current ':'')+(study?(s.status[i]||''):(checked()[i]?(ans()[i]===item.answer?'correct':'wrong'):(ans()[i]?'answered':'')));b.onclick=()=>go(i);panel.append(b)}if(!list.length)panel.textContent='Bu filtrə uyğun sual yoxdur.'}
$('go').onclick=()=>{const t=Number($('jump').value);if(t>=1&&t<=DATA.length)go(t,study)};$('jump').onkeydown=e=>{if(e.key==='Enter')$('go').click()};
if(study){$('filter').value=s.filter;$('search').value=s.search;$('studyShuffle').checked=s.studyShuffle;
$('filter').onchange=e=>{s.filter=e.target.value;const x=subset()[0];if(x)n=x.number;save();render()};
$('search').oninput=e=>{s.search=e.target.value;const x=subset()[0];if(x)n=x.number;save();render()};
$('studyShuffle').onchange=e=>{s.studyShuffle=e.target.checked;save();render()}}
else{$('shuffle').checked=s.shuffle;$('auto').checked=s.auto;
$('shuffle').onchange=e=>{s.shuffle=e.target.checked;save();render()};
$('auto').onchange=e=>{s.auto=e.target.checked;save();render()};
$('finish').onclick=()=>{for(const i of Object.keys(ans()))checked()[i]=true;save();render();$('stats').scrollIntoView({behavior:'smooth'});alert('Nəticə yuxarıda göstərilir. Cavabsız suallar səhv sayılmır.')};
$('repeatWrong').onclick=()=>{const numbers=DATA.filter(q=>s.errors[q.number]||(s.checked[q.number]&&s.answers[q.number]!==q.answer)).map(q=>q.number);if(!numbers.length){alert('Hələ səhv sual yoxdur.');return}practice=true;wrongNums=numbers;pa={};pc={};n=numbers[0];render()};
$('reset').onclick=()=>{if(confirm('İmtahan cavabları sıfırlansın? Səhv tarixçəsi saxlanacaq.')){s.answers={};s.checked={};practice=false;n=1;save();render()}}}
window.fizioCloudApply=(payload)=>{if(payload&&typeof payload==='object'){s={...s,...payload};n=byNum.has(s.number)?s.number:1;practice=false;localStorage.setItem(key,JSON.stringify(s));if(study){$('filter').value=s.filter||'all';$('search').value=s.search||'';$('studyShuffle').checked=!!s.studyShuffle}else{$('shuffle').checked=!!s.shuffle;$('auto').checked=!!s.auto}render()}};
if(!byNum.has(n))n=1;render();
})();