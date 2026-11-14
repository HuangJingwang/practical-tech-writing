#!/usr/bin/env node
'use strict';
// Shared SVG style; scenes may select a light background without changing semantic colors.
const fs = require('node:fs');
const path = require('node:path');
const themePath = path.join(__dirname, '../assets/technical-diagrams/theme.json');
const T = JSON.parse(fs.readFileSync(themePath, 'utf8'));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const widthOf = (s, size) => [...String(s)].reduce((w,c) => w + size * (/[^\x00-\xff]/.test(c) ? 1 : 0.63), 0);
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const assert = (ok,msg) => { if (!ok) throw new Error(msg); };

function render(scene) {
  const W = T.geometry.width, H = scene.height || T.geometry.height;
  const background = scene.background ?? T.colors.paper;
  assert(typeof background === 'string' && /^#[0-9a-fA-F]{6}$/.test(background), 'Background must be a six-digit hex color');
  const C = {...T.colors, paper:background}, G = T.geometry;
  assert(Number.isFinite(H) && H >= 400, 'Invalid height');
  const text = (x,y,s,size=T.type.label,weight=400,anchor='middle',mono=false,color=C.ink) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${mono ? T.monoFont : T.font}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(s)}</text>`;
  const nodes = scene.nodes.map(n => ({w:216,h:112,role:'neutral',shape:'box',...n}));
  const map = new Map(nodes.map(n=>[n.id,n]));
  assert(map.size === nodes.length,'Duplicate node ids');
  for (const n of nodes) {
    assert(['neutral','core','external','pending','failure'].includes(n.role),`Unknown role: ${n.id}`);
    assert(['box','decision'].includes(n.shape),`Unknown shape: ${n.id}`);
    assert([n.x,n.y,n.w,n.h].every(Number.isFinite),`Invalid geometry: ${n.id}`);
    assert(n.w>0 && n.h>=80 && n.x>=G.margin && n.y>=160 && n.x+n.w<=W-G.margin && n.y+n.h<=H-G.margin,`Node outside safe area: ${n.id}`);
    const allowed = n.shape==='decision' ? n.w * 0.52 : n.w - 2*G.padding;
    assert(widthOf(n.title,n.code?T.type.code:T.type.node)<=allowed,`Title too long; enlarge/split node: ${n.id}`);
    assert(!n.detail || (n.shape==='box' && widthOf(n.detail,T.type.note)<=allowed),`Detail too long or in diamond: ${n.id}`);
  }
  for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++) assert(!overlap(nodes[i],nodes[j]),`Overlapping nodes: ${nodes[i].id}, ${nodes[j].id}`);
  const port = ({id,port}) => {
    const n=map.get(id); assert(n,`Missing node: ${id}`);
    const p={left:[n.x,n.y+n.h/2],right:[n.x+n.w,n.y+n.h/2],top:[n.x+n.w/2,n.y],bottom:[n.x+n.w/2,n.y+n.h]}[port];
    assert(p,`Invalid port: ${id}`); return p;
  };
  const edges = (scene.edges||[]).map(e=>({...e,points:[port(e.from),...(e.via||[]),port(e.to)]}));
  assert(!edges.some(e=>e.dashed) || scene.legend,'Dashed edges require an explicit legend');
  const labels=[];
  for(const e of edges) {
    for(let i=1;i<e.points.length;i++) {
      const [a,b]=[e.points[i-1],e.points[i]];
      assert([...a,...b].every(Number.isFinite),'Invalid edge coordinate');
      assert(a[0]===b[0] || a[1]===b[1],'Use orthogonal routes');
      assert([...a,...b].length===4,'Invalid route point');
      for(const p of [a,b]) assert(p[0]>=G.margin && p[0]<=W-G.margin && p[1]>=140 && p[1]<=H-G.margin,'Edge outside safe area');
      const bounds={x:Math.min(a[0],b[0]),y:Math.min(a[1],b[1]),w:Math.abs(a[0]-b[0])||0.1,h:Math.abs(a[1]-b[1])||0.1};
      for(const n of nodes.filter(n=>n.id!==e.from.id && n.id!==e.to.id)) assert(!overlap(bounds,n),`Edge crosses node: ${n.id}`);
    }
    if(e.label) {
      const {x,y,text:s}=e.label,w=widthOf(s,T.type.label)+12;
      const rect={x:x-w/2,y:y-21,w,h:28};
      assert(Number.isFinite(x)&&Number.isFinite(y)&&rect.x>=0&&rect.x+w<=W&&y>=24&&y<=H-24,'Invalid label');
      for(const n of nodes) assert(!overlap(rect,n),`Label overlaps node: ${s}`);
      for(const other of labels) assert(!overlap(rect,other),`Overlapping labels: ${s}`);
      labels.push(rect);
    }
  }
  const title=scene.title||'';
  assert(widthOf(title,T.type.title)<=W-2*G.margin,'Title too long');
  assert(!scene.subtitle || widthOf(scene.subtitle,T.type.note)<=W-2*G.margin,'Subtitle too long');
  const head=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<title>${esc(title)}</title><desc>${esc(scene.description||scene.subtitle||'')}</desc>
<metadata>${esc(JSON.stringify({theme:T.id,version:T.version,background:C.paper}))}</metadata>
<defs><marker id="arrow" markerWidth="${G.arrow}" markerHeight="${G.arrow}" refX="${G.arrow}" refY="${G.arrow/2}" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L${G.arrow} ${G.arrow/2} L0 ${G.arrow} Z" fill="${C.line}"/></marker></defs>
<rect width="${W}" height="${H}" fill="${C.paper}"/>`;
  const edgeSvg=edges.map(e=>`<path d="${e.points.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ')}" fill="none" stroke="${C.line}" stroke-width="${G.edge}" ${e.dashed?'stroke-dasharray="6 5"':''} marker-end="url(#arrow)"/>`).join('\n');
  const nodeSvg=nodes.map(n=>{
    const style=`fill="${C[n.role].fill}" stroke="${C[n.role].stroke}" stroke-width="${G.stroke}"`;
    const shape=n.shape==='decision'?`<polygon points="${n.x+n.w/2},${n.y} ${n.x+n.w},${n.y+n.h/2} ${n.x+n.w/2},${n.y+n.h} ${n.x},${n.y+n.h/2}" ${style}/>`:`<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${G.radius}" ${style}/>`;
    return shape+text(n.x+n.w/2,n.y+n.h/2+(n.detail?-8:8),n.title,n.code?T.type.code:T.type.node,600,'middle',!!n.code)+(n.detail?text(n.x+n.w/2,n.y+n.h/2+25,n.detail,T.type.note,400,'middle',false,C.muted):'');
  }).join('\n');
  const labelSvg=edges.filter(e=>e.label).map(e=>{
    const l=e.label,w=widthOf(l.text,T.type.label)+12;
    return `<rect x="${l.x-w/2}" y="${l.y-21}" width="${w}" height="28" fill="${C.paper}"/>`+text(l.x,l.y,l.text);
  }).join('\n');
  return head+text(G.margin,76,title,T.type.title,600,'start')+(scene.subtitle?text(G.margin,116,scene.subtitle,T.type.note,400,'start',false,C.muted):'')+edgeSvg+nodeSvg+labelSvg+(scene.legend?text(G.margin,H-52,scene.legend,T.type.note,400,'start',false,C.muted):'')+'</svg>\n';
}

