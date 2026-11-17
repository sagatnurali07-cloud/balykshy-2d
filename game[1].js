'use strict';
const stages = [
  { title:'Сиқырлы балық', story:'Әкесінің кәсібін жалғастырған жігіт түсінде ауына екі сиқырлы балық түсетінін көреді. Таң атқанда ол теңіз жағасына келеді.', goal:'Теңіз жағасынан екі сиқырлы балықты тап.', icon:'fish', sky:['#224f70','#f5aa77'], items:[[280,385],[635,345]] },
  { title:'Гауһар бұрым', story:'Жігіт бір балықты сатып, екіншісін үйіне әкеледі. Үйдегі балық сұлу қызға айналады. Мұны естіген патша жігітті гауһар шашты арудың бұрымын әкелуге жібереді.', goal:'Гауһар бұрымға жет.', icon:'gem', sky:['#332856','#b97fa0'], items:[[775,335]] },
  { title:'Жұмақтың үш алмасы', story:'Жігіт гауһар бұрымды әкеледі. Патша оған тағы бір тапсырма жүктеп, жұмақтың үш алмасын сұрайды.', goal:'Бақтан үш алманы жина.', icon:'apple', sky:['#225958','#b4d591'], items:[[215,390],[440,340],[755,340]] },
  { title:'Теңіздегі сарай', story:'Үш алма қолына тиген соң, патша теңіздің ортасына сарай салуды бұйырады. Сиқырлы көгершіндер жігітке көмектеседі.', goal:'Көгершіндерге көмектесіп, сарайға төрт тас жина.', icon:'stone', sky:['#162a5d','#e19285'], items:[[205,390],[415,340],[620,350],[805,390]] }
];
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const byId = id => document.getElementById(id);
const keys = new Set();
const keyboard = {ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump'};
const platforms = [[145,420,165],[345,375,180],[565,383,155],[735,420,130]];
const player = {x:55,y:468,v:0,face:1,ground:true};
let level = 0, collected = new Set(), playing = false, mode = 'intro', jumpReady = true;
function show(title, story, label, nextMode) {
  playing = false;
  keys.clear();
  mode = nextMode;
  byId('heading').textContent = title;
  byId('story').textContent = story;
  byId('next').textContent = label;
  byId('overlay').hidden = false;
}
function updateHud() {
  const stage = stages[level];
  byId('chapter').textContent = (level+1)+' / 4 · '+stage.title;
  byId('count').textContent = collected.size+' / '+stage.items.length;
  byId('objective').textContent = stage.goal;
}
function intro() {
  collected = new Set();
  Object.assign(player,{x:55,y:468,v:0,face:1,ground:true});
  jumpReady = true;
  updateHud();
  show(stages[level].title,stages[level].story,level ? 'Кезеңді бастау' : 'Ойынды бастау','intro');
}
byId('restart').onclick = () => { level=0; intro(); };
byId('next').onclick = () => {
  if(mode==='win') { level=0; intro(); return; }
  if(mode==='next') { level++; intro(); return; }
  byId('overlay').hidden = true;
  byId('next').blur();
  playing = true;
};
window.addEventListener('keydown',e => {
  if(playing && keyboard[e.code] && !(e.target instanceof HTMLButtonElement && e.code==='Space')){
    e.preventDefault(); keys.add(keyboard[e.code]);
  }
});
window.addEventListener('keyup',e => keys.delete(keyboard[e.code]));
window.addEventListener('blur',() => keys.clear());
for(const button of document.querySelectorAll('[data-key]')) {
  const key = button.dataset.key;
  button.onpointerdown = e => { e.preventDefault(); button.setPointerCapture(e.pointerId); if(playing) keys.add(key); };
  button.onpointerup = button.onpointercancel = button.onlostpointercapture = () => keys.delete(key);
  button.onkeydown = e => { if(playing && (e.code==='Enter'||e.code==='Space')) {e.preventDefault();keys.add(key);} };
  button.onkeyup = e => { if(e.code==='Enter'||e.code==='Space') keys.delete(key); };
}
function step(dt) {
  const direction = Number(keys.has('right')) - Number(keys.has('left'));
  player.x = Math.max(18,Math.min(942,player.x + direction*290*dt));
  if(direction) player.face = direction;
  if(!keys.has('jump')) jumpReady = true;
  if(keys.has('jump') && jumpReady && player.ground){ player.v=-565; jumpReady=false; }
  const oldY = player.y;
  player.v += 1120*dt;
  player.y += player.v*dt;
  player.ground = false;
  for(const [x,y,w] of [...platforms,[0,468,960]]) {
    if(player.v>=0 && player.x+10>x && player.x-10<x+w && oldY<=y && player.y>=y){
      player.y=y; player.v=0; player.ground=true; break;
    }
  }
  stages[level].items.forEach(([x,y],i) => {
    if(!collected.has(i) && Math.abs(player.x-x)<31 && Math.abs(player.y-27-y)<39){
      collected.add(i); updateHud();
    }
  });
  if(collected.size===stages[level].items.length) {
    if(level===3) show('Ертегі аяқталды!', 'Көгершіндер сарайды тұрғызды. Кейін олар өз тастарын қайта алып кетті. Балықшының ұлы қуанышқа кенеліп, үлкен той жасады. Төрт кезеңді де аяқтадың!', 'Тағы ойнау','win');
    else show('Кезең аяқталды!', stages[level+1].title+' кезеңі алда.', 'Келесі кезең','next');
  }
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
function oval(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function shape(points,c){ctx.fillStyle=c;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function palace(x,y){
  for(let i=0;i<3;i++){
    const xx=x+i*46, yy=y-(i===1?36:0);
    rect(xx,yy,37,y+70-yy,'#204652');
    oval(xx+18,yy,20,19,'#244b58');
    rect(xx+15,yy-27,5,19,'#244b58');
    for(let j=0;j<2;j++) rect(xx+13,yy+12+j*20,9,12,'#e6ad78');
  }
}
function scenery(t){
  const stage=stages[level], gradient=ctx.createLinearGradient(0,0,0,430);
  gradient.addColorStop(0,stage.sky[0]);gradient.addColorStop(1,stage.sky[1]);rect(0,0,960,540,gradient);
  oval(747,126,64,64,'#ffe4ac16');oval(747,126,47,47,'#ffe6b4');
  for(let i=0;i<9;i++){
    let x=(i*193+t*9)%1100-85, y=65+i%4*37;
    oval(x,y,71,9,'#fff4dc28');oval(x+31,y-7,38,9,'#fff4dc28');
  }
  shape([[0,354],[0,279],[92,216],[185,291],[295,190],[414,302],[522,229],[656,310],[809,233],[960,298],[960,404]],'#294c647f');
  shape([[0,373],[0,332],[157,281],[264,353],[400,291],[549,359],[706,294],[850,340],[960,315],[960,404]],'#244f5d');
  rect(0,373,960,120,'#255f69');
  for(let i=0;i<48;i++){let x=(i*137+t*(12+i%5))%970,y=380+i*59%82;rect(x,y,10+i%6*9,1,'#a9e0cf60');}
  if(level===1||level===3) palace(485,273);
  if(level===3) for(let i=0;i<4;i++){
    const x=(t*38+i*160)%990,y=185+i%2*32,wing=Math.sin(t*10+i)*8;
    shape([[x-19,y-wing],[x,y+4],[x+18,y-wing],[x+3,y+9],[x-4,y+9]],'#fff3d6');
  }
  if(level===2) for(let i=0;i<6;i++){
    const x=75+i*167;rect(x,288,10,110,'#614b4a');oval(x,283,50,43,'#306553');oval(x+17,269,33,35,'#4e8a63');
  }
  for(const [x,y,w] of platforms){
    shape([[x,y],[x+w,y],[x+w-14,y+23],[x+13,y+29]],'#153a46');
    rect(x,y,w,6,'#bd9a69');
    for(let a=12;a<w-8;a+=21) rect(x+a,y+10,12,2,'#50777b');
  }
  rect(0,468,960,72,'#172f36');rect(0,468,960,7,'#d5ac79');
  for(let i=0;i<48;i++) rect(i*23%960,486+i*13%49,8,2,'#375154');
}
function token(type,x,y){
  oval(x,y,27,27,'#ffdf8f25');oval(x,y,20,20,'#ffe6a83b');
  if(type==='fish'){
    shape([[x-6,y],[x-19,y-9],[x-19,y+9]],'#f6b65a');oval(x+2,y,13,8,'#ffde87');oval(x+9,y-2,2,2,'#22394a');
  } else if(type==='gem'){
    shape([[x-14,y-6],[x-7,y-14],[x+7,y-14],[x+14,y-6],[x,y+15]],'#a8fcf3');
    shape([[x-14,y-6],[x+14,y-6],[x,y+15]],'#5dabc6');
  } else if(type==='apple'){
    oval(x-5,y+3,9,10,'#ff785e');oval(x+5,y+3,9,10,'#f58a61');rect(x-1,y-11,3,6,'#8b5532');oval(x+6,y-11,6,3,'#88d69d');
  } else {
    shape([[x-15,y+8],[x-10,y-9],[x+7,y-12],[x+15,y+2],[x+10,y+11]],'#e1c8a4');
    shape([[x-15,y+8],[x-10,y-9],[x-3,y+2],[x+15,y+2],[x+10,y+11]],'#ad9387');
  }
}
function hero(t){
  ctx.save();ctx.translate(player.x,player.y);ctx.scale(player.face,1);
  oval(0,1,19,5,'#07172170');
  const stride=playing && (keys.has('left')||keys.has('right')) ? Math.sin(t*19)*5 : 0;
  rect(-10+stride,-17,8,15,'#20384a');rect(3-stride,-17,8,15,'#294653');
  rect(-12+stride,-5,12,5,'#633d35');rect(2-stride,-5,12,5,'#633d35');
  shape([[-14,-39],[13,-39],[15,-15],[-14,-15]],'#e49652');
  rect(-14,-24,29,5,'#8c533d');rect(13,-35,6,14,'#f3bb88');
  oval(1,-48,11,12,'#f3bb88');oval(5,-49,2,2,'#26303b');
  oval(-2,-57,14,5,'#194c53');rect(-14,-55,28,4,'#317c76');
  ctx.restore();
}
let last=0;
function frame(time){
  const dt=Math.min((time-last)/1000,0.033);last=time;
  if(playing) step(dt);
  const t=matchMedia('(prefers-reduced-motion: reduce)').matches?0:time/1000;
  scenery(t);
  stages[level].items.forEach(([x,y],i)=>{if(!collected.has(i))token(stages[level].icon,x,y+Math.sin(t*3+i)*4);});
  hero(t);requestAnimationFrame(frame);
}
intro();
requestAnimationFrame(frame);
async function loadStories(){
  const {url,publishableKey}=window.STORY_CONFIG;
  if(!url||!publishableKey)return;
  try{
    const endpoint=new URL('/rest/v1/fisher_story_chapters',url);
    endpoint.searchParams.set('select','chapter,story');
    const response=await fetch(endpoint,{headers:{apikey:publishableKey},signal:AbortSignal.timeout(5000)});
    if(!response.ok)return;
    for(const row of await response.json()){
      const stage=stages[row.chapter-1];
      if(stage&&typeof row.story==='string'&&row.story.trim())stage.story=row.story;
    }
    if(!playing&&mode==='intro')byId('story').textContent=stages[level].story;
  }catch{ /* The bundled chapters remain available. */ }
}
loadStories();
