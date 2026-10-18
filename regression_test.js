function extractPBBlastData(path){
 let text=String(path||''),section='';
 let sm=text.match(/Peripheral\s+(?:Smear|smear)\s*:?\s*([\s\S]*?)(?=\n\s*Bone\s+Marrow\s*:|$)/i);
 if(sm)section=sm[1];
 else{let pb=text.match(/Peripheral\s+blood[\s\S]{0,1500}/i);section=pb?pb[0]:''}
 let pct=null,status='Unknown';
 let m=section.match(/\bBlasts?\s*%\s*(?:[:\t ]|\r?\n)+([0-9.]+)/i);
 if(m){pct=Number(m[1]);status=pct>0?'Present':'Absent'}
 else if(/\b(?:no|without)\s+(?:circulating|peripheral(?:\s+blood)?)?\s*blasts?\b/i.test(section))status='Absent';
 else if(/\b(?:rare|occasional|circulating)\s+blast(?:s|\s+cells?)\b/i.test(section))status='Present';
 return{status,pct}
}

function extractAspirateAdequacy(path){
 let text=String(path||''),section='';
 let m=text.match(/Aspirate(?:\s+and\s+touch\s+imprint)?\s*:?\s*([\s\S]*?)(?=\n\s*Differential\s*:|\n\s*Special\s+Stains\s*:|$)/i);
 section=m?m[1]:text;
 let hemo=/hemodilut/i.test(section),asp=/aspicular|aparticulate|no\s+spicules/i.test(section);
 if(hemo&&asp)return'Hemodilute + aspicular';
 if(hemo)return'Hemodilute / limited';
 if(asp)return'Aspicular / aparticulate';
 if(/\badequate\b|\bspicules?\s+(?:present|identified)\b/i.test(section))return'Adequate';
 return'Unknown'
}

function extractBlastData(path,flow){
 let out={aspirate:null,flow:null,ihcLow:null,ihcHigh:null,flowAdequate:true,flowPossibleUnparsed:false};

 // Aspirate/manual differential: prose patterns.
 let m=path.match(/(?:aspirate|manual differential)[^.\n]{0,100}?(?:blasts?|blast count)[^0-9]{0,20}([0-9.]+)\s*%/i);
 if(!m)m=path.match(/(?:blasts?|blast count)[^0-9]{0,20}([0-9.]+)\s*%[^.\n]{0,80}(?:aspirate|manual differential)/i);

 // Bone-marrow differential table. Scope the search to the Differential section so
 // peripheral-blood "Blasts %" is not mistaken for marrow aspirate blasts.
 if(!m){
   let dm=path.match(/\bDifferential\s*:?\s*([\s\S]{0,1200}?)(?=\n\s*(?:Special\s+Stains|IHC\/ISH|Immunohistochem|Comment|$))/i);
   if(dm)m=dm[1].match(/(?:^|[\r\n])\s*Blast\s*%\s*(?:[:\t ]|\r?\n)*([0-9.]+)/i);
 }
 // Common exported table layout: "Differential:" followed by "Blast % <tab> 3.5".
 if(!m)m=path.match(/\bDifferential\s*:?\s*[\s\S]{0,300}?\bBlast\s*%\s*(?:[:\t ]|\r?\n)+([0-9.]+)/i);
 if(m)out.aspirate=Number(m[1]);

 // Flow blast percentage: accept "blasts", "myeloid blasts", or "myeloblasts".
 let flowPatterns=[
   /(?:myeloblasts?|myeloid\s+blasts?|blasts?)[^0-9]{0,40}([0-9.]+)\s*%/i,
   /(?:increased\s+)?aberrant\s+(?:myeloid\s+)?(?:blasts?|myeloblasts?)[^0-9]{0,40}([0-9.]+)\s*%/i
 ];
 let fm=null;
 for(let re of flowPatterns){fm=String(flow||'').match(re);if(fm)break}
 if(!fm)fm=path.match(/flow\s+cytometry[^.\n]{0,140}?(?:myeloblasts?|myeloid\s+blasts?|blasts?)[^0-9]{0,40}([0-9.]+)\s*%/i);
 if(fm)out.flow=Number(fm[1]);

 if(out.flow==null && /flow\s+cytometry[^.\n]{0,160}?(?:myeloblasts?|myeloid\s+blasts?|blasts?)/i.test(path)){
   out.flowPossibleUnparsed=true;
 }

 // Core/IHC blast estimate, including ranges.
 let range=path.match(/(?:CD34|CD117|IHC|immunohistochem|blasts?)[^.\n]{0,80}?([0-9.]+)\s*(?:-|–|to)\s*([0-9.]+)\s*%/i);
 if(range){out.ihcLow=Number(range[1]);out.ihcHigh=Number(range[2])}
 else{
   let im=path.match(/(?:CD34|CD117|IHC|immunohistochem)[^.\n]{0,80}?([0-9.]+)\s*%/i);
   if(im){out.ihcLow=out.ihcHigh=Number(im[1])}
 }
 return out
}

