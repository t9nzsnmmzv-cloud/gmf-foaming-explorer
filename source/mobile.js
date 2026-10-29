import QRCode from 'qrcode';
window.addEventListener('error',()=>{const loading=document.getElementById('loading');if(loading){loading.textContent='三维模型暂未启动。请刷新重试，或使用 Safari、Chrome、Edge 浏览器打开。';}});
const siteURL=new URL('./',location.href).href;
const mobileLayout=matchMedia('(max-width:1023px)');
const pairs=[['toggle-parts','parts-pane'],['toggle-info','info-pane'],['toggle-process','process-pane']];let lastOpener=null;
function closePane(restore=false){for(const [button,pane] of pairs){document.getElementById(pane).classList.remove('is-open');document.getElementById(button).setAttribute('aria-expanded','false');}document.getElementById('pane-backdrop').hidden=true;if(restore)lastOpener?.focus();}
function openPane(id){if(!mobileLayout.matches)return;const pane=document.getElementById(id),isOpen=pane.classList.contains('is-open');closePane();if(!isOpen){pane.classList.add('is-open');document.getElementById('pane-backdrop').hidden=false;const pair=pairs.find(([,p])=>p===id);if(pair){lastOpener=document.getElementById(pair[0]);lastOpener.setAttribute('aria-expanded','true');}pane.querySelector('button,input')?.focus({preventScroll:true});}}
for(const [button,pane]of pairs)document.getElementById(button).onclick=()=>openPane(pane);
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>closePane(true);
document.getElementById('pane-backdrop').onclick=()=>closePane(true);document.getElementById('selection-card').onclick=()=>openPane('info-pane');
document.getElementById('tree').addEventListener('click',e=>{if(e.target.closest('[data-part]')&&mobileLayout.matches)closePane();});
for(const id of ['focus','section-info'])document.getElementById(id).addEventListener('click',()=>closePane());
document.getElementById('section-info').onclick=()=>document.getElementById('section').click();
mobileLayout.addEventListener('change',()=>closePane());document.addEventListener('keydown',e=>{if(e.key==='Escape')closePane(true);});
window.addEventListener('gmf:select',e=>{document.getElementById('selection-name').textContent=e.detail.name;document.getElementById('selection-function').textContent=e.detail.fn;});
const shareDialog=document.getElementById('share-dialog');document.getElementById('open-share').onclick=()=>{document.getElementById('copy-status').textContent='';shareDialog.showModal();QRCode.toDataURL(siteURL,{width:464,margin:2,errorCorrectionLevel:'M'}).then(data=>{document.getElementById('share-qr').src=data;}).catch(()=>{});};document.getElementById('close-share').onclick=()=>shareDialog.close();
async function copyLink(){try{await navigator.clipboard.writeText(siteURL);document.getElementById('copy-status').textContent='网址已复制';}catch{document.getElementById('copy-status').textContent=siteURL;}}
document.getElementById('copy-link').onclick=copyLink;document.getElementById('native-share').onclick=async()=>{if(navigator.share){try{await navigator.share({title:'格林美孚 · 3D发泡设备',url:siteURL});}catch(e){if(e.name!=='AbortError')await copyLink();}}else await copyLink();};
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
