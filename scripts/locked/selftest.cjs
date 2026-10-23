const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {render,validate,verify}=require('./render.cjs');
(async()=>{
 verify();const dest=path.resolve(process.argv[2]||'locked-selftest-'+Date.now());if(fs.existsSync(dest))throw Error('Self-test destination must not exist');fs.mkdirSync(dest,{recursive:true});const results=[];
 for(const style of ['table','comparison','sales']){
  const example=JSON.parse(fs.readFileSync(path.join(__dirname,'examples',style+'.json'),'utf8'));
  for(const mode of ['baseline','long-content','one-row']){
   const d=JSON.parse(JSON.stringify(example));
   if(mode==='long-content'){
    d.title='长中文标题与English超长内容安全换行测试：保持原配色、字体、圆角、圆点和对齐，不缩小字号，也不截断内容。';
    d.rows=Array.from({length:12},(_,i)=>JSON.parse(JSON.stringify(example.rows[i%example.rows.length])));
    if(style==='sales')d.rows.forEach((r,i)=>{r.name='第'+(i+1)+'行：长中文名称与LongUnbrokenEnglishIdentifierWithoutSpaces';r.description='说明文字\n包含换行与特殊字符 <script>alert(1)</script> & "quotes"';r.value1='12345678901234567890';r.status='处理完成\n需要复核'});
    else d.rows.forEach((r,i)=>{r[0]='第'+(i+1)+'项：中文名称和LongUnbrokenEnglishIdentifierWithoutSpaces';r[1]='12345678901234567890';r[2]='多行内容\n保持完整'});
   }
   if(mode==='one-row')d.rows=d.rows.slice(0,1);
   const input=path.join(dest,style+'-'+mode+'.json');fs.writeFileSync(input,JSON.stringify(d,null,2));
   const out=path.join(dest,style+'-'+mode);const report=await render(input,out);results.push({style,mode,pass:report.pass,width:report.width,height:report.height});
   if(mode==='baseline'){
    const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
    results.at(-1).identicalPngBytes=hash(path.join(out,'output.png'))===hash(path.join(__dirname,'references',style+'.png'));
    if(!results.at(-1).identicalPngBytes)throw Error('Baseline image differs from approved reference. Check browser/fonts/OS. Do not deliver as an identical reproduction.');
   }
  }
 }
 const good=JSON.parse(fs.readFileSync(path.join(__dirname,'examples/sales.json'),'utf8'));
 for(const [name,bad]of [['reject-css',{...good,css:'body{color:red}'}],['reject-extra-columns',{style:'table',title:'x',headers:['a'],rows:[['b']],metrics:[]}],['reject-empty-rows',{...good,rows:[]}],['reject-html-as-config',{...good,fontSize:10}]]){let rejected=false;try{validate(bad)}catch{rejected=true}if(!rejected)throw Error(name+' did not reject invalid data');results.push({name,pass:true})}
 fs.writeFileSync(path.join(dest,'SUMMARY.json'),JSON.stringify({time:new Date().toISOString(),results},null,2));console.log('PASS: '+results.length+' test cases. '+dest);
})().catch(e=>{console.error(e);process.exitCode=1});