function blastPhenotypeText(s){
 let raw=String(s||'').replace(/\r/g,'');
 if(!raw.trim())return'';
 let paras=raw.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
 let scored=paras.map(p=>{
   let score=0;
   if(/these\s+(?:cells\s+)?exhibit\s+the\s+following\s+immunophenotype/i.test(p))score+=10;
   if(/\b(?:blast|blasts|leukemic|abnormal\s+(?:myeloid|blast)|immature\s+myeloid)\b/i.test(p))score+=6;
   if(/\bCD34\s+positive\s+cells\b/i.test(p))score+=7;
   if(/\bpositive\s+for\b/i.test(p)&&/\bnegative\s+for\b/i.test(p))score+=4;
   if(/\bimmunophenotype\b/i.test(p))score+=2;
   if(/antibod(?:y|ies)|this\s+analysis\s+includes|gating/i.test(p))score-=8;
   if(/\bB\s+cells\b|\bT\s+cells\b|\bNK\b/i.test(p)&&!/\bblast/i.test(p))score-=4;
   return{p,score}
 }).sort((a,b)=>b.score-a.score);
 return scored[0]?.score>=5?scored[0].p:''
}

function parseMarkerList(text,result){
 let out=[];
 // Split the phenotype list into marker-sized phrases first. This prevents
 // modifiers such as "dim", "heterogeneous", or "equivocal" from bleeding
 // into adjacent markers.
 let chunks=String(text||'')
   .replace(/\r?\n/g,' ')
   .split(/\s*[,;]\s*|\s+\band\b\s+(?=(?:(?:equivocal|bright|moderate|dim|partial|variable|heterogeneous|heterogenous|aberrant)\s+)*(?:(?:cy)?CD\d{1,3}|HLA-DR|MPO|TdT)\b)/i)
   .map(x=>x.trim()).filter(Boolean);
 chunks.forEach(chunk=>{
   let mm=chunk.match(/\b((?:cy)?CD\d{1,3}|HLA-DR|MPO|TdT)\b/i);
   if(!mm)return;
   let marker=mm[1].toUpperCase();
   let local=chunk;
   let mods=[];
   let modifierMatches=local.match(/\b(bright|moderate|dim|partial|variable|heterogeneous|heterogenous|aberrant|limited subset)\b/gi)||[];
   modifierMatches.forEach(x=>{
     x=x.toLowerCase().replace('heterogenous','heterogeneous');
     if(!mods.includes(x))mods.push(x)
   });
   let r=/\bequivocal\b/i.test(local)?'Equivocal':result;
   out.push({marker,result:r,modifier:mods.join('/'),conflict:false})
 });
 return out
}

function flowparse(s){
 let p=blastPhenotypeText(s);
 if(!p)return[];
 let out=[];
 // Explicit anchor marker such as "CD34 positive cells..."
 let anchor=p.match(/\b((?:cy)?CD\d{1,3}|HLA-DR|MPO|TdT)\s+positive\s+cells\b/i);
 if(anchor)out.push({marker:anchor[1].toUpperCase(),result:'Positive',modifier:'',conflict:false});
 // Main positive and negative phenotype lists.
 let pos=p.match(/\bpositive\s+for\s+(.+?)(?=\band\s+negative\s+for\b|\bnegative\s+for\b|[.]\s*$)/is);
 let neg=p.match(/\bnegative\s+for\s+(.+?)(?=[.]|$)/is);
 if(pos)out.push(...parseMarkerList(pos[1],'Positive'));
 if(neg)out.push(...parseMarkerList(neg[1].replace(/\bremaining\s+markers\b.*$/i,''),'Negative'));
 // Some reports use "expressing ..." rather than "positive for".
 if(!pos){
   let exp=p.match(/\b(?:express(?:es|ing)|phenotype[:\s]+)(.+?)(?=\bnegative\s+for\b|[.]\s*$)/is);
   if(exp)out.push(...parseMarkerList(exp[1],'Positive'))
 }
 // Consolidate identical marker/result observations and merge modifiers.
 let keyMap={};
 out.forEach(x=>{
   let k=x.marker+'|'+x.result;
   if(!keyMap[k])keyMap[k]={...x};
   else{
     let mods=[...(keyMap[k].modifier||'').split('/'),...(x.modifier||'').split('/')].filter(Boolean);
     keyMap[k].modifier=[...new Set(mods)].join('/')
   }
 });
 return Object.values(keyMap)
}

