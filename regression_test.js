function chronologySort(){
 D.cycles.sort((a,b)=>{
   if(a.start&&b.start){let c=a.start.localeCompare(b.start);if(c)return c}
   else if(a.start&&!b.start)return-1;
   else if(!a.start&&b.start)return 1;
   return String(a.id||'').localeCompare(String(b.id||''))
 });
 let n=0;D.cycles.forEach(c=>{c.n=c.start?++n:null});
 D.marrows.sort((a,b)=>String(a.date||'9999-99-99').localeCompare(String(b.date||'9999-99-99'))||String(a.id||'').localeCompare(String(b.id||'')))
}

function preferredBlast(m){
 if(m.preferredBlastManual!==null&&m.preferredBlastManual!==undefined&&m.preferredBlastManual!=='')return{value:Number(m.preferredBlastManual),source:'Manual adjudication',indeterminate:false};
 let limited=/Hemodilute|Aspicular|aparticulate/i.test(m.aspirateAdequacy||'');
 if(m.blastAspirate!=null&&!limited)return{value:Number(m.blastAspirate),source:'Aspirate/manual differential (adequate morphology)',indeterminate:false};
 if(m.blastIhcLow!=null&&m.blastIhcHigh!=null){
   if(Number(m.blastIhcLow)===Number(m.blastIhcHigh))return{value:Number(m.blastIhcLow),source:'Core/IHC',indeterminate:false};
   if(Number(m.blastIhcLow)<5&&Number(m.blastIhcHigh)>=5)return{value:null,source:`Core/IHC range ${m.blastIhcLow}–${m.blastIhcHigh}% crosses 5% threshold`,indeterminate:true};
   return{value:Number(m.blastIhcHigh),source:`Core/IHC range ${m.blastIhcLow}–${m.blastIhcHigh}% (upper bound used)`,indeterminate:false};
 }
 if(m.blastFlow!=null&&m.flowAdequate!==false)return{value:Number(m.blastFlow),source:'Flow cytometry crosscheck (morphology unavailable/limited)',indeterminate:false};
 if(m.blastAspirate!=null)return{value:Number(m.blastAspirate),source:`Aspirate/manual differential (${m.aspirateAdequacy||'limited'}; adjudication recommended)`,indeterminate:true};
 return{value:null,source:'No structured blast source',indeterminate:true}
}

function classifyResponse(m){
 if(m.diagnostic)return 'Baseline / not response-evaluable';
 let fc=firstCycle();if(!fc||m.date<fc.start)return 'Pretreatment / not response-evaluable';
 let pb=preferredBlast(m);if(pb.indeterminate||pb.value==null)return 'Needs blast adjudication';
 if(!m.pb||m.pb==='Unknown'||!m.emd||m.emd==='Unknown')return 'Pending response completion';
 let r=responseWindow(m),bm=pb.value,anc=r.fa?.anc,plt=r.fp?.plt;
 if(bm<5&&m.pb!=='Present'&&m.emd==='Absent/resolved'){if(anc==null||plt==null)return'Pending count recovery data';if(anc>=1&&plt>=100)return r.mode==='provisional'?'Provisional CR':'CR';if(anc>=0.5&&plt>=50)return r.mode==='provisional'?'Provisional CRh':'CRh';if(anc>=1||plt>=100)return r.mode==='provisional'?'Provisional CRi':'CRi';return r.mode==='provisional'?'Provisional MLFS':'MLFS'}
 if(bm>=5&&bm<=25){let d=D.marrows.find(x=>x.diagnostic),base=preferredBlast(d||{}).value;if(Number.isFinite(base)&&bm<=base*0.5){if(anc==null||plt==null)return'Pending count recovery data';if(anc>=1&&plt>=100)return r.mode==='provisional'?'Provisional PR':'PR'}}
 return 'No response'
}

