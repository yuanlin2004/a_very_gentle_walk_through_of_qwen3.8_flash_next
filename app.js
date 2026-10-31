'use strict';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const architectures = {
  llama: {nodes: [['One residual','h'],['Attention','RMSNorm → GQA'],['Dense FFN','RMSNorm → SwiGLU'],['One residual','two residual adds']],caption:'The familiar Llama 3 block: attention mixes across tokens; a dense feed-forward network transforms each position. Each half reads a normalized residual and adds its output back.'},
  qwen: {nodes: [['Four lanes','R₀, R₁, R₂, R₃'],['GDN or QSA','gated read → mixer'],['Sparse MoE','gated read → experts'],['Four lanes','gated write after each half']],caption:'The Flash-Next block: each half reads and writes all four lanes through its own GR site. The mixer is GDN or QSA, never both within one layer. The n-gram injection and final head sit outside this repeated block.'}
};
function showArchitecture(name) {
  const data = architectures[name];
  $('#architecture-diagram').innerHTML = data.nodes.map((node,i) => `${i ? '<span class="flow-arrow" aria-hidden="true">→</span>' : ''}<div class="flow-node ${i===1?'mixer':i===2?'ffn':''}"><b>${node[0]}</b><small>${node[1]}</small></div>`).join('');
  $('#architecture-caption').textContent = data.caption;
  $$('[data-arch]').forEach(button => {const selected=button.dataset.arch===name;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
}
$$('[data-arch]').forEach(button=>button.addEventListener('click',()=>showArchitecture(button.dataset.arch)));
showArchitecture('llama');
$('#layer-strip').innerHTML=Array.from({length:48},(_,i)=>`<span class="${i%4===3?'qsa':''}" title="Layer ${i}: ${i%4===3?'QSA':'GDN'} + MoE"></span>`).join('');
function updateLanes(){
 const strengths=[.4,Number($('#lane-strength').value),1.3,.7],base=[3,2,3.5,2.5];
 $('#lane-strength-value').textContent=`${strengths[1].toFixed(2)}×`;
 $('#lane-demo').innerHTML=strengths.map((s,i)=>`<div class="lane-row"><span>Lane ${i+1}</span><div class="lane-track" aria-hidden="true"><span class="lane-base" style="width:${base[i]/8*100}%"></span><span class="lane-add" style="width:${2*s/8*100}%"></span></div><output aria-label="Lane ${i+1}: ${base[i]} plus ${(2*s).toFixed(1)} equals ${(base[i]+2*s).toFixed(1)}">${base[i]} + ${(2*s).toFixed(1)} = ${(base[i]+2*s).toFixed(1)}</output></div>`).join('');
}
$('#lane-strength').addEventListener('input',updateLanes);updateLanes();
let sparseRound=0,routeRound=0;
function choose(count,total,seed){const chosen=new Set();let n=seed;while(chosen.size<count){n=(Math.imul(n,1664525)+1013904223)>>>0;chosen.add(Math.floor(n/4294967296*total));}return chosen;}
function updateSparse(){const chosen=choose(8,32,77+sparseRound++*103);$('#sparse-grid').innerHTML=Array.from({length:32},(_,i)=>`<span class="sparse-block ${chosen.has(i)?'chosen':''}" title="Block ${i}: ${chosen.has(i)?'selected':'not selected'}"><i></i><i></i><i></i><i></i></span>`).join('');}
function updateExperts(){const chosen=choose(10,512,903+routeRound++*71);$('#expert-grid').innerHTML=Array.from({length:512},(_,i)=>`<span class="expert-dot ${chosen.has(i)?'chosen':''}" title="Expert ${i}${chosen.has(i)?' · selected':''}"></span>`).join('');$('#expert-grid').setAttribute('aria-label',`512 experts. Selected expert IDs: ${[...chosen].sort((a,b)=>a-b).join(', ')}. Plus one shared expert.`);}
$('#select-blocks').addEventListener('click',updateSparse);$('#route-token').addEventListener('click',updateExperts);updateSparse();updateExperts();
function updateCache(){const count=Number($('#context').value),bytes=count*(24576+768),max=262144*(24576+768);$('#context-value').textContent=`${count.toLocaleString('en-US')} tokens`;$('#qsa-size').textContent=bytes>=1e9?`${(bytes/1e9).toFixed(2)} GB`:`${(bytes/1e6).toFixed(1)} MB`;$('#qsa-bar').style.width=`${bytes/max*100}%`;}
$('#context').addEventListener('input',updateCache);updateCache();
function applyTheme(dark){document.body.classList.toggle('dark',dark);$('#theme').setAttribute('aria-label',`Switch to ${dark?'light':'dark'} theme`);$('#theme').setAttribute('aria-pressed',String(dark));}
try{applyTheme(localStorage.getItem('gentle-theme')==='dark');}catch{applyTheme(false);}
$('#theme').addEventListener('click',()=>{const dark=!document.body.classList.contains('dark');applyTheme(dark);try{localStorage.setItem('gentle-theme',dark?'dark':'light');}catch{ /* The page works when storage is unavailable. */ }});
const chapters=$$('.chapter');let ticking=false;
function updateReading(){const total=document.documentElement.scrollHeight-innerHeight;$('#progress').style.width=`${total>0?scrollY/total*100:0}%`;let current=chapters[0];for(const chapter of chapters){if(chapter.getBoundingClientRect().top<180)current=chapter;}$$('.sidebar nav a').forEach(a=>{const active=a.hash===`#${current.id}`;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});ticking=false;}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateReading);ticking=true;}},{passive:true});addEventListener('resize',updateReading);updateReading();
