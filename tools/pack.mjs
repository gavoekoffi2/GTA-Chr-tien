import fs from 'fs';
const G='/home/user/GTA-Chr-tien/assets/';
function load(f){const b=fs.readFileSync(f);const len=b.readUInt32LE(12);const j=JSON.parse(b.slice(20,20+len).toString());const bin=b.slice(20+len+8);return {j,bin};}
function acc(g,i){const a=g.j.accessors[i],bv=g.j.bufferViews[a.bufferView];const n={SCALAR:1,VEC3:3,VEC4:4}[a.type];const off=(bv.byteOffset||0)+(a.byteOffset||0);const out=new Float32Array(a.count*n);const st=bv.byteStride||n*4;for(let k=0;k<a.count;k++)for(let c=0;c<n;c++)out[k*n+c]=g.bin.readFloatLE(off+k*st+c*4);return out;}
// joint list from a reference avatar
const av=load(G+'chars/Male_Adult_12.glb');
const joints=av.j.skins[0].joints.map(i=>av.j.nodes[i].name).filter(n=>!/Nub|Footsteps/.test(n));
if(!joints.includes('Bip01'))joints.unshift('Bip01');
const FPS=15, MAXT=9;
const meta={fps:FPS,joints,clips:{}};const chunks=[];let offset=0;
for(const f of fs.readdirSync(G+'anims').filter(f=>f.endsWith('.glb')).sort()){
  const g=load(G+'anims/'+f);const a=g.j.animations[0];const name=f.replace('.glb','');
  const ch={};let dur=0;
  for(const c of a.channels){const s=a.samplers[c.sampler];const nn=g.j.nodes[c.target.node].name;const t=acc(g,s.input);dur=Math.max(dur,t[t.length-1]);ch[nn+'|'+c.target.path]={t,v:acc(g,s.output)};}
  dur=Math.min(dur,MAXT);const nf=Math.max(2,Math.round(dur*FPS)+1);
  const samp=(c,time,n)=>{const {t,v}=c;let i=0;while(i<t.length-2&&t[i+1]<time)i++;const u=t.length<2?0:Math.min(1,Math.max(0,(time-t[i])/((t[i+1]-t[i])||1)));const o=[];const i2=Math.min(i+1,t.length-1);
    if(n==4){let d=0;for(let k=0;k<4;k++)d+=v[i*4+k]*v[i2*4+k];const sg=d<0?-1:1;let l=0;for(let k=0;k<4;k++){o[k]=v[i*4+k]*(1-u)+sg*v[i2*4+k]*u;l+=o[k]*o[k];}l=Math.sqrt(l);for(let k=0;k<4;k++)o[k]/=l;}
    else for(let k=0;k<n;k++)o[k]=v[i*n+k]*(1-u)+v[i2*n+k]*u;return o;};
  const q=new Int16Array(nf*joints.length*4);const p=new Float32Array(nf*3);
  for(let fr=0;fr<nf;fr++){const time=fr/FPS;
    joints.forEach((jn,ji)=>{const c=ch[jn+'|rotation'];let o;if(c)o=samp(c,time,4);else{const nd=g.j.nodes.find(n=>n.name==jn);o=nd?.rotation||[0,0,0,1];}
      for(let k=0;k<4;k++)q[(fr*joints.length+ji)*4+k]=Math.round(o[k]*32767);});
    const c=ch['Bip01|translation'];const o=c?samp(c,time,3):g.j.nodes.find(n=>n.name=='Bip01').translation;p.set(o,fr*3);}
  let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(let i=0;i<nf;i++)for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],p[i*3+k]);mx[k]=Math.max(mx[k],p[i*3+k]);}
  console.log(name,nf,'frames',dur.toFixed(2)+'s','hip',mn.map(x=>x.toFixed(2)),mx.map(x=>x.toFixed(2)), 'rootT',JSON.stringify(g.j.nodes.find(n=>n.name=='RootNode')?.rotation));
  const qb=Buffer.from(q.buffer),pb=Buffer.from(p.buffer);
  meta.clips[name]={nf,q:offset,p:offset+qb.length};chunks.push(qb,pb);offset+=qb.length+pb.length;
}
fs.writeFileSync(G+'anims.bin',Buffer.concat(chunks));fs.writeFileSync(G+'anims.json',JSON.stringify(meta));
console.log('total',offset, joints.length);
