
document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',()=>{
  navigator.clipboard.writeText(btn.dataset.copy||'');
  const old=btn.textContent; btn.textContent='Copiado'; setTimeout(()=>btn.textContent=old,1100);
}));
document.querySelectorAll('.copy-code').forEach(btn=>btn.addEventListener('click',()=>{
  const code=btn.parentElement.querySelector('pre').innerText;
  navigator.clipboard.writeText(code); const old=btn.textContent; btn.textContent='Copiado'; setTimeout(()=>btn.textContent=old,1100);
}));