function normalizeAMLAbnormality(raw){
 let s=String(raw||'').trim(),x=s.toLowerCase();
 if(/(?:^|[,\s])-5(?:$|[,\s])|monosomy\s*5/i.test(x))return{canonical:'-5',concept:'chr5/5q loss',concept_label:'chr5/5q loss'};
 if(/del(?:etion)?\s+(?:of\s+)?5q|del(?:etion)?\s*\(?5\)?(?:\([^)]*q|q)|5q\s+delet|loss\s+of\s+5q/i.test(x))return{canonical:'del(5q)',concept:'chr5/5q loss',concept_label:'chr5/5q loss'};
 if(/(?:^|[,\s])-7(?:$|[,\s])|monosomy\s*7/i.test(x))return{canonical:'-7',concept:'chr7/7q loss',concept_label:'chr7/7q loss'};
 if(/del(?:etion)?\s+(?:of\s+)?7q|del(?:etion)?\s*\(?7\)?(?:\([^)]*q|q)|7q\s+delet|loss\s+of\s+7q/i.test(x))return{canonical:'del(7q)',concept:'chr7/7q loss',concept_label:'chr7/7q loss'};
 if(/(?:^|[,\s])\+8(?:$|[,\s])|trisomy\s*8/i.test(x))return{canonical:'+8',concept:'trisomy 8',concept_label:'trisomy 8'};
 if(/del(?:etion)?\s+(?:of\s+)?20q|del(?:etion)?.*20q|20q(?:12)?\s+delet/i.test(x))return{canonical:'del(20q)',concept:'20q loss',concept_label:'del(20q)'};
 if(/t\s*\(\s*8\s*;\s*21\s*\)|runx1\s*::?\s*runx1t1/i.test(x))return{canonical:'t(8;21)/RUNX1::RUNX1T1',concept:'RUNX1::RUNX1T1',concept_label:'RUNX1::RUNX1T1'};
 if(/inv\s*\(\s*16\s*\)|t\s*\(\s*16\s*;\s*16\s*\)|inv16|cbfb\s*::?\s*myh11/i.test(x))return{canonical:'inv(16)/t(16;16)/CBFB::MYH11',concept:'CBFB::MYH11',concept_label:'CBFB::MYH11'};
 if(/t\s*\(\s*15\s*;\s*17\s*\)|pml\s*::?\s*rara/i.test(x))return{canonical:'t(15;17)/PML::RARA',concept:'PML::RARA',concept_label:'PML::RARA'};
 if(/11q23|kmt2a.*rearrange|rearrangement.*kmt2a/i.test(x))return{canonical:'KMT2A rearrangement',concept:'KMT2A rearrangement',concept_label:'KMT2A rearrangement'};
 if(/3q26|mecom.*rearrange|rearrangement.*mecom/i.test(x))return{canonical:'MECOM rearrangement',concept:'MECOM rearrangement',concept_label:'MECOM rearrangement'};
 if(/three\s+copies\s+of\s+runx1|runx1.*(?:copy|copies|gain)/i.test(x))return{canonical:'RUNX1 copy gain',concept:'RUNX1 copy gain',concept_label:'RUNX1 copy gain'};
 if(/del(?:etion)?.*17p|17p\s+delet/i.test(x))return{canonical:'del(17p)',concept:'17p loss',concept_label:'17p loss'};
 return{canonical:s,concept:'unmapped:'+s.toLowerCase(),concept_label:s}
}