function markerAutoStatus(m,key){
 if(!m)return{status:'Unknown',evidence:'No diagnostic BMBx'};
 let pos=(m.mutations||[]).filter(x=>x.result==='Positive'&&x.classification!=='VUS'),neg=(m.mutations||[]).filter(x=>x.result==='Negative');
 let raw=[m.raw?.ngspos,m.raw?.ngstest,...pos.map(x=>x.raw_description||'')].join('\n');
 if(key==='FLT3-ITD'){
   if(pos.some(x=>x.gene==='FLT3'&&/\bITD\b|internal tandem/i.test([x.protein,x.cdna,x.raw_description].join(' '))))return{status:'Positive',evidence:'FLT3-ITD detected'};
   if(/\bFLT3[-\s]?ITD\b[^.\n]{0,50}(?:not detected|negative|wild[- ]?type)/i.test(raw))return{status:'Negative',evidence:'FLT3-ITD explicitly negative'};
   return{status:'Unknown',evidence:'Generic FLT3 testing does not establish ITD result'}
 }
 if(key==='FLT3-TKD'){
   if(pos.some(x=>x.gene==='FLT3'&&/\bTKD\b|D835|I836|tyrosine kinase domain/i.test([x.protein,x.cdna,x.raw_description].join(' '))))return{status:'Positive',evidence:'FLT3-TKD detected'};
   if(/\bFLT3[-\s]?TKD\b[^.\n]{0,50}(?:not detected|negative|wild[- ]?type)/i.test(raw))return{status:'Negative',evidence:'FLT3-TKD explicitly negative'};
   return{status:'Unknown',evidence:'Generic FLT3 testing does not establish TKD result'}
 }
 if(key==='KMT2A'){
   if((m.fishObservations||[]).some(x=>x.result==='Positive'&&/KMT2A|11q23/i.test(x.target||''))||pos.some(x=>x.gene==='KMT2A'&&/rearrange|fusion|::/i.test(x.raw_description||'')))return{status:'Positive',evidence:'KMT2A rearrangement/fusion detected'};
   if(neg.some(x=>x.gene==='KMT2A')||(m.fishObservations||[]).some(x=>x.result==='Negative'&&/KMT2A|11q23/i.test(x.target||'')))return{status:'Negative',evidence:'KMT2A explicitly tested negative'};
   if(pos.some(x=>x.gene==='KMT2A'))return{status:'Unknown',evidence:'KMT2A sequence variant present but rearrangement status not established'};
   return{status:'Unknown',evidence:'Not explicitly tested'}
 }
 if(pos.some(x=>x.gene===key))return{status:'Positive',evidence:`${key} detected`};
 if(neg.some(x=>x.gene===key))return{status:'Negative',evidence:`${key} explicitly assayed and not detected`};
 return{status:'Unknown',evidence:'Not explicitly tested'}
}

function markerStatus(m,key){
 let o=D.base.marker_overrides?.[key];if(o&&o!=='Automatic')return{status:o,evidence:'Manual structured override'};return markerAutoStatus(m,key)
}

