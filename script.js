(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const html=document.documentElement;

/* ============ ROUTER: home + arcade views ============ */
const nav=$('#nav');
function closeMenu(){nav.classList.remove('open');$('#burger').setAttribute('aria-expanded','false')}
function route(){
  const h=decodeURIComponent(location.hash.slice(1));
  const arcade=h==='arcade';
  html.classList.toggle('is-arcade',arcade);
  $('#navArcade').classList.toggle('on',arcade);
  if(arcade){window.scrollTo(0,0)}
  else{
    if(window.arcadeLeave)window.arcadeLeave();
    const el=h&&h!=='home'?document.getElementById(h):null;
    if(el)requestAnimationFrame(()=>el.scrollIntoView({behavior:reduced?'auto':'smooth'}));
    else if(!h||h==='home')window.scrollTo(0,0);
  }
  closeMenu();
  observeReveals();
}
addEventListener('hashchange',route);

/* ============ MOBILE MENU ============ */
$('#burger').addEventListener('click',()=>{const o=nav.classList.toggle('open');$('#burger').setAttribute('aria-expanded',o)});
$('#navOv').addEventListener('click',closeMenu);
$$('#navMenu a').forEach(a=>a.addEventListener('click',closeMenu));
addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

/* ============ REVEAL ON SCROLL + COUNT UP ============ */
function countUp(el){
  if(el.dataset.done)return;el.dataset.done=1;
  const end=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,suf=el.dataset.suffix||'';
  if(reduced||isNaN(end)){el.textContent=end.toFixed(dec)+suf;return}
  const t0=performance.now(),d=1200;
  (function f(t){const p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,3);el.textContent=(end*e).toFixed(dec)+(p===1?suf:'');if(p<1)requestAnimationFrame(f)})(t0);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');io.unobserve(e.target);
  $$('[data-count]',e.target).forEach(countUp);
  if(e.target.matches('[data-count]'))countUp(e.target);
}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
function observeReveals(){$$('.rv:not(.in),.fly:not(.in)').forEach(el=>{if(!el.dataset.o){el.dataset.o=1;io.observe(el)}})}

/* ============ SCROLL: hero frame scale + toolkit ring ============ */
const heroFrame=$('#heroFrame'),ring=$('#ring'),tkPanel=$('.tk-panel');
let tick=false;
function onScroll(){
  if(tick)return;tick=true;
  requestAnimationFrame(()=>{
    tick=false;
    if(heroFrame){
      if(innerWidth>=1200&&!reduced){const p=Math.min(1,Math.max(0,scrollY/(innerHeight*.6)));heroFrame.style.transform=`translateY(${-190*(1-p)}px) scale(${.64+.36*p})`}
      else heroFrame.style.transform='';
    }
    if(ring&&tkPanel&&!reduced){
      const r=tkPanel.getBoundingClientRect(),vh=innerHeight;
      const p=Math.min(1,Math.max(0,(vh-r.top)/(vh+r.height)));
      ring.style.setProperty('--rot',(p*90).toFixed(2));
    }
  });
}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);

/* ============ BEFORE / AFTER SWITCH ============ */
(function(){
  const cmp=$('#cmp'),tog=$('#cmpTog');if(!cmp)return;
  const set=s=>{cmp.dataset.state=s;tog.setAttribute('aria-checked',s==='after')};
  $$('[data-set]',cmp).forEach(b=>b.addEventListener('click',()=>set(b.dataset.set)));
  let sx=null,moved=false;
  tog.addEventListener('pointerdown',e=>{sx=e.clientX;moved=false;tog.setPointerCapture(e.pointerId)});
  tog.addEventListener('pointermove',e=>{if(sx!==null&&Math.abs(e.clientX-sx)>6)moved=true});
  tog.addEventListener('pointerup',e=>{
    if(sx===null)return;const dx=e.clientX-sx;sx=null;
    if(moved){set(dx>0?'after':'before')}else set(cmp.dataset.state==='before'?'after':'before');
  });
  tog.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight')set('after');else if(e.key==='ArrowLeft')set('before');
    else if(e.key===' '||e.key==='Enter'){e.preventDefault();set(cmp.dataset.state==='before'?'after':'before')}
  });
})();

/* ============ HOW I BUILD: step tabs with progress ============ */
(function(){
  const box=$('#steps');if(!box)return;
  const tabs=$$('.tab',box),steps=$$('.step',box);let cur=0;
  function go(i){
    cur=i;
    tabs.forEach((t,k)=>{t.classList.remove('on');t.setAttribute('aria-selected',k===i)});
    void box.offsetWidth;tabs[i].classList.add('on');
    steps.forEach((s,k)=>s.classList.toggle('on',k===i));
  }
  tabs.forEach((t,i)=>t.addEventListener('click',()=>go(i)));
  tabs.forEach(t=>t.addEventListener('animationend',()=>{if(!reduced)go((cur+1)%tabs.length)}));
})();

/* ============ FAQ ACCORDION ============ */
$$('.qa-q').forEach(q=>q.addEventListener('click',()=>{
  const item=q.parentElement,open=!item.classList.contains('open');
  $$('.qa.open').forEach(o=>{o.classList.remove('open');$('.qa-q',o).setAttribute('aria-expanded','false')});
  if(open){item.classList.add('open');q.setAttribute('aria-expanded','true')}
}));

/* ============ FIELD WEATHER CHIP CYCLE ============ */
(function(){
  const cw=$$('#chipStage .cw');if(!cw.length||reduced)return;let i=0;
  setInterval(()=>{cw[i].classList.remove('on');i=(i+1)%cw.length;cw[i].classList.add('on')},2600);
})();

/* ============ SINE CURVE DRAW-ON ============ */
(function(){
  const p=$('#sinePath');if(!p)return;
  if(reduced)return;
  p.style.strokeDasharray='1';p.style.strokeDashoffset='1';
  const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){p.style.transition='stroke-dashoffset 2.2s cubic-bezier(.44,0,.56,1)';p.style.strokeDashoffset='0';o.disconnect()}}),{threshold:.4});
  o.observe(p);
})();