async function main() {
  const [input,prefix,...flags]=process.argv.slice(2);
  assert(input&&prefix,'Usage: node technical-diagram-kit.cjs scene.json output-prefix [--png]');
  const scene=JSON.parse(fs.readFileSync(input,'utf8'));
  const svg=render(scene);
  for(const ext of ['.svg',...(flags.includes('--png')?['.png']:[])]) assert(!fs.existsSync(prefix+ext),`Refusing overwrite: ${prefix+ext}; choose a new version`);
  fs.mkdirSync(path.dirname(prefix),{recursive:true});
  if(flags.includes('--png')) {
    // Fail before delivering assets if raster dependency or required fonts are absent.
    if(process.platform==='darwin') {
      const containsFont=(dir,name)=>{
        try { return fs.readdirSync(dir,{withFileTypes:true}).some(e=>e.isFile()?e.name===name:e.isDirectory()&&containsFont(path.join(dir,e.name),name)); }
        catch { return false; }
      };
      const fontAssets='/System/Library/AssetsV2';
      const hasPingFang=containsFont('/System/Library/Fonts','PingFang.ttc')||(fs.existsSync(fontAssets)&&fs.readdirSync(fontAssets).filter(n=>/^com_apple_MobileAsset_Font\d+$/.test(n)).some(n=>containsFont(path.join(fontAssets,n),'PingFang.ttc')));
      assert(hasPingFang && fs.existsSync('/System/Library/Fonts/Menlo.ttc'),'Check PingFang SC and Menlo installation before exporting');
    } else {
      assert(process.env.DIAGRAM_FONT_CONFIRMED==='1','Verify PingFang SC and Menlo are installed, then set DIAGRAM_FONT_CONFIRMED=1');
    }
    const sharp=require('sharp');
    await sharp(Buffer.from(svg),{density:72*T.exportScale}).flatten({background:scene.background ?? T.colors.paper}).toColourspace('srgb').png().toFile(prefix+'.png');
  }
  fs.writeFileSync(prefix+'.svg',svg);
  console.log(JSON.stringify({theme:T.id,svg:prefix+'.svg',png:flags.includes('--png')?prefix+'.png':null}));
}
module.exports={render,theme:T};
if(require.main===module) main().catch(e=>{console.error(e.message);process.exitCode=1;});