function eln2022AdverseCytogenetics(m){
 if(!m)return[];let hits=[],d=deriveCytogenetics(m),s=[...(m.cytoObservations||[]).map(x=>x.abnormality||''),...(m.fishObservations||[]).filter(x=>x.result==='Positive').map(x=>x.target||''),m.raw?.cyto||'',m.raw?.fish||''].join(' ');
 if(d.category.includes('Complex'))hits.push('complex karyotype');if(d.category.includes('Monosomal'))hits.push('monosomal karyotype');
 [[/(\-5\b|del\s*\(?5|5q.*del)/i,'-5/del(5q)'],[/(\-7\b|monosomy\s*7)/i,'-7'],[/(\-17\b|17p.*(?:abn|del)|del\s*\(?17)/i,'-17/abn(17p)'],[/(inv\s*\(?3|t\s*\(?3\s*;\s*3|MECOM.*rearr|3q26.*MECOM)/i,'MECOM-rearranged'],[/(t\s*\(?6\s*;\s*9|DEK.*NUP214)/i,'DEK::NUP214'],[/(t\s*\(?9\s*;\s*22|BCR.*ABL1)/i,'BCR::ABL1']].forEach(([r,l])=>{if(r.test(s)&&!hits.includes(l))hits.push(l)});
 let k=markerStatus(m,'KMT2A');if(k.status==='Positive'&&!/t\s*\(?9\s*;\s*11|MLLT3/i.test(s))hits.push('KMT2A rearrangement');return hits
}

function favorableCBF(m){let s=[m.raw?.cyto||'',m.raw?.fish||'',...(m.cytoObservations||[]).map(x=>x.abnormality||''),...(m.fishObservations||[]).filter(x=>x.result==='Positive').map(x=>x.target||'')].join(' ');if(/t\s*\(?8\s*;\s*21|RUNX1.*RUNX1T1/i.test(s))return'RUNX1::RUNX1T1';if(/inv\s*\(?16|t\s*\(?16\s*;\s*16|CBFB.*MYH11/i.test(s))return'CBFB::MYH11';return''}
function eln(){
 let m=D.marrows.find(x=>x.diagnostic);if(!m)return['Pending','No diagnostic BMBx','Pending','No diagnostic BMBx'];
 let pos=g=>(m.mutations||[]).some(x=>x.gene===g&&x.result==='Positive'&&x.classification!=='VUS'),advGenes=['ASXL1','BCOR','EZH2','RUNX1','SF3B1','SRSF2','STAG2','U2AF1','ZRSR2'].filter(pos);
 let tp53=markerStatus(m,'TP53').status,itd=markerStatus(m,'FLT3-ITD').status,npm1=markerStatus(m,'NPM1').status,cy=eln2022AdverseCytogenetics(m),cbf=favorableCBF(m);
 let tp53Rows=(m.mutations||[]).filter(x=>x.gene==='TP53'&&x.result==='Positive'&&x.classification!=='VUS'),tp53Adv=tp53Rows.some(x=>x.vaf!=null&&Number(x.vaf)>=10),tp53VafUnknown=tp53Rows.some(x=>x.vaf==null);
 let cebpa=(m.mutations||[]).some(x=>x.gene==='CEBPA'&&x.result==='Positive'&&/bZIP|basic leucine zipper/i.test([x.protein,x.raw_description].join(' ')));
 let e22='Unable to determine',w22='Insufficient structured genetics';
 if(cbf){e22='Favorable';w22=cbf}
 else if(cebpa){e22='Favorable';w22='CEBPA bZIP in-frame mutation detected'}
 else if(tp53Adv||cy.length){e22='Adverse';w22=[tp53Adv?'TP53 mutation VAF ≥10%':'',...cy].filter(Boolean).join(' · ')}
 else if(tp53==='Positive'&&tp53VafUnknown){e22='Unable to determine';w22='TP53 mutation detected but VAF unavailable for ELN 2022 ≥10% criterion'}
 else if(npm1==='Positive'){if(itd==='Positive'){e22='Intermediate';w22='NPM1-mutated with FLT3-ITD'}else if(itd==='Negative'){e22='Favorable';w22='NPM1-mutated without FLT3-ITD'}else w22='NPM1 detected; FLT3-ITD status unknown'}
 else if(advGenes.length){e22='Adverse';w22='MR-gene mutation(s): '+advGenes.join(', ')}
 else if(itd==='Positive'){e22='Intermediate';w22='FLT3-ITD detected'}
 else {let s=[m.raw?.cyto,m.raw?.fish].join(' ');if(/t\s*\(?9\s*;\s*11|KMT2A.*MLLT3|MLLT3.*KMT2A/i.test(s)){e22='Intermediate';w22='t(9;11)/KMT2A::MLLT3'}else if(deriveCytogenetics(m).category!=='Unknown'&&(m.mutations||[]).length){e22='Intermediate';w22='No favorable/adverse defining abnormality identified'}}
 let e24='Unable to determine',w24='Insufficient structured genetics';
 if(D.base.phma==='Yes'){e24='Not applicable';w24='2024 ELN Less-Intensive does not apply after prior HMA exposure'}
 else{let nr=markerStatus(m,'NRAS').status,kr=markerStatus(m,'KRAS').status;if(tp53==='Positive'){e24='Adverse';w24='TP53 mutation'}else if(pos('DDX41')){e24='Favorable';w24='DDX41 mutation'}else if(tp53==='Negative'&&[itd,nr,kr].some(x=>x==='Positive')){e24='Intermediate';w24='FLT3-ITD and/or NRAS/KRAS mutation with TP53 wild-type'}else if(tp53==='Negative'&&[itd,nr,kr].every(x=>x==='Negative')){e24='Favorable';w24='TP53 wild-type with FLT3-ITD, NRAS and KRAS negative'}else{let miss=[['TP53',tp53],['FLT3-ITD',itd],['NRAS',nr],['KRAS',kr]].filter(x=>x[1]==='Unknown').map(x=>x[0]);w24='Required status unknown: '+miss.join(', ')}}
 return[e22,w22,e24,w24]
}

function eln(){
 let m=D.marrows.find(x=>x.diagnostic);if(!m)return['Pending','No diagnostic BMBx','Pending','No diagnostic BMBx'];
 let pos=g=>(m.mutations||[]).some(x=>x.gene===g&&x.result==='Positive'&&x.classification!=='VUS'),advGenes=['ASXL1','BCOR','EZH2','RUNX1','SF3B1','SRSF2','STAG2','U2AF1','ZRSR2'].filter(pos);
 let tp53=markerStatus(m,'TP53').status,itd=markerStatus(m,'FLT3-ITD').status,npm1=markerStatus(m,'NPM1').status,cy=eln2022AdverseCytogenetics(m),cbf=favorableCBF(m);
 let tp53Rows=(m.mutations||[]).filter(x=>x.gene==='TP53'&&x.result==='Positive'&&x.classification!=='VUS'),tp53Adv=tp53Rows.some(x=>x.vaf!=null&&Number(x.vaf)>=10),tp53VafUnknown=tp53Rows.some(x=>x.vaf==null);
 let cebpa=(m.mutations||[]).some(x=>x.gene==='CEBPA'&&x.result==='Positive'&&/bZIP|basic leucine zipper/i.test([x.protein,x.raw_description].join(' ')));
 let e22='Unable to determine',w22='Insufficient structured genetics';
 if(cbf){e22='Favorable';w22=cbf}
 else if(cebpa){e22='Favorable';w22='CEBPA bZIP in-frame mutation detected'}
 else if(tp53Adv||cy.length){e22='Adverse';w22=[tp53Adv?'TP53 mutation VAF ≥10%':'',...cy].filter(Boolean).join(' · ')}
 else if(tp53==='Positive'&&tp53VafUnknown){e22='Unable to determine';w22='TP53 mutation detected but VAF unavailable for ELN 2022 ≥10% criterion'}
 else if(npm1==='Positive'){if(itd==='Positive'){e22='Intermediate';w22='NPM1-mutated with FLT3-ITD'}else if(itd==='Negative'){e22='Favorable';w22='NPM1-mutated without FLT3-ITD'}else w22='NPM1 detected; FLT3-ITD status unknown'}
 else if(advGenes.length){e22='Adverse';w22='MR-gene mutation(s): '+advGenes.join(', ')}
 else if(itd==='Positive'){e22='Intermediate';w22='FLT3-ITD detected'}
 else {let s=[m.raw?.cyto,m.raw?.fish].join(' ');if(/t\s*\(?9\s*;\s*11|KMT2A.*MLLT3|MLLT3.*KMT2A/i.test(s)){e22='Intermediate';w22='t(9;11)/KMT2A::MLLT3'}else if(deriveCytogenetics(m).category!=='Unknown'&&(m.mutations||[]).length){e22='Intermediate';w22='No favorable/adverse defining abnormality identified'}}
 let e24='Unable to determine',w24='Insufficient structured genetics';
 if(D.base.phma==='Yes'){e24='Not applicable';w24='2024 ELN Less-Intensive does not apply after prior HMA exposure'}
 else{let nr=markerStatus(m,'NRAS').status,kr=markerStatus(m,'KRAS').status;if(tp53==='Positive'){e24='Adverse';w24='TP53 mutation'}else if(pos('DDX41')){e24='Favorable';w24='DDX41 mutation'}else if(tp53==='Negative'&&[itd,nr,kr].some(x=>x==='Positive')){e24='Intermediate';w24='FLT3-ITD and/or NRAS/KRAS mutation with TP53 wild-type'}else if(tp53==='Negative'&&[itd,nr,kr].every(x=>x==='Negative')){e24='Favorable';w24='TP53 wild-type with FLT3-ITD, NRAS and KRAS negative'}else{let miss=[['TP53',tp53],['FLT3-ITD',itd],['NRAS',nr],['KRAS',kr]].filter(x=>x[1]==='Unknown').map(x=>x[0]);w24='Required status unknown: '+miss.join(', ')}}
 return[e22,w22,e24,w24]
}


let failures=[];
const ok=(x,msg)=>{if(!x)failures.push(msg)};

// ---------- chronology ----------
let D={cycles:[
 {id:'late',start:'2024-03-01',n:1},
 {id:'early',start:'2024-01-01',n:2},
 {id:'mid',start:'2024-02-01',n:3},
 {id:'unscheduled',start:'',n:4}
],marrows:[
 {id:'b',date:'2024-03-10'},
 {id:'a',date:'2024-01-10'},
 {id:'c',date:'2024-02-10'}
],base:{marker_overrides:{}},cbc:[],out:{}};
chronologySort();
ok(D.cycles.map(x=>x.id).join(',')==='early,mid,late,unscheduled','cycles sort chronologically');
ok(D.cycles.slice(0,3).map(x=>x.n).join(',')==='1,2,3','cycle numbers derive from chronology');
ok(D.cycles[3].n===null,'unscheduled cycle is not assigned chronological number');
ok(D.marrows.map(x=>x.id).join(',')==='a,c,b','BMBx sort chronologically');

// ---------- blast hierarchy ----------
let adequate={preferredBlastManual:null,blastAspirate:6,aspirateAdequacy:'Adequate',blastFlow:3,flowAdequate:true,blastIhcLow:4,blastIhcHigh:4};
let limited={preferredBlastManual:null,blastAspirate:2,aspirateAdequacy:'Hemodilute + aspicular',blastFlow:7,flowAdequate:true,blastIhcLow:8,blastIhcHigh:8};
ok(preferredBlast(adequate).value===6 && preferredBlast(adequate).source.startsWith('Aspirate'),'adequate aspirate outranks flow');
ok(preferredBlast(limited).value===8 && preferredBlast(limited).source==='Core/IHC','limited aspirate falls back to core/IHC');

// ---------- response PR missing counts ----------
function firstCycle(){return{start:'2024-02-01'}}
function responseWindow(m){return{fa:null,fp:null,mode:'final'}}
D.marrows=[
 {id:'dx',diagnostic:true,date:'2024-01-01',preferredBlastManual:null,blastAspirate:30,aspirateAdequacy:'Adequate'},
 {id:'r',diagnostic:false,date:'2024-03-01',preferredBlastManual:null,blastAspirate:10,aspirateAdequacy:'Adequate',pb:'Absent',emd:'Absent/resolved'}
];
ok(classifyResponse(D.marrows[1])==='Pending count recovery data','PR-eligible marrow with missing counts remains pending');

// ---------- ELN ----------
function splitTopLevel(s){let out=[],buf='',depth=0;for(let ch of String(s||'')){if(ch==='(')depth++;if(ch===')')depth=Math.max(0,depth-1);if(ch===','&&depth===0){out.push(buf);buf=''}else buf+=ch}if(buf)out.push(buf);return out}
function deriveCytogenetics(m){if(!m)return{category:'Pending',evidence:''};if(m.cytoCategoryOverride)return{category:m.cytoCategoryOverride,evidence:'override'};return{category:'Unknown',evidence:''}}
D.base={marker_overrides:{},phma:'No'};
let npm1itd={diagnostic:true,mutations:[
 {gene:'NPM1',result:'Positive',classification:'Reported',raw_description:'NPM1 mutation'},
 {gene:'FLT3',result:'Positive',classification:'Reported',raw_description:'FLT3-ITD detected'}
],fishObservations:[],cytoObservations:[],raw:{ngspos:'FLT3-ITD detected',ngstest:'',cyto:'',fish:''}};
D.marrows=[npm1itd];
ok(eln()[0]==='Intermediate','ELN 2022 NPM1 + FLT3-ITD = Intermediate');

let npm1neg=JSON.parse(JSON.stringify(npm1itd));
npm1neg.mutations=npm1neg.mutations.filter(x=>x.gene!=='FLT3');
npm1neg.raw.ngspos='NPM1 mutation';npm1neg.raw.ngstest='FLT3-ITD not detected';
D.marrows=[npm1neg];
ok(eln()[0]==='Favorable','ELN 2022 NPM1 + explicit FLT3-ITD negative = Favorable');

let complex=JSON.parse(JSON.stringify(npm1neg));complex.cytoCategoryOverride='Complex karyotype';
D.marrows=[complex];
ok(eln()[0]==='Adverse','ELN 2022 adverse cytogenetics override NPM1 favorable');

let tp53={diagnostic:true,mutations:[
 {gene:'TP53',result:'Positive',classification:'Reported',vaf:35,raw_description:'TP53 pathogenic 35%'},
 {gene:'NRAS',result:'Negative',classification:'Not detected'},
 {gene:'KRAS',result:'Negative',classification:'Not detected'}
],fishObservations:[],cytoObservations:[],raw:{ngspos:'TP53 pathogenic 35%',ngstest:'FLT3-ITD not detected',cyto:'',fish:''}};
D.marrows=[tp53];
ok(eln()[0]==='Adverse','ELN 2022 TP53 VAF >=10 = Adverse');
ok(eln()[2]==='Adverse','ELN 2024 LI TP53 = Adverse');

D.base.phma='Yes';
ok(eln()[2]==='Not applicable','ELN 2024 LI is not applicable after prior HMA');

console.log(JSON.stringify({failures},null,2));
if(failures.length)process.exit(2);
