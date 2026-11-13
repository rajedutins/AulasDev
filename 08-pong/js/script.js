"use strict";
// Canvas, coordenadas, velocidade, colisões e requestAnimationFrame.
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),status=document.querySelector('#status'),pause=document.querySelector('#pause');
const keys=new Set();let player=155,ai=155,ball,score=[0,0],running=false,paused=false,last=0;
function serve(direction){ball={x:320,y:200,vx:direction*280,vy:(Math.random()-.5)*240};}
function updateStatus(){status.textContent='Você '+score[0]+' × '+score[1]+' Computador'+(paused?' — Pausado':'');}
function draw(){ctx.clearRect(0,0,640,400);ctx.fillStyle='#61728b';for(let y=0;y<400;y+=25)ctx.fillRect(319,y,2,12);ctx.fillStyle='#82e0d0';ctx.fillRect(20,player,12,90);ctx.fillStyle='#ffd166';ctx.fillRect(608,ai,12,90);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,8,0,Math.PI*2);ctx.fill();}
function frame(time){const dt=Math.min((time-last)/1000||0,.035);last=time;if(running&&!paused){
 player+=((keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0))*340*dt;player=Math.max(0,Math.min(310,player));
 ai+=Math.sign(ball.y-(ai+45))*Math.min(Math.abs(ball.y-(ai+45)),220*dt);ai=Math.max(0,Math.min(310,ai));
 ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.y<8||ball.y>392){ball.y=Math.max(8,Math.min(392,ball.y));ball.vy*=-1;}
 if(ball.vx<0&&ball.x-8<=32&&ball.x>12&&ball.y>=player-8&&ball.y<=player+98){ball.x=40;ball.vx=Math.min(520,-ball.vx*1.05);ball.vy=(ball.y-player-45)*7;}
 if(ball.vx>0&&ball.x+8>=608&&ball.x<628&&ball.y>=ai-8&&ball.y<=ai+98){ball.x=600;ball.vx=-Math.min(520,ball.vx*1.05);ball.vy=(ball.y-ai-45)*7;}
 if(ball.x<0||ball.x>640){const point=ball.x>640?0:1;score[point]++;updateStatus();if(score[point]===5){running=false;pause.disabled=true;status.textContent=point===0?'Você venceu!':'O computador venceu!';}else serve(point===0?-1:1);}
 }draw();requestAnimationFrame(frame);}
document.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','w','s','W','S'].includes(e.key)){e.preventDefault();keys.add(e.key.length===1?e.key.toLowerCase():e.key);}});document.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>{keys.clear();if(running){paused=true;pause.textContent='Continuar';updateStatus();}});
canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);move(e);};canvas.onpointermove=e=>{if(e.buttons||e.pointerType==='touch')move(e);};function move(e){const r=canvas.getBoundingClientRect();player=Math.max(0,Math.min(310,(e.clientY-r.top)*400/r.height-45));}
document.querySelector('#start').onclick=()=>{score=[0,0];player=ai=155;serve(Math.random()<.5?1:-1);running=true;paused=false;pause.disabled=false;pause.textContent='Pausar';updateStatus();};pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Continuar':'Pausar';updateStatus();};serve(1);status.textContent='Clique em Iniciar.';requestAnimationFrame(frame);
