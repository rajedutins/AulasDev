"use strict";
// Variáveis, funções, eventos e DOM.
let count=0;
const value=document.querySelector('#value');
function render(){value.textContent=count;}
document.querySelector('#minus').onclick=()=>{count--;render();};
document.querySelector('#plus').onclick=()=>{count++;render();};
document.querySelector('#reset').onclick=()=>{count=0;render();};