function withAMLNormalization(o,field){
 let n=normalizeAMLAbnormality(o?.[field]||'');
 return{...o,canonical:n.canonical,concept:n.concept,concept_label:n.concept_label}
}

function fishparse(s){
 let raw=String(s||'').replace(/\r/g,''),out=[],seen=new Set();
 if(!raw.trim())return out;

 function normTarget(t){
   return String(t||'').trim().replace(/\s+/g,' ')
     .replace(/\s*\(SEE BELOW\)\s*$/i,'')
 }
 function canonical(t){
   let x=normTarget(t).toLowerCase()
     .replace(/deletion/g,'del').replace(/\s+/g,'')
     .replace(/[().:_-]/g,'');
   if(/(?:del)?5q/.test(x))return'del5q';
   if(/(?:del)?20q(?:12)?/.test(x))return'del20q';
   if(/threecopiesofrunx1|runx1.*threecopies/.test(x))return'runx1copygain';
   return x
 }
 function add(target,result,desc){
   target=normTarget(target);if(!target)return;
   let key=canonical(target)+'|'+result;
   if(seen.has(key))return;
   seen.add(key);out.push(withAMLNormalization({target,result,raw_description:String(desc||'').trim()},'target'))
 }

 // One explicit assay result per line. This is intentionally conservative.
 raw.split(/\n+/).map(x=>x.trim()).filter(Boolean).forEach(line=>{
   let lm=line.match(/^(.*?)\s*[–—-]\s*(Not\s+Detected|Detected|Positive|Negative)\b(.*)$/i);
   if(!lm)return;
   let target=lm[1].trim(),result=/not\s+detected|negative/i.test(lm[2])?'Negative':'Positive';
   // Require a recognizable FISH-style target so prose with hyphens is ignored.
   if(!/(del(?:etion)?|monosomy|trisomy|rearrangement|copies|t\(|inv|runx1|cbfb|rara|kmt2a|mecom|3q26|11q23)/i.test(target))return;
   add(target,result,line)
 });

 // Summary positives are useful when no explicit positive line gives that finding.
 let posLine=raw.split(/\n+/).find(x=>/^\s*POSITIVE\s+for\b/i.test(x));
 if(posLine){
   if(/deletion\s+of\s+5q/i.test(posLine)&&!out.some(x=>x.result==='Positive'&&canonical(x.target)==='del5q'))
     add('Deletion of 5q','Positive',posLine);
   if(/(?:deletion\s+of\s+)?20q/i.test(posLine)&&!out.some(x=>x.result==='Positive'&&canonical(x.target)==='del20q'))
     add('Deletion of 20q','Positive',posLine);
   if(/three\s+copies\s+of\s+RUNX1/i.test(posLine)&&!out.some(x=>x.result==='Positive'&&canonical(x.target)==='runx1copygain'))
     add('Three copies of RUNX1','Positive',posLine);
 }
 return out
}

function structuredCytoHits(cytoObs,fishObs){
 let hits=[];
 (cytoObs||[]).forEach(x=>{if((x.result||'Present')==='Present'&&x.abnormality)hits.push(x.abnormality)});
 (fishObs||[]).forEach(x=>{if(x.result==='Positive'&&x.target)hits.push(x.target)});
 return [...new Set(hits)]
}

function splitTopLevel(s){
 let out=[],cur='',depth=0;
 for(let ch of s){if(ch==='(')depth++;if(ch===')')depth=Math.max(0,depth-1);if(ch===','&&depth===0){out.push(cur.trim());cur=''}else cur+=ch}
 if(cur.trim())out.push(cur.trim());return out
}

function cytogeneticObservations(raw){
 raw=String(raw||'').trim();if(!raw)return[];
 let out=[],seen=new Set();
 // Parse clone-level ISCN while respecting commas within parentheses.
 raw.split(/\n+/).forEach(line=>{
   let clean=line.trim();if(!clean)return;
   clean.split('/').forEach(clone=>{
     clone=clone.replace(/\[[^\]]*\]/g,'').trim();
     let parts=splitTopLevel(clone);
     parts.forEach((x,i)=>{
       x=x.trim();
       if(!x||i===0&&/^\d{2,3}$/.test(x)||/^(XX|XY|X|Y)$/i.test(x))return;
       if(!/^[-+]\d+$|^\+mar\d*$|^-?(?:del|add|inv|t|i|idic|der|dup|ins|dic|r)\(/i.test(x))return;
       let key=x.toLowerCase();if(!seen.has(key)){seen.add(key);out.push(withAMLNormalization({abnormality:x,result:'Present',source:'Conventional cytogenetics'},'abnormality'))}
     })
   })
 });
 return out
}


const pathology=`Peripheral Smear

WBC	1.92
Blasts %	2	%

Bone Marrow:

Aspirate and touch imprint:
-The aspirate smears are prominently hemodilute, aspicular.

Differential:

Blast %	3.5
Promyelocyte %	0.5

Special Stains:
IHC/ISH: CD34 overall estimated 20-25%.

Flow cytometry reports increased aberrant myeloblasts, 30%.`;

const flow=`CD34 positive cells are 65% of the CD45 gated cells, calculated 23% of total cells from that gate, and approximately 30% of the total gated cells. These exhibit the following immunophenotype, positive for CD34, CD117, dim CD38, CD33, dim CD13, heterogenous dim CD7, HLA-DR (limited subset), CD43, CD59, equivocal dim CD4, and negative for CD19, CD10, CD3, CD123, CD22, remaining markers.`;

const fish=`POSITIVE for deletion of 5q and 20q and three copies of RUNX1
Rearrangement of 3q26 – Not Detected
Del 5q – DETECTED
Monosomy 5 – Not Detected
Del 7q – Not Detected
Monosomy 7 – Not Detected
Trisomy 8 – Not Detected
t(8;21) – Not Detected (SEE BELOW)
Rearrangement of 11q23 – Not Detected
t(15;17) – Not Detected
Inv16q22 – Not Detected
Del 20q12 – DETECTED`;

const cyto=`45~47,XY,t(3;19)(p21;q13.3),del(5)(q13q33),-20,add(21)(p11.2),add(22)(q22),+mar1[cp12]/
45~48,idem,+3,-der(3)t(3;19)(p22;q13.3),+mar2[cp7]/46,XY[1]`;

let failures=[];
const ok=(c,m)=>{if(!c)failures.push(m)};
let b=extractBlastData(pathology,flow);
let p=extractPBBlastData(pathology);
let a=extractAspirateAdequacy(pathology);
let fp=flowparse(flow);
let fi=fishparse(fish);
let co=cytogeneticObservations(cyto);
let hits=structuredCytoHits(co,fi);
let m5=normalizeAMLAbnormality('Del 5q');
let m5b=normalizeAMLAbnormality('Deletion of 5q');
let k5=normalizeAMLAbnormality('del(5)(q13q33)');

ok(b.aspirate===3.5,'aspirate 3.5');
ok(b.flow===30,'flow 30');
ok(b.ihcLow===20&&b.ihcHigh===25,'IHC 20-25');
ok(p.status==='Present'&&p.pct===2,'PB blasts should be Present 2%');
ok(a==='Hemodilute + aspicular','aspirate adequacy');
ok(fp.find(x=>x.marker==='CD34')?.modifier==='','CD34 modifier');
ok(fp.find(x=>x.marker==='CD38')?.modifier==='dim','CD38 dim');
ok(fp.find(x=>x.marker==='CD4')?.result==='Equivocal','CD4 equivocal');
ok(fi.some(x=>x.target==='t(8;21)'&&x.result==='Negative'),'t821 negative retained');
ok(!hits.includes('t(8;21)'),'negative t821 not positive hit');
ok(co.some(x=>x.abnormality==='+mar1'),'+mar1 preserved');
ok(co.some(x=>x.abnormality==='+mar2'),'+mar2 preserved');
ok(co.some(x=>x.abnormality.startsWith('-der(3)')),'-der(3) preserved');
ok(m5.canonical===m5b.canonical&&m5.concept===m5b.concept,'FISH del5q wording normalization');
ok(k5.concept==='chr5/5q loss','karyotype del5q normalization');
ok(fi.filter(x=>x.result==='Positive'&&x.concept==='chr5/5q loss').length===1,'positive del5q no duplicate');
ok(fi.some(x=>x.result==='Positive'&&x.canonical==='RUNX1 copy gain'),'RUNX1 copy gain normalized');
console.log(JSON.stringify({failures,b,p,a,fish:fi,cyto:co},null,2));
if(failures.length)process.exit(2);