/* ============ TOOLKIT: note under the ring ============ */
(function(){
  const note=$('#tkNote');if(!note)return;
  const show=b=>{note.innerHTML='<b>'+b.dataset.name+':</b> '+b.dataset.why;$$('.tool').forEach(t=>t.classList.toggle('sel',t===b))};
  $$('.tool').forEach(b=>{
    b.addEventListener('mouseenter',()=>show(b));b.addEventListener('focus',()=>show(b));b.addEventListener('click',()=>show(b));
  });
})();

/* ============ CASE-STUDY POPUP (data kept from the old site) ============ */
const TINT={fluidide:'#e8effd',azheat:'#fff1e0',lockin:'#e6f7f0',fieldweather:'#e2f5ff',apexgraph:'#fdeceb',globalwarming:'#fff1e0'};
const CV={
 fluidide:`<svg class="cv" viewBox="0 0 200 140"><rect x="24" y="20" width="152" height="100" rx="14" class="s"/><path d="M24 44h152" class="s2"/><circle cx="40" cy="32" r="3" class="f"/><circle cx="52" cy="32" r="3" class="f"/><circle cx="64" cy="32" r="3" class="f"/><path d="M42 62c16-5 24 6 40 0M42 78c28-6 50 6 78-2M42 94c14-4 20 6 36 0" class="s2"/><rect x="124" y="88" width="8" height="14" class="f"/></svg>`,
 azheat:`<svg class="cv" viewBox="0 0 200 140"><circle cx="58" cy="44" r="17" class="s"/><path d="M58 16v-8M58 80v-8M28 44h-8M96 44h-8M38 24l-6-6M78 64l6 6M78 24l6-6M38 64l-6 6" class="s2"/><path d="M114 96c0-16 32-16 32 0 0 15-16 28-16 28s-16-13-16-28z" class="s"/><circle cx="130" cy="98" r="5" class="f"/><path d="M120 44c18 0 24 14 12 20 14 4 10 20-6 20h-18" class="s2"/></svg>`,
 lockin:`<svg class="cv" viewBox="0 0 200 140"><circle cx="100" cy="70" r="44" class="s2" stroke-dasharray="5 9"/><path d="M78 34h44v8c0 12-16 18-22 26-6-8-22-14-22-26z" class="s"/><path d="M78 106h44v-8c0-12-16-18-22-26-6 8-22 14-22 26z" class="s"/><circle cx="100" cy="70" r="2.6" class="f"/></svg>`,
 fieldweather:`<svg class="cv" viewBox="0 0 200 140"><circle cx="132" cy="40" r="16" class="s2"/><path d="M52 74c-10 0-18-8-16-18 2-12 18-16 26-8 4-14 28-16 34 0 16-2 24 12 14 22 10 2 10 18-4 18H54c-16 0-18-12-2-14z" class="s"/><path d="M58 98l-6 14M76 98l-6 16M94 98l-6 14" class="s2"/></svg>`,
 apexgraph:`<svg class="cv" viewBox="0 0 200 140"><path d="M28 112h144M40 20v104" class="s2"/><path d="M40 88c20-56 40 32 60-30 20-44 40 44 60-12" class="s"/><circle cx="100" cy="58" r="4" class="f"/></svg>`,
 globalwarming:`<svg class="cv" viewBox="0 0 200 140"><path d="M26 112V72h20v40M54 112V52h24v60M86 112V82h18v30M112 112V62h22v50" class="s2"/><rect x="152" y="26" width="16" height="62" rx="8" class="s"/><circle cx="160" cy="98" r="12" class="s"/><rect x="156" y="48" width="8" height="44" rx="4" class="f"/></svg>`};
const PROJECTS={
 fluidide:{meta:'personal project &middot; 2026',title:'FluidIDE',tags:['JavaScript','Web dev'],role:'solo build',status:'live',url:'https://fluidide.vercel.app',flag:'live',
  problem:"Most code editors pile on menus, panels and popups before you've written a line, and that clutter costs real attention when you're trying to stay in flow.",
  build:["FluidIDE is an editor where every panel, transition and shortcut is designed to stay out of the way. No popups you didn't ask for, no settings screen that needs a tutorial.","Still evolving, but syntax highlighting, file switching and the layout are solid enough that I use it for my own side projects."]},
 azheat:{meta:'personal project &middot; 2026',title:'AZ Heat Relief',tags:['Full-stack','Maps'],role:'solo build',status:'live',url:'https://heatreliefaz.vercel.app',flag:'live',
  problem:"Phoenix summers sit past 110°F for weeks, and the people who most need a cooling center &mdash; outdoor workers, people without stable housing, anyone without reliable AC &mdash; have the least time to hunt for one.",
  build:["AZ Heat Relief pulls public cooling-center data into one searchable map, so the nearest place to cool down or refill a bottle is a few taps away.","It's small, and it's the project I'm proudest of: built to help someone through a rough day rather than to impress anyone."]},
 lockin:{meta:'personal project &middot; 2026',title:'Lock In',tags:['JavaScript'],role:'solo build',status:'live',url:'https://lockin-arjun.vercel.app',flag:'live',
  problem:"Every focus timer I tried was doing too much &mdash; streaks, leaderboards, upsells &mdash; so it became one more thing competing for my attention instead of protecting it.",
  build:["Lock In does one thing: pick a length, press play, get quiet. No account, no streak to maintain, nothing else on screen."]},
 fieldweather:{meta:'personal project &middot; 2026',title:'Field Weather',tags:['Full-stack','API'],role:'solo build',status:'live',url:'https://fieldweather.vercel.app',flag:'live',
  problem:"Most weather apps hand you a number and stop, leaving you to guess what it means for what to wear or how the day will actually feel.",
  build:["Field Weather runs live conditions through rules I wrote for what counts as cold-and-clear versus humid-and-overcast, then matches that to a fit and a playlist.","A small experiment in making a boring utility feel personal."]},
 apexgraph:{meta:'personal project &middot; 2025',title:'Apex Graphing Calculator',tags:['JavaScript','Parsers'],role:'solo build',status:'live',url:'https://apexgraphing.vercel.app',flag:'live',
  problem:"Free graphing calculators exist, but most hide the interesting part: how a raw string like y = sin(x) * x^2 becomes something a computer can actually draw.",
  build:["Apex parses that string itself &mdash; order of operations, implicit multiplication, undefined values &mdash; and paints the result on a canvas in real time.","Getting the parser right taught me more about interpreters than any class has."]},
 globalwarming:{meta:'frostbyte hackathon &middot; feb 2026',title:'Global Warming City Simulator',tags:['Python','Hackathon','1st place'],role:'team of 4',status:'hackathon build',url:'',flag:'1st place',
  problem:"In eight hours our team wanted to show, not tell, how rising temperatures ripple through a city's grid, infrastructure and daily life &mdash; instead of shipping one more abstract chart.",
  build:["A city-scale simulation of how heat compounds across systems over time. I made a presentation and helped our ideas reach the judges better, along with many webpages of HTML leading up to the game, while my teammates built the interface and visualization.","We took first place, the first hackathon win for all four of us."]}};

