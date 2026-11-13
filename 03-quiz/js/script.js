"use strict";
// Arrays, objetos, eventos, pontuação e estado da interface.
const questions=[
 {q:'Qual linguagem estrutura uma página?',a:['HTML','CSS','JavaScript'],correct:0},
 {q:'Qual linguagem define cores e layout?',a:['HTML','CSS','SQL'],correct:1},
 {q:'Qual palavra declara uma variável que pode mudar?',a:['const','return','let'],correct:2},
 {q:'Qual evento representa um clique?',a:['click','submit','load'],correct:0},
 {q:'Qual método seleciona um elemento pelo seletor CSS?',a:['Math.random','querySelector','toFixed'],correct:1}
];
let index=0,score=0;
const answers=document.querySelector('#answers'), next=document.querySelector('#next'), feedback=document.querySelector('#feedback');
function render(){
 next.hidden=true;feedback.textContent='';answers.replaceChildren();
 document.querySelector('#progress').textContent='Pergunta '+(index+1)+' de '+questions.length;
 document.querySelector('#question').textContent=questions[index].q;
 questions[index].a.forEach((text,i)=>{const button=document.createElement('button');button.textContent=text;button.onclick=()=>{
  answers.querySelectorAll('button').forEach(b=>b.disabled=true);
  if(i===questions[index].correct){score++;feedback.textContent='Resposta correta!';}else feedback.textContent='Resposta correta: '+questions[index].a[questions[index].correct];
  next.hidden=false;
 };answers.append(button);});
}
next.onclick=()=>{index++;if(index<questions.length)render();else{answers.replaceChildren();next.hidden=true;document.querySelector('#question').textContent='Resultado: '+score+' de '+questions.length;document.querySelector('#progress').textContent='Quiz concluído';feedback.textContent='';document.querySelector('#restart').hidden=false;}};
document.querySelector('#restart').onclick=()=>{index=0;score=0;document.querySelector('#restart').hidden=true;render();};render();
