"use strict";
// Formulários, arrays, criação de elementos, JSON e localStorage.
const key='aulas-tarefas-v1';let tasks=[];
try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))tasks=saved.filter(t=>t&&typeof t.text==='string'&&typeof t.done==='boolean');}catch{}
const list=document.querySelector('#list'),status=document.querySelector('#status');
function save(){try{localStorage.setItem(key,JSON.stringify(tasks));status.textContent='Alterações salvas neste navegador.';}catch{status.textContent='Não foi possível salvar. Os dados permanecem apenas nesta sessão.';}}
function render(){list.replaceChildren();if(!tasks.length){status.textContent='Nenhuma tarefa cadastrada.';return;}tasks.forEach((task,index)=>{
 const li=document.createElement('li'),check=document.createElement('input'),span=document.createElement('span'),remove=document.createElement('button');
 check.type='checkbox';check.checked=task.done;check.setAttribute('aria-label','Concluir '+task.text);check.onchange=()=>{task.done=check.checked;save();render();};
 span.textContent=task.text;span.className=task.done?'done':'';remove.textContent='Excluir';remove.className='danger';remove.setAttribute('aria-label','Excluir '+task.text);remove.onclick=()=>{tasks.splice(index,1);save();render();};li.append(check,span,remove);list.append(li);
 });}
document.querySelector('#form').onsubmit=e=>{e.preventDefault();const input=document.querySelector('#task'),text=input.value.trim();if(!text){input.setCustomValidity('Digite uma tarefa.');input.reportValidity();return;}tasks.push({text,done:false});input.value='';save();render();input.focus();};
document.querySelector('#task').oninput=e=>e.target.setCustomValidity('');render();