const sheet=$('#sheet');let lastFocus=null;
function openSheet(k){
  const p=PROJECTS[k];if(!p)return;
  lastFocus=document.activeElement;
  $('#shCover').style.background=TINT[k];$('#shCover').innerHTML=CV[k];
  $('#shMeta').innerHTML=p.meta;$('#shTitle').textContent=p.title;
  $('#shProblem').innerHTML=p.problem;
  $('#shBuild').innerHTML=p.build.map(t=>`<p>${t}</p>`).join('');
  $('#shRole').textContent=p.role;$('#shStatus').textContent=p.status;
  $('#shTags').innerHTML=p.tags.map(t=>`<span class="tagpill">${t}</span>`).join('');
  const l=$('#shLink');
  if(p.url){l.href=p.url;l.style.display='inline-flex'}else l.style.display='none';
  sheet.classList.add('on');document.body.style.overflow='hidden';sheet.scrollTop=0;
  $('#sheetX').focus();
}
function closeSheet(){sheet.classList.remove('on');document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus()}
document.addEventListener('click',e=>{const t=e.target.closest('.tile[data-p]');if(t)openSheet(t.dataset.p)});
document.addEventListener('keydown',e=>{
  const t=e.target.closest&&e.target.closest('.tile[data-p]');
  if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openSheet(t.dataset.p)}
  if(e.key==='Escape'&&sheet.classList.contains('on'))closeSheet();
  if(e.key==='Tab'&&sheet.classList.contains('on')){
    const f=$$('a[href],button',sheet).filter(x=>x.offsetParent!==null);if(!f.length)return;
    const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
    else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
  }
});
$('#sheetX').addEventListener('click',closeSheet);
sheet.addEventListener('click',e=>{if(e.target===sheet)closeSheet()});

/* ============ PROGRESSIVE BLUR (bottom) ============ */
(function(){
  const box=$('#pblur');if(!box)return;
  for(let i=0;i<8;i++){
    const d=document.createElement('div');let m;
    if(i<6)m=`linear-gradient(to top,transparent ${i*12.5}%,#000 ${(i+1)*12.5}%,#000 ${(i+2)*12.5}%,transparent ${(i+3)*12.5}%)`;
    else if(i===6)m='linear-gradient(to top,transparent 75%,#000 87.5%,#000 100%)';
    else m='linear-gradient(to top,transparent 87.5%,#000 100%)';
    d.style.cssText=`-webkit-mask-image:${m};mask-image:${m};-webkit-backdrop-filter:blur(${.078125*Math.pow(2,i)}px);backdrop-filter:blur(${.078125*Math.pow(2,i)}px)`;
    box.appendChild(d);
  }
})();

document.getElementById('yr')&&(document.getElementById('yr').textContent=new Date().getFullYear());

/* ============ COOKIE JAR ============ */
function confetti(){
  if(reduced)return;
  const cols=['#3b82f6','#406ae4','#5290f4','#10b981','#fdbb6e','#f28778'];
  for(let i=0;i<36;i++){
    const b=document.createElement('span');
    b.style.cssText=`position:fixed;z-index:900;pointer-events:none;width:8px;height:12px;border-radius:2px;background:${cols[(Math.random()*cols.length)|0]};left:${Math.random()*100}vw;top:-20px`;
    document.body.appendChild(b);
    b.animate([{transform:'translateY(0) rotate(0)'},{transform:`translateY(105vh) rotate(${540+Math.random()*360}deg)`}],
     {duration:1600+Math.random()*1200,easing:'cubic-bezier(.3,.1,.5,1)'}).onfinish=()=>b.remove();
  }
}
const FORTUNES=["You will find the bug at 11:47pm and fix it by midnight.",
 "A hackathon idea you scribble on a napkin will actually work.",
 "Your next commit message will be more honest than the last one.",
 "Someone on your team will finally push their branch.",
 "The heat outside is temporary. Your cooling-center app is forever.",
 "You will beat your own Debug Memory best time. Probably.",
 "Your code compiles on the first try. Once. Enjoy it.",
 "Volleyball practice will out-tire the all-nighter, not the other way around.",
 "The semicolon was never the problem. It was the typo above it."];
const fortune=$('#fortune'),fortuneText=$('#fortuneText'),jar=$('#jar');
const roll=()=>{fortuneText.textContent=FORTUNES[(Math.random()*FORTUNES.length)|0]};
jar.onclick=()=>{const was=fortune.classList.contains('on');fortune.classList.toggle('on',!was);jar.setAttribute('aria-expanded',!was);if(!was){roll();confetti()}};
$('#fAnother').onclick=roll;
$('#fClose').onclick=()=>{fortune.classList.remove('on');jar.setAttribute('aria-expanded','false')};

