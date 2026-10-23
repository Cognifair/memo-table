'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const root=__dirname;
function digest(p){return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}
function verify(){const manifest=JSON.parse(fs.readFileSync(path.join(root,'LOCK.json'),'utf8'));for(const [file,hash]of Object.entries(manifest)){if(digest(path.join(root,file))!==hash)throw Error('LOCK FAILED: '+file+' was modified. Restore the original package; edit data JSON only.')}}
function playwright(){try{return require('playwright')}catch{const base=process.env.LOCALAPPDATA?path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'):'';if(base&&fs.existsSync(base))return require(base);throw Error('Playwright missing. Set NODE_PATH to your existing runtime packages.')}}
function validate(d){
 const obj=(v)=>v&&typeof v==='object'&&!Array.isArray(v);
 const keys=(v,allowed,where)=>{if(!obj(v))throw Error(where+' must be an object');for(const k of Object.keys(v))if(!allowed.includes(k))throw Error(where+': unknown field '+k)};
 const str=(v,where)=>{if(typeof v!=='string'||v.length>4000)throw Error(where+' must be a string of <=4000 characters');return v};
 keys(d,['style','title','headers','rows','metrics'],'input');
 if(!['table','comparison','sales'].includes(d.style))throw Error('style must be table, comparison or sales');str(d.title,'title');if(!d.title.trim())throw Error('title is required');
 if(!Array.isArray(d.rows)||!d.rows.length||d.rows.length>100)throw Error('rows must contain 1–100 items');
 if(d.style==='sales'){
  if(d.headers!==undefined||d.metrics!==undefined)throw Error('sales does not accept headers or metrics');
  d.rows.forEach((r,i)=>{keys(r,['name','description','value1','value2','year','status'],'row '+i);for(const k of ['name','description','value1','value2','year','status'])str(r[k],k)});
 }else{
  const n=d.style==='table'?4:5;
  if(!Array.isArray(d.headers)||d.headers.length!==n)throw Error(d.style+' requires exactly '+n+' headers (fixed approved layout)');d.headers.forEach(x=>str(x,'header'));
  d.rows.forEach(r=>{if(!Array.isArray(r)||r.length!==n)throw Error('Each row must have '+n+' cells');r.forEach(x=>str(x,'cell'))});
  if(d.style==='table'){if(!Array.isArray(d.metrics)||d.metrics.length!==2)throw Error('This approved indicator-card template requires exactly two metrics; do not invent them.');d.metrics.forEach(m=>{keys(m,['value','caption'],'metric');str(m.value,'metric value');str(m.caption,'caption')})}
  else if(d.metrics!==undefined)throw Error('comparison does not accept metrics');
 }
}
async function render(input,outDir){
 verify();const d=JSON.parse(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''));validate(d);
 outDir=path.resolve(outDir);if(fs.existsSync(outDir)&&fs.readdirSync(outDir).length)throw Error('Output directory must be new or empty (no silent overwrite).');fs.mkdirSync(outDir,{recursive:true});
 const candidates=[process.env.MEMO_TABLE_BROWSER,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
 const executablePath=candidates.find(p=>fs.existsSync(p));if(!executablePath)throw Error('No local browser. Set MEMO_TABLE_BROWSER; do not auto-download browsers.');
 const {chromium}=playwright();const browser=await chromium.launch({headless:true,executablePath});
 try{
  const width={table:903,comparison:949,sales:1022}[d.style];const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:2});await page.route('**/*',r=>r.abort());
  await page.setContent(fs.readFileSync(path.join(root,'templates',d.style+'.html'),'utf8'));
  await page.evaluate(d=>{
   const q=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];const txt=(el,s)=>{el.textContent=s;el.style.whiteSpace='pre-wrap';el.style.overflowWrap='anywhere';el.dataset.check='1'};
   txt(q('h1'),d.title);
   if(d.style==='table'){
    all('thead th').forEach((el,i)=>txt(el,d.headers[i]));const parent=q('tbody'),proto=parent.firstElementChild.cloneNode(true);parent.replaceChildren();for(const row of d.rows){const el=proto.cloneNode(true);[...el.children].forEach((c,i)=>txt(c,row[i]));parent.append(el)}all('.stat').forEach((el,i)=>{txt(el.querySelector('.number'),d.metrics[i].value);txt(el.querySelector('.description'),d.metrics[i].caption)});
   }else if(d.style==='sales'){
    const parent=q('.panel'),proto=q('.row').cloneNode(true);all('.row').forEach(e=>e.remove());d.rows.forEach((r,i)=>{const el=proto.cloneNode(true);for(const [s,v]of [['.index',String(i+1)],['.name',r.name],['.desc',r.description],['.year',r.year],['.done',r.status]])txt(el.querySelector(s),v);el.querySelectorAll('.value').forEach((c,j)=>txt(c,r['value'+(j+1)]));parent.append(el)});
   }else{
    const h=all('.heading>div');[0,1,3,5,6].forEach((j,i)=>txt(h[j],d.headers[i]));const parent=q('.card'),proto=q('.row').cloneNode(true);all('.row').forEach(e=>e.remove());d.rows.forEach((r,i)=>{const el=proto.cloneNode(true);el.classList.toggle('featured',i===0);[0,1,3,5,6].forEach((j,k)=>{if(k===0&&r[k]==='X5'){el.children[j].querySelector('span').textContent='X5'}else txt(el.children[j],r[k])});parent.append(el)});
   }
   // Fixed geometry, font size and palette. Only explicit wrapping and measured height growth are permitted.
   if(d.style==='table'){
    const title=q('h1');title.style.maxWidth='calc(100% - 180px)';title.style.textAlign='center';const bar=q('.titlebar');bar.style.height=Math.max(48,title.scrollHeight+24)+'px';q('.dots').style.top=(bar.offsetHeight/2-5)+'px';
   }else if(d.style==='comparison'){
    q('h1').style.maxWidth='calc(100% - 104px)';q('.dots').style.top=(36+q('h1').offsetHeight/2-17)+'px';
   }else{
    const t=q('.title');t.style.height='auto';t.style.minHeight='56px';t.style.padding='10px 12px';t.style.textAlign='center';q('.top').style.height=Math.max(66,t.offsetHeight+10)+'px';
   }
   for(const el of all('.row')){
    const base=d.style==='sales'?67:96;
    for(const c of [...el.children]){c.style.minWidth='0';if(!c.classList.contains('index'))c.style.overflowWrap='anywhere'}
    if(d.style==='comparison'){for(const c of [...el.children]){if(c.classList.contains('label')||c.classList.contains('delta')){c.style.height='auto';c.style.alignSelf='stretch'}if(c.classList.contains('delta'))c.style.whiteSpace='pre-wrap';const range=document.createRange();range.selectNodeContents(c);if(!c.classList.contains('arrow')&&range.getBoundingClientRect().height>parseFloat(getComputedStyle(c).fontSize)*1.5)c.style.paddingLeft=c.style.paddingRight='12px'}}
    // A fixed-size chip must grow vertically for long labels, never shrink its text.
    const chip=el.querySelector('.done');if(chip){chip.style.height='auto';chip.style.minHeight='34px';chip.style.padding='6px 8px';chip.style.textAlign='center'}
    el.style.height='auto';el.style.minHeight=base+'px';
    const need=Math.max(...[...el.children].map(c=>{const range=document.createRange();range.selectNodeContents(c);return range.getBoundingClientRect().height}))+24;
    el.style.height=Math.max(base,Math.ceil(need))+'px';
   }
   if(d.style==='comparison')q('.heading').style.height=Math.max(100,...all('.heading>div').map(c=>c.scrollHeight+42))+'px';
   const panel=q('.panel')||q('.card');const original=panel.getBoundingClientRect().height;
   if(d.style==='table')panel.style.height=Math.max(original,q('.titlebar').offsetHeight+q('.content').offsetHeight)+'px';
   if(d.style==='comparison'){const last=all('.row').at(-1);panel.style.height=Math.max(original,last.offsetTop+last.offsetHeight+30)+'px'}
   const canvas=q('.canvas'),pad=getComputedStyle(canvas);canvas.style.height=Math.ceil(Math.max(parseFloat(pad.height),parseFloat(pad.paddingTop)+panel.getBoundingClientRect().height+parseFloat(pad.paddingBottom)))+'px';
  },d);
  await page.evaluate(()=>document.fonts.ready);
  const report=await page.evaluate(()=>{
   const errors=[];const canvas=document.querySelector('.canvas'),cr=canvas.getBoundingClientRect();
   const nodes=[...document.querySelectorAll('[data-check]')];
   for(const el of nodes){const r=el.getBoundingClientRect();if(el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2)errors.push('overflow: '+el.textContent.slice(0,60));
    const range=document.createRange();range.selectNodeContents(el);for(const tr of range.getClientRects())if(tr.left<r.left-2||tr.right>r.right+2||tr.top<r.top-2||tr.bottom>r.bottom+2)errors.push('text out of bounds: '+el.textContent.slice(0,60));
    if(r.left<cr.left-1||r.right>cr.right+1||r.bottom>cr.bottom+1)errors.push('outside canvas');
   }
   const title=document.querySelector('h1').getBoundingClientRect(),dots=document.querySelector('.dots').getBoundingClientRect();if(title.right>dots.left&&title.left<dots.right&&title.top<dots.bottom&&title.bottom>dots.top)errors.push('title/dots overlap');
   const cells=[...document.querySelectorAll('.row, tr')];for(const row of cells){const children=[...row.children].map(el=>el.getBoundingClientRect());for(let i=1;i<children.length;i++)if(children[i-1].right>children[i].left+2)errors.push('cell overlap');}
   if(document.documentElement.scrollWidth>cr.width+1)errors.push('horizontal canvas overflow');
   return {errors:[...new Set(errors)],width:cr.width,height:cr.height,deviceScaleFactor:2,fonts:document.fonts.status,fontFamily:getComputedStyle(document.body).fontFamily};
  });
  if(report.height>16000)report.errors.push('Canvas exceeds 16000 CSS px; split the input into multiple images.');
  report.template=d.style;report.browser=browser.version();report.inputSHA256=digest(input);report.pass=!report.errors.length;report.note='Geometry checks do not prove semantic correctness or every glyph. Visually inspect the PNG, especially on a different OS/font runtime.';
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2));
  if(!report.pass)throw Error('LAYOUT CHECK FAILED: '+report.errors.join('; ')+' (see report.json). No final PNG produced.');
  await page.setViewportSize({width,height:Math.ceil(report.height)});
  await page.locator('.canvas').screenshot({path:path.join(outDir,'output.png'),omitBackground:true});
  fs.writeFileSync(path.join(outDir,'output.html'),await page.content());fs.copyFileSync(input,path.join(outDir,'input.json'));console.log(JSON.stringify({output:outDir,...report}));return report;
 }finally{await browser.close()}
}
module.exports={render,validate,verify};
if(require.main===module){const [a,b]=process.argv.slice(2);if(!a||!b){console.error('Usage: node render.cjs input.json NEW_OUTPUT_DIRECTORY');process.exitCode=1}else render(path.resolve(a),b).catch(e=>{console.error(e.message);process.exitCode=1})}