/* ============ LO-FI PLAYER ============ */
(function(){
 const playBtn=$('#playBtn'),nextBtn=$('#nextBtn'),trackName=$('#trackName');
 const TRACKS=[{name:'rainy window keys',bpm:76,ch:[[261.63,329.63,392,493.88],[220,277.18,329.63,415.3],[174.61,220,261.63,349.23],[196,246.94,293.66,369.99]]},
  {name:'late study session',bpm:82,ch:[[293.66,349.23,440,523.25],[261.63,311.13,392,466.16],[220,277.18,329.63,415.3],[246.94,293.66,349.23,440]]},
  {name:'sunday morning drift',bpm:68,ch:[[220,261.63,329.63,392],[196,233.08,293.66,349.23],[174.61,220,261.63,329.63],[164.81,207.65,246.94,311.13]]}];
 let i=0,ctx,gain,lp,playing=false,timer,nc=0,nb=0,cs=0,bs=0;
 const player=$('#player');
 function init(){if(ctx)return;ctx=new (window.AudioContext||window.webkitAudioContext)();
  gain=ctx.createGain();gain.gain.value=.4;lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1700;
  lp.connect(gain);gain.connect(ctx.destination);
  const n=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=n.getChannelData(0);
  for(let k=0;k<d.length;k++)d[k]=(Math.random()*2-1)*.5;
  const src=ctx.createBufferSource();src.buffer=n;src.loop=true;
  const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=4200;
  const cg=ctx.createGain();cg.gain.value=.014;src.connect(hp);hp.connect(cg);cg.connect(gain);src.start()}
 const pad=(f,t,d)=>f.forEach((hz,k)=>{const o=ctx.createOscillator();o.type='triangle';o.frequency.value=hz;
  const g=ctx.createGain(),p=.085/(k*.3+1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(p,t+.6);
  g.gain.linearRampToValueAtTime(0,t+d);o.connect(g);g.connect(lp);o.start(t);o.stop(t+d+.05)});
 function kick(t){const o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(120,t);
  o.frequency.exponentialRampToValueAtTime(45,t+.13);const g=ctx.createGain();g.gain.setValueAtTime(.3,t);
  g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(gain);o.start(t);o.stop(t+.25)}
 function noise(t,hz,v,len,type){const b=ctx.createBuffer(1,ctx.sampleRate*len,ctx.sampleRate),d=b.getChannelData(0);
  for(let k=0;k<d.length;k++)d[k]=(Math.random()*2-1)*(1-k/d.length);
  const s=ctx.createBufferSource();s.buffer=b;const f=ctx.createBiquadFilter();f.type=type;f.frequency.value=hz;
  const g=ctx.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+len);
  s.connect(f);f.connect(g);g.connect(gain);s.start(t)}
 function sched(){const t=TRACKS[i],bd=60/t.bpm,bar=bd*4;
  while(nc<ctx.currentTime+.35){pad(t.ch[cs%t.ch.length],nc,bar);nc+=bar;cs++}
  while(nb<ctx.currentTime+.35){const p=bs%8;if(p===0||p===4)kick(nb);if(p===2||p===6)noise(nb,1800,.16,.12,'bandpass');
   noise(nb,7000,p%2?.03:.055,.05,'highpass');nb+=bd/2;bs++}
  timer=setTimeout(sched,100)}
 function start(){init();if(ctx.state==='suspended')ctx.resume();nc=nb=ctx.currentTime+.1;cs=bs=0;sched();
  playing=true;player.classList.add('on');playBtn.textContent='pause'}
 function stop(){playing=false;clearTimeout(timer);if(ctx)ctx.suspend();player.classList.remove('on');playBtn.textContent='play'}
 playBtn.onclick=()=>playing?stop():start();
 nextBtn.onclick=()=>{i=(i+1)%TRACKS.length;trackName.textContent=TRACKS[i].name;if(playing){stop();start()}};
})();

/* ============ BOOT ============ */
observeReveals();onScroll();
if(location.hash&&location.hash!=='#arcade'&&location.hash!=='#home'){requestAnimationFrame(()=>route())}
else{$('#navArcade').classList.toggle('on',location.hash==='#arcade')}
})();

(function(){
'use strict';
const stage=document.getElementById('stage');
const filters=document.getElementById('filters'),lib=document.getElementById('lib'),cabIcon=document.getElementById('cabIcon'),
  cabTitle=document.getElementById('cabTitle'),cabTag=document.getElementById('cabTag'),cabChips=document.getElementById('cabChips');
const BEST={};
let cur=null;
function ctxFor(){
  const cleanup=[]; const c={dead:false};
  c.every=(f,ms)=>{const id=setInterval(f,ms);cleanup.push(()=>clearInterval(id));return id};
  c.after=(f,ms)=>{const id=setTimeout(f,ms);cleanup.push(()=>clearTimeout(id));return id};
  c.wait=ms=>new Promise(r=>c.after(r,ms));
  c.loop=(f,watch)=>{let last=performance.now(),stop=false;
    const step=t=>{if(stop||c.dead||(watch&&!watch.isConnected))return;const dt=Math.min((t-last)/1000,.05);last=t;f(dt);requestAnimationFrame(step)};
    requestAnimationFrame(step);cleanup.push(()=>stop=true)};
  c.keys=f=>{const h=e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();f(e)};
    window.addEventListener('keydown',h,{passive:false});cleanup.push(()=>window.removeEventListener('keydown',h))};
  c.html=h=>{stage.innerHTML=h;return stage};
  c.q=s=>stage.querySelector(s); c.qa=s=>[...stage.querySelectorAll(s)];
  c.set=(k,v)=>{const el=document.querySelector(`[data-chip="${k}"]`);if(el)el.textContent=v};
  c.best=(k,v,better)=>{const id=c.gid+'|'+k;const old=BEST[id];
    if(old===undefined||better(v,old)){BEST[id]=v;c.set(k,v);renderLib();return true}return false};
  c.splash=(title,body,keys,btn)=>new Promise(res=>{
    c.html(`<div class="splash"><h4>${title}</h4><p>${body}</p>${keys?`<div class="keycaps">${keys.map(k=>`<kbd>${k}</kbd>`).join('')}</div>`:''}<button class="play-btn">${btn||'Play'}</button></div>`);
    c.q('button').onclick=res});
  c.over=(title,body,btn)=>new Promise(res=>{
    c.html(`<div class="over"><h4>${title}</h4><p>${body}</p><button class="play-btn">${btn||'Play again'}</button></div>`);
    c.q('button').onclick=res});
  c.destroy=()=>{c.dead=true;cleanup.forEach(f=>f());stage.innerHTML=''};
  return c;
}
const ico=(d,extra='')=>`<svg viewBox="0 0 48 48" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${d}${extra}</svg>`;
const GAMES=[];
const G=(o)=>GAMES.push(o);
function renderLib(){
  lib.innerHTML=GAMES.filter(g=>filter==='All'||g.cat===filter).map(g=>{
    const b=Object.entries(BEST).filter(([k])=>k.startsWith(g.id+'|'))[0];
    return `<button class="gcard ${cur&&cur.gid===g.id?'on':''}" data-game="${g.id}">
      <div class="art" style="background:${g.grad}">${b?`<span class="best">${b[1]}</span>`:''}${g.icon}</div>
      <div class="info"><b>${g.title}</b><span>${g.tag}</span></div></button>`}).join('');
}
let filter='All';
const CATS=['All','Arcade','Puzzle','Reflex','Words','Toys'];
filters.innerHTML=CATS.map(c=>`<button class="filter ${c==='All'?'on':''}" data-cat="${c}">${c}</button>`).join('')+
  `<span class="arcade-count" id="arcadeCount"></span>`;
filters.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;
  filter=b.dataset.cat;filters.querySelectorAll('.filter').forEach(f=>f.classList.toggle('on',f===b));renderLib();
  document.getElementById('arcadeCount').textContent=GAMES.filter(g=>filter==='All'||g.cat===filter).length+' games'});
lib.addEventListener('click',e=>{const b=e.target.closest('[data-game]');if(!b)return;mount(b.dataset.game)});
function mount(id){
  const g=GAMES.find(x=>x.id===id);
  if(cur)cur.destroy();
  cur=ctxFor(); cur.gid=id;
  cabIcon.style.background=g.grad; cabIcon.innerHTML=g.icon;
  cabTitle.textContent=g.title; cabTag.textContent=g.blurb;
  cabChips.innerHTML=g.stats.map(s=>`<div class="chip"><i>${s}</i><b data-chip="${s}"> - </b></div>`).join('');
  Object.entries(BEST).forEach(([k,v])=>{const [gid,st]=k.split('|');if(gid===id)cur.set(st,v)});
  renderLib();
  g.run(cur);
}

/* ============================================================
   GAMES (copied from the old index.html)
   ============================================================ */
G({id:'memory',title:'Debug Memory',tag:'Match pairs from my stack',cat:'Puzzle',blurb:'Eight pairs from the toolkit  -  clear the board in as few moves as you can.',
 grad:'var(--accent)',stats:['Moves','Time','Best'],
 icon:ico('<rect x="9" y="14" width="18" height="24" rx="4"/><rect x="21" y="10" width="18" height="24" rx="4"/>'),
 async run(g){
  const P=['JavaScript','Python','HTML','CSS','C','Firebase','GitHub','AI / ML'];
  while(!g.dead){
   await g.splash('Debug Memory','Flip two cards at a time and match all eight pairs from my actual toolkit.',null,'Start game');
   let moves=0,sec=0,open=[],done=0,lock=false;
   g.set('Moves',0);g.set('Time','0:00');
   g.html(`<div class="mgrid">${[...P,...P].map(()=>0).map(()=>'').join('')}</div>`);
   const deck=[...P,...P].sort(()=>Math.random()-.5);
   g.q('.mgrid').innerHTML=deck.map(n=>`<button class="mcard" data-n="${n}"><span class="inner"><span class="mface mfront">?</span><span class="mface mback">${n}</span></span></button>`).join('');
   const clock=g.every(()=>{sec++;g.set('Time',Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'))},1000);
   await new Promise(res=>{
    g.q('.mgrid').onclick=e=>{
     const c=e.target.closest('.mcard'); if(!c||lock||c.classList.contains('flip'))return;
     c.classList.add('flip'); open.push(c);
     if(open.length<2)return;
     moves++;g.set('Moves',moves);lock=true;
     const [a,b]=open;
     if(a.dataset.n===b.dataset.n){a.classList.add('done');b.classList.add('done');open=[];lock=false;
       if(++done===P.length)res();}
     else{a.classList.add('bad');b.classList.add('bad');
       g.after(()=>{a.className='mcard';b.className='mcard';open=[];lock=false},650)}
    }});
   clearInterval(clock);
   const t=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
   const nb=g.best('Best',t,(v,o)=>v.length<o.length||v<o);
   await g.over('Board cleared','Finished in '+moves+' moves and '+t+'.'+(nb?' New best time.':''));
  }}});

G({id:'typing',title:'Snippet Sprint',tag:'Type real lines of my code',cat:'Reflex',blurb:'Real lines pulled out of my own projects. Timer starts on your first keystroke.',
 grad:'var(--sage)',stats:['WPM','Accuracy','Best'],
 icon:ico('<rect x="6" y="14" width="36" height="20" rx="4"/><path d="M14 22h2M22 22h4M32 22h2M15 28h18"/>'),
 async run(g){
  const S=["const focusMode = true; runTimer(25 * 60);","function parse(expr) { return tokenize(expr).map(evaluate); }",
   "if (temp > 105) { showCoolingCenters(nearestFive); }","db.collection('users').doc(uid).set({ streak: 0 });",
   "for (let i = 0; i < board.length; i++) flipCard(board[i]);","git commit -m 'fix: memory leak in canvas renderer'"];
  while(!g.dead){
   await g.splash('Snippet Sprint','Type the line exactly as it appears. Accuracy counts as much as speed.',null,'Start typing');
   const text=S[Math.floor(Math.random()*S.length)];let t0=null;
   g.html(`<div class="typebox"><div class="prompt" id="pr"></div><input class="hidden-input" id="ti" autocomplete="off" spellcheck="false"><p class="note" style="margin-top:12px">Just type  -  the field is already focused.</p></div>`);
   const pr=g.q('#pr'),ti=g.q('#ti');
   const paintTxt=v=>{pr.innerHTML=[...text].map((ch,i)=>{const s=ch===' '?'&nbsp;':ch.replace(/</g,'&lt;').replace(/>/g,'&gt;');
     return i<v.length?`<span class="${v[i]===ch?'ok':'no'}">${s}</span>`:i===v.length?`<span class="cur">${s}</span>`:`<span>${s}</span>`}).join('')};
   paintTxt('');ti.focus();g.q('.typebox').onclick=()=>ti.focus();
   await new Promise(res=>{ti.oninput=()=>{if(t0===null)t0=Date.now();paintTxt(ti.value);if(ti.value.length>=text.length)res()}});
   const mins=Math.max((Date.now()-t0)/60000,.02),wpm=Math.round((text.length/5)/mins);
   let ok=0;[...text].forEach((c,i)=>{if(ti.value[i]===c)ok++});
   const acc=Math.round(ok/text.length*100);
   g.set('WPM',wpm);g.set('Accuracy',acc+'%');
   const nb=g.best('Best',wpm,(v,o)=>v>o);
   await g.over(wpm+' WPM',acc+'% accuracy on that line.'+(nb?' New personal best.':''),'Try another');
  }}});

G({id:'reaction',title:'Reaction Relay',tag:'Five rounds, pure reflex',cat:'Reflex',blurb:'Wait for the panel to light up, then hit the circle. Click early and the round restarts.',
 grad:'var(--clay)',stats:['Round','Last','Best avg'],
 icon:ico('<circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="4" fill="rgba(255,255,255,.95)"/>'),
 async run(g){
  while(!g.dead){
   await g.splash('Reaction Relay','Five rounds. The moment the target appears, click it.',null,'Start test');
   const times=[];
   g.html(`<div class="center-col"><div class="rzone" id="z"><p class="note" id="zt">Wait for it…</p><span class="rtarget" id="t"></span></div><div class="dots" id="d">${'<i></i>'.repeat(5)}</div></div>`);
   const z=g.q('#z'),zt=g.q('#zt'),tg=g.q('#t'),dots=g.qa('#d i');
   for(let r=0;r<5&&!g.dead;){
    z.className='rzone';zt.style.display='';zt.textContent='Wait for it…';tg.classList.remove('on');
    let live=false,shown=0;
    const hit=await new Promise(res=>{
      const wait=g.after(()=>{z.className='rzone go';zt.style.display='none';
        tg.style.left=20+Math.random()*(z.clientWidth-104)+'px';tg.style.top=20+Math.random()*(z.clientHeight-104)+'px';
        tg.classList.add('on');shown=performance.now();live=true},900+Math.random()*2000);
      z.onclick=e=>{if(live&&e.target===tg)res(Math.round(performance.now()-shown));
        else if(!live){clearTimeout(wait);res(-1)}}});
    if(hit<0){z.className='rzone early';zt.style.display='';zt.textContent='Too soon. Restarting the round.';await g.wait(800);continue}
    times.push(hit);dots[r].classList.add('hit');r++;
    g.set('Round',r+'/5');g.set('Last',hit+'ms');
    await g.wait(450);
   }
   if(g.dead)return;
   const avg=Math.round(times.reduce((a,b)=>a+b,0)/times.length);
   const nb=g.best('Best avg',avg+'ms',(v,o)=>parseInt(v)<parseInt(o));
   await g.over(avg+'ms average','Across five rounds.'+(nb?' New session best.':''),'Run it back');
  }}});

G({id:'trivia',title:'Term Match',tag:'Web, security and AI quiz',cat:'Words',blurb:'Eight questions on the things I actually study and build with.',
 grad:'var(--accent)',stats:['Score','Time','Best'],
 icon:ico('<path d="M10 10h28v20H26l-8 7 1-7h-9z"/><path d="M21 18c0-4 6-4 6 0s-3 3-3 6"/>'),
 async run(g){
  const Q=[["What does CSS stand for?",["Cascading Style Sheets","Creative Style System","Computer Styled Syntax","Code Structure Sheets"],0],
   ["Which NoSQL database is in my own toolkit?",["MySQL","Cloud Firestore","PostgreSQL","SQLite"],1],
   ["In security, what is phishing?",["A firewall rule","A type of encryption","Tricking someone into handing over sensitive info","A password hashing method"],2],
   ["What does GPU stand for?",["Graphics Processing Unit","General Purpose Unit","Global Processing Utility","Graphic Program Update"],0],
   ["What language runs both ends of a full-stack JS app?",["Python","JavaScript","C","Swift"],1],
   ["What is Git mainly for?",["Styling pages","Sending email","Version control","Running servers"],2],
   ["In machine learning, a model is trained on…",["CSS files","Data","Firewalls","Browser tabs"],1],
   ["What does API stand for?",["Application Programming Interface","Automated Program Instruction","Applied Protocol Index","Application Process Integration"],0]];
  while(!g.dead){
   await g.splash('Term Match','Eight multiple choice questions. Pick an answer and it moves on  -  no going back.',null,'Start quiz');
   let score=0,sec=0;g.set('Score','0/8');
   const clock=g.every(()=>{sec++;g.set('Time',Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'))},1000);
   const order=Q.map((_,i)=>i).sort(()=>Math.random()-.5);
   for(let n=0;n<order.length&&!g.dead;n++){
    const [q,opts,a]=Q[order[n]];
    g.html(`<div class="quiz"><div class="prog">Question ${n+1} of 8</div><h4>${q}</h4><div class="opts">${
      opts.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}</div></div>`);
    await new Promise(res=>{g.q('.opts').onclick=e=>{const b=e.target.closest('.opt');if(!b)return;
      g.qa('.opt').forEach((x,i)=>{x.disabled=true;if(i===a)x.classList.add('right')});
      if(+b.dataset.i===a)score++;else b.classList.add('wrong');
      g.set('Score',score+'/8');g.after(res,620)}});
   }
   clearInterval(clock);
   if(g.dead)return;
   const nb=g.best('Best',score+'/8',(v,o)=>parseInt(v)>parseInt(o));
   await g.over(score+' out of 8',score===8?'Perfect run.':'Time: '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')+(nb?' · new best':''),'Retake quiz');
  }}});

G({id:'bugs',title:'Bug Squasher',tag:'15 seconds of whack-a-bug',cat:'Reflex',blurb:'Fifteen seconds. Click each bug before it ducks back into the code.',
 grad:'var(--rose)',stats:['Squashed','Time left','Best'],
 icon:ico('<ellipse cx="24" cy="26" rx="9" ry="12"/><path d="M24 14v24M15 18l-6-4M15 26H7M15 34l-6 4M33 18l6-4M33 26h8M33 34l6 4"/>'),
 async run(g){
  const POS=[[14,10],[10,42],[16,74],[58,6],[56,44],[60,76]];
  while(!g.dead){
   await g.splash('Bug Squasher','Fifteen seconds on the clock. Misses cost you nothing, so click fast.',null,'Start squashing');
   let score=0,left=15;g.set('Squashed',0);g.set('Time left','15s');
   g.html(`<div class="arena" id="ar">${POS.map(([t,l])=>`<span class="hole" style="top:${t}%;left:${l}%"><span class="critter">${
     ico('<ellipse cx="24" cy="26" rx="9" ry="12"/><path d="M24 14v24M15 18l-6-4M15 26H7M15 34l-6 4M33 18l6-4M33 26h8M33 34l6 4"/>')}</span></span>`).join('')}</div>`);
   const bugs=g.qa('.critter');
   let live=true;
   const pop=()=>{if(g.dead||!live)return;bugs.forEach(b=>b.classList.remove('up'));
     const b=bugs[Math.floor(Math.random()*bugs.length)];b.classList.add('up');
     g.after(()=>{b.classList.remove('up');g.after(pop,110+Math.random()*180)},430+Math.random()*450)};
   pop();
   g.q('#ar').onclick=e=>{const b=e.target.closest('.critter');if(!b||!b.classList.contains('up'))return;
     b.classList.remove('up');score++;g.set('Squashed',score);
     const f=document.createElement('span');f.className='flash';f.textContent='+1';
     f.style.left=e.offsetX+'px';f.style.top=e.offsetY+'px';b.parentElement.appendChild(f);setTimeout(()=>f.remove(),600)};
   await new Promise(res=>{const t=g.every(()=>{left--;g.set('Time left',left+'s');if(left<=0){clearInterval(t);res()}},1000)});
   live=false;
   if(g.dead)return;
   const nb=g.best('Best',score,(v,o)=>v>o);
   await g.over(score+' squashed','In fifteen seconds.'+(nb?' New best.':''),'Run it back');
  }}});

G({id:'simon',title:'Signal Sequence',tag:'Watch the pattern, repeat it',cat:'Puzzle',blurb:'The sequence grows by one every round. One wrong tile ends it.',
 grad:'var(--sky)',stats:['Round','Status','Best'],
 icon:ico('<rect x="8" y="8" width="14" height="14" rx="3"/><rect x="26" y="8" width="14" height="14" rx="3"/><rect x="8" y="26" width="14" height="14" rx="3"/><rect x="26" y="26" width="14" height="14" rx="3"/>'),
 async run(g){
  while(!g.dead){
   await g.splash('Signal Sequence','Four tiles light up in order. Play them back exactly.',null,'Start sequence');
   const seq=[];let round=0;
   g.html(`<div class="center-col"><div class="board simon">${'<button class="tile"></button>'.repeat(4)}</div><p class="note" id="st">Watch</p></div>`);
   const tiles=g.qa('.simon .tile'),st=g.q('#st');
   let alive=true;
   while(alive&&!g.dead){
    round++;g.set('Round',round);seq.push(Math.floor(Math.random()*4));
    g.set('Status','Watch');st.textContent='Watch the sequence';
    await g.wait(450);
    for(const i of seq){if(g.dead)return;tiles[i].classList.add('lit');await g.wait(400);tiles[i].classList.remove('lit');await g.wait(140)}
    g.set('Status','Your turn');st.textContent='Your turn';
    for(let s=0;s<seq.length;s++){
     const pick=await new Promise(res=>{tiles.forEach((t,i)=>t.onclick=()=>{t.classList.add('lit');setTimeout(()=>t.classList.remove('lit'),180);res(i)})});
     if(pick!==seq[s]){alive=false;break}
    }
    if(alive)await g.wait(400);
   }
   if(g.dead)return;
   g.set('Status','Missed');
   const nb=g.best('Best',round-1,(v,o)=>v>o);
   await g.over('Round '+round,'The sequence broke there.'+(nb?' New best run.':''),'Try again');
  }}});

G({id:'rush',title:'Click Rush',tag:'Five seconds, max clicks',cat:'Reflex',blurb:'Pure clicks per second. Five seconds, starting the moment you begin.',
 grad:'var(--sage)',stats:['Clicks','Time left','Best CPS'],
 icon:ico('<circle cx="24" cy="24" r="14"/><path d="M24 24V14M24 24l8 5"/>'),
 async run(g){
  while(!g.dead){
   await g.splash('Click Rush','Five seconds. Hit the button as many times as you can.',null,'Start the clock');
   let clicks=0,end=performance.now()+5000;g.set('Clicks',0);
   g.html(`<button id="rt" style="width:180px;height:180px;border-radius:50%;color:#fff;font-weight:700;font-size:15px;background:var(--accent)">Click me</button>`);
   g.q('#rt').onclick=()=>{clicks++;g.set('Clicks',clicks)};
   await new Promise(res=>{const t=g.every(()=>{const r=Math.max(0,(end-performance.now())/1000);
     g.set('Time left',r.toFixed(1)+'s');if(r<=0){clearInterval(t);res()}},50)});
   if(g.dead)return;
   const cps=(clicks/5).toFixed(1);
   const nb=g.best('Best CPS',cps,(v,o)=>parseFloat(v)>parseFloat(o));
   await g.over(cps+' clicks/sec',clicks+' clicks in five seconds.'+(nb?' New best.':''),'Run it back');
  }}});

G({id:'excuse',title:'Excuse Roulette',tag:'Why the build failed',cat:'Toys',blurb:'A perfectly reasonable explanation for any broken build. Use responsibly.',
 grad:'var(--clay)',stats:['Spins'],
 icon:ico('<rect x="7" y="13" width="34" height="22" rx="5"/><circle cx="17" cy="24" r="4"/><circle cx="24" cy="24" r="4"/><circle cx="31" cy="24" r="4"/>'),
 async run(g){
  const E=["It works on my machine.","That's not a bug, it's an undocumented feature.","The code was fine until I touched the CSS.",
   "Someone must have force-pushed over my fix.","It's a caching issue. It's always a caching issue.",
   "The tests pass locally, which is the only environment that matters.","I blame the semicolon I removed at 1am.",
   "The intern renamed a variable. I am the intern.","It's not broken, the deadline moved.",
   "My editor autosaved a version from three edits ago.","It only breaks in front of the client. Always.",
   "I was testing the error state. On purpose. The whole time.","The API docs were wrong. Or I was. Unclear.",
   "It compiled, which is basically the same as working.","I refactored it into a worse but funnier bug.",
   "Git said everything was up to date. Git lied."];
  await g.splash('Excuse Roulette','Spin up a reason for the bug, the missed deadline or the red pipeline.',null,'Spin an excuse');
  let n=0,last=-1;
  g.html(`<div class="center-col" style="max-width:460px"><div class="prompt" id="ex" style="text-align:center;font-family:var(--display);font-size:19px;display:grid;place-items:center;min-height:150px"></div><button class="play-btn small" id="sp">Spin again</button></div>`);
  const spin=()=>{let i;do{i=Math.floor(Math.random()*E.length)}while(i===last&&E.length>1);last=i;n++;
    g.set('Spins',n);const ex=g.q('#ex');ex.style.opacity=0;ex.textContent=E[i];
    requestAnimationFrame(()=>{ex.style.transition='opacity .25s';ex.style.opacity=1})};
  spin(); g.q('#sp').onclick=spin;
 }});

G({id:'snake',title:'Terminal Snake',tag:'Eat the semicolons',cat:'Arcade',blurb:'Arrow keys or swipe. Every semicolon you eat makes the line longer.',
 grad:'var(--sage)',stats:['Score','Length','Best'],
 icon:ico('<path d="M10 14h16v10H20v10h18"/><circle cx="38" cy="34" r="3" fill="rgba(255,255,255,.95)"/>'),
 async run(g){
  const N=17,S=20;
  while(!g.dead){
   await g.splash('Terminal Snake','Steer with the arrow keys or WASD. Walls and your own tail both end the run.',['←','↑','↓','→'],'Start crawling');
   const cv=document.createElement('canvas');cv.width=cv.height=N*S;
   g.html('<div class="center-col"></div>');g.q('.center-col').append(cv);
   const x=cv.getContext('2d');
   let snake=[{x:8,y:8}],dir={x:1,y:0},nd=dir,food={x:13,y:8},score=0,acc=0,speed=.11,over=false;
   const place=()=>{do{food={x:(Math.random()*N)|0,y:(Math.random()*N)|0}}while(snake.some(s=>s.x===food.x&&s.y===food.y))};
   g.keys(e=>{const k=e.key.toLowerCase();
     if((k==='arrowup'||k==='w')&&dir.y===0)nd={x:0,y:-1};
     if((k==='arrowdown'||k==='s')&&dir.y===0)nd={x:0,y:1};
     if((k==='arrowleft'||k==='a')&&dir.x===0)nd={x:-1,y:0};
     if((k==='arrowright'||k==='d')&&dir.x===0)nd={x:1,y:0}});
   let t0=null;
   cv.addEventListener('pointerdown',e=>t0=[e.clientX,e.clientY]);
   cv.addEventListener('pointerup',e=>{if(!t0)return;const dx2=e.clientX-t0[0],dy2=e.clientY-t0[1];
     if(Math.abs(dx2)>Math.abs(dy2)){if(dir.x===0)nd={x:dx2>0?1:-1,y:0}}else{if(dir.y===0)nd={x:0,y:dy2>0?1:-1}};t0=null});
   const css=k=>getComputedStyle(document.documentElement).getPropertyValue(k).trim();
   await new Promise(res=>{
    g.loop(dt=>{
     acc+=dt; if(acc>=speed){acc=0;dir=nd;
      const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
      if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(s=>s.x===h.x&&s.y===h.y)){over=true;res();return}
      snake.unshift(h);
      if(h.x===food.x&&h.y===food.y){score+=10;g.set('Score',score);g.set('Length',snake.length);place();speed=Math.max(.055,speed-.003)}
      else snake.pop();
     }
     x.fillStyle=css('--paper-dim');x.fillRect(0,0,cv.width,cv.height);
     x.fillStyle=css('--clay');x.font='bold 15px Inter, sans-serif';x.textAlign='center';x.textBaseline='middle';
     x.fillText(';',food.x*S+S/2,food.y*S+S/2);
     snake.forEach((s,i)=>{x.fillStyle=i?css('--accent'):css('--rose');x.globalAlpha=i?Math.max(.35,1-i/28):1;
      x.beginPath();x.roundRect(s.x*S+1.5,s.y*S+1.5,S-3,S-3,4);x.fill()});
     x.globalAlpha=1;
    },cv)});
   if(g.dead)return;
   const nb=g.best('Best',score,(v,o)=>v>o);
   await g.over(score+' points','Length '+snake.length+'.'+(nb?' New high score.':''),'Crawl again');
  }}});

/* >>> PASTE THE REST OF YOUR GAMES HERE <<<
   Your pasted file stopped after Terminal Snake (9 games). Add the remaining
   G({id:'...', ...}); blocks above this comment and the shelf, the filters and the
   arcade counts (page lead + "Games in my arcade" stat) update on their own.
   Styles for tic-tac-toe, 2048, minesweeper, connect 4, wordle, lights out and
   slide puzzle are already in the CSS. */

/* ============ SHELF + CABINET INIT ============ */
function resetCab(){
  cabIcon.style.background='var(--surface)';cabIcon.innerHTML='';
  cabTitle.textContent='Pick a game';cabTag.textContent='Choose one from the shelf above.';cabChips.innerHTML='';
  stage.innerHTML='<div class="splash"><h4>Nothing running yet</h4><p>Pick a game from the shelf and it loads right here.</p></div>';
}
function counts(){
  const n=GAMES.length;
  const lead=document.getElementById('arcadeLead');if(lead)lead.textContent=n+' games';
  const gc=document.getElementById('gamesCount');if(gc){gc.dataset.count=n;if(!gc.dataset.done)gc.textContent=n}
  document.getElementById('arcadeCount').textContent=n+' games';
}
window.arcadeLeave=function(){
  if(cur){cur.destroy();cur=null;resetCab();renderLib()}
};
counts();renderLib();resetCab();
})();
