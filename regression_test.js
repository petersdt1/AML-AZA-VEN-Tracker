function preferredBlast(m){
 if(m.preferredBlastManual!==null&&m.preferredBlastManual!==undefined&&m.preferredBlastManual!=='')return{value:Number(m.preferredBlastManual),source:'Manual adjudication',indeterminate:false};
 let limited=/Hemodilute|Aspicular|aparticulate/i.test(m.aspirateAdequacy||'');
 if(m.blastAspirate!=null&&!limited)return{value:Number(m.blastAspirate),source:'Aspirate/manual differential (adequate morphology)',indeterminate:false};
 if(m.blastFlow!=null&&m.flowAdequate!==false)return{value:Number(m.blastFlow),source:'Flow cytometry (adequate; aspirate limited/unavailable)',indeterminate:false};
 if(m.blastIhcLow!=null&&m.blastIhcHigh!=null){
   if(Number(m.blastIhcLow)===Number(m.blastIhcHigh))return{value:Number(m.blastIhcLow),source:'Core/IHC',indeterminate:false};
   if(Number(m.blastIhcLow)<5&&Number(m.blastIhcHigh)>=5)return{value:null,source:`Core/IHC range ${m.blastIhcLow}–${m.blastIhcHigh}% crosses 5% threshold`,indeterminate:true};
   return{value:Number(m.blastIhcHigh),source:`Core/IHC range ${m.blastIhcLow}–${m.blastIhcHigh}% (upper bound used)`,indeterminate:false};
 }
 if(m.blastAspirate!=null)return{value:Number(m.blastAspirate),source:`Aspirate/manual differential (${m.aspirateAdequacy||'limited'}; adjudication recommended)`,indeterminate:true};
 return{value:null,source:'No structured blast source',indeterminate:true}
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

function structuredPositiveGeneticStrings(m){
 let out=[];
 (m?.cytoObservations||[]).filter(x=>(x.result||'Present')==='Present').forEach(x=>out.push(String(x.abnormality||'')));
 (m?.fishObservations||[]).filter(x=>x.result==='Positive').forEach(x=>out.push(String(x.target||'')));
 (m?.mutations||[]).filter(x=>x.result==='Positive'&&x.classification!=='VUS').forEach(x=>{
   let s=[x.gene,x.protein,x.cdna,x.raw_description].filter(Boolean).join(' ');
   if(/::|fusion|rearrang/i.test(s))out.push(s)
 });
 return out
}

function structuredPositiveGeneticText(m){return structuredPositiveGeneticStrings(m).join(' | ')}
function positiveFusionConcepts(m){
 let s=structuredPositiveGeneticText(m),hits=[],add=x=>{if(!hits.includes(x))hits.push(x)};
 if(/t\s*\(\s*8\s*;\s*21\s*\)|RUNX1\s*::\s*RUNX1T1/i.test(s))add('RUNX1::RUNX1T1');
 if(/inv\s*\(\s*16\s*\)|t\s*\(\s*16\s*;\s*16\s*\)|CBFB\s*::\s*MYH11/i.test(s))add('CBFB::MYH11');
 if(/t\s*\(\s*9\s*;\s*11\s*\)|MLLT3\s*::\s*KMT2A|KMT2A\s*::\s*MLLT3/i.test(s))add('MLLT3::KMT2A');
 if(/t\s*\(\s*6\s*;\s*9\s*\)|DEK\s*::\s*NUP214/i.test(s))add('DEK::NUP214');
 if(/t\s*\(\s*9\s*;\s*22\s*\)|BCR\s*::\s*ABL1/i.test(s))add('BCR::ABL1');
 if(/t\s*\(\s*8\s*;\s*16\s*\)|KAT6A\s*::\s*CREBBP/i.test(s))add('KAT6A::CREBBP');
 if(/inv\s*\(\s*3\s*\)|t\s*\(\s*3\s*;\s*3\s*\)|3q26|MECOM.*(?:rearrang|fusion)|(?:rearrang|fusion).*MECOM/i.test(s))add('MECOM rearrangement');
 if(/11q23|KMT2A.*(?:rearrang|fusion)|(?:rearrang|fusion).*KMT2A/i.test(s)){
   if(!hits.includes('MLLT3::KMT2A'))add('KMT2A rearrangement')
 }
 return hits
}

function positiveFusionConcepts(m){
 let s=structuredPositiveGeneticText(m),hits=[],add=x=>{if(!hits.includes(x))hits.push(x)};
 if(/t\s*\(\s*8\s*;\s*21\s*\)|RUNX1\s*::\s*RUNX1T1/i.test(s))add('RUNX1::RUNX1T1');
 if(/inv\s*\(\s*16\s*\)|t\s*\(\s*16\s*;\s*16\s*\)|CBFB\s*::\s*MYH11/i.test(s))add('CBFB::MYH11');
 if(/t\s*\(\s*9\s*;\s*11\s*\)|MLLT3\s*::\s*KMT2A|KMT2A\s*::\s*MLLT3/i.test(s))add('MLLT3::KMT2A');
 if(/t\s*\(\s*6\s*;\s*9\s*\)|DEK\s*::\s*NUP214/i.test(s))add('DEK::NUP214');
 if(/t\s*\(\s*9\s*;\s*22\s*\)|BCR\s*::\s*ABL1/i.test(s))add('BCR::ABL1');
 if(/t\s*\(\s*8\s*;\s*16\s*\)|KAT6A\s*::\s*CREBBP/i.test(s))add('KAT6A::CREBBP');
 if(/inv\s*\(\s*3\s*\)|t\s*\(\s*3\s*;\s*3\s*\)|3q26|MECOM.*(?:rearrang|fusion)|(?:rearrang|fusion).*MECOM/i.test(s))add('MECOM rearrangement');
 if(/11q23|KMT2A.*(?:rearrang|fusion)|(?:rearrang|fusion).*KMT2A/i.test(s)){
   if(!hits.includes('MLLT3::KMT2A'))add('KMT2A rearrangement')
 }
 return hits
}

function structuredCytoRiskFeatures(m){
 let obs=(m?.cytoObservations||[]).filter(x=>(x.result||'Present')==='Present').map(x=>String(x.abnormality||'')),
     fish=(m?.fishObservations||[]).filter(x=>x.result==='Positive').map(x=>String(x.target||'')),
     s=[...obs,...fish].join(' | '),fusions=positiveFusionConcepts(m);
 let structural=obs.filter(x=>/^-?(?:del|add|inv|t|i|idic|der|dup|ins|dic|r)\(/i.test(x)),
     numeric=obs.filter(x=>/^[-+]\d+$/.test(x)),
     monos=numeric.filter(x=>/^-(?:[1-9]|1\d|2[0-2])$/.test(x));
 let recurring=fusions.length>0,onlyHyperdiploid=structural.length===0&&numeric.length>=3&&numeric.every(x=>x.startsWith('+')),
     complex=!recurring&&obs.length>=3&&structural.length>=1&&!onlyHyperdiploid,
     cbf=fusions.includes('RUNX1::RUNX1T1')||fusions.includes('CBFB::MYH11'),
     monosomal=!cbf&&(monos.length>=2||(monos.length>=1&&structural.length>=1));
 let adverse=[],add=x=>{if(!adverse.includes(x))adverse.push(x)};
 if(/(?:^|\|)\s*-5(?:\s|\||$)|del\s*\(?5|5q.*del/i.test(s))add('-5/del(5q)');
 if(/(?:^|\|)\s*-7(?:\s|\||$)|monosomy\s*7/i.test(s))add('-7');
 if(/(?:^|\|)\s*-17(?:\s|\||$)|17p.*(?:abn|del)|del\s*\(?17/i.test(s))add('-17/abn(17p)');
 if(complex)add('complex karyotype');
 if(monosomal)add('monosomal karyotype');
 ['DEK::NUP214','BCR::ABL1','KAT6A::CREBBP','MECOM rearrangement','KMT2A rearrangement'].forEach(x=>{if(fusions.includes(x))add(x)});
 return{adverse,complex,monosomal,fusions,obs}
}

function favorableCBF(m){
 let f=positiveFusionConcepts(m);
 if(f.includes('RUNX1::RUNX1T1'))return'RUNX1::RUNX1T1';
 if(f.includes('CBFB::MYH11'))return'CBFB::MYH11';
 return''
}

function eln2022Risk(m){
 if(!m)return{category:'Pending',trace:['No diagnostic BMBx']};
 let trace=[],cy=structuredCytoRiskFeatures(m),cbf=favorableCBF(m),fusions=cy.fusions;
 let pos=g=>(m.mutations||[]).some(x=>x.gene===g&&x.result==='Positive'&&x.classification!=='VUS');
 let advGenes=['ASXL1','BCOR','EZH2','RUNX1','SF3B1','SRSF2','STAG2','U2AF1','ZRSR2'].filter(pos);
 let npm1=markerStatus(m,'NPM1').status,itd=markerStatus(m,'FLT3-ITD').status;
 let tp53Rows=(m.mutations||[]).filter(x=>x.gene==='TP53'&&x.result==='Positive'&&x.classification!=='VUS'),
     tp53Adv=tp53Rows.some(x=>x.vaf!=null&&Number(x.vaf)>=10),
     tp53UnknownVaf=tp53Rows.some(x=>x.vaf==null);
 let cebpa=(m.mutations||[]).some(x=>x.gene==='CEBPA'&&x.result==='Positive'&&x.classification!=='VUS'&&/bZIP|basic leucine zipper/i.test([x.protein,x.raw_description].join(' ')));

 if(tp53Adv){trace.push('TP53 pathogenic mutation with VAF ≥10%');trace.push('ELN 2022 adverse criterion applied');return{category:'Adverse',trace}}
 if(tp53UnknownVaf){trace.push('TP53 pathogenic mutation detected but VAF unavailable');trace.push('Cannot apply ELN 2022 TP53 ≥10% criterion');return{category:'Unable to determine',trace}}

 if(npm1==='Positive'&&cy.adverse.length){
   trace.push('NPM1 mutation detected');
   trace.push('Adverse-risk cytogenetic feature(s): '+cy.adverse.join(', '));
   trace.push('NPM1 + adverse cytogenetics => Adverse');
   return{category:'Adverse',trace}
 }

 if(cbf){
   trace.push('Favorable defining lesion: '+cbf);
   if(advGenes.length)trace.push('MR-gene mutation(s) do not override favorable-risk AML subtype: '+advGenes.join(', '));
   return{category:'Favorable',trace}
 }

 if(cebpa){
   trace.push('Favorable defining lesion: bZIP in-frame mutated CEBPA');
   if(advGenes.length)trace.push('MR-gene mutation(s) do not override favorable-risk AML subtype: '+advGenes.join(', '));
   if(cy.adverse.length){
     trace.push('Competing adverse cytogenetic feature(s): '+cy.adverse.join(', '));
     trace.push('Rare competing defining features require review');
     return{category:'Needs review',trace}
   }
   return{category:'Favorable',trace}
 }

 if(npm1==='Positive'){
   trace.push('NPM1 mutation detected');
   if(itd==='Positive'){trace.push('FLT3-ITD detected');return{category:'Intermediate',trace}}
   if(itd==='Negative'){trace.push('FLT3-ITD explicitly negative');if(advGenes.length)trace.push('MR-gene mutation(s) do not override favorable NPM1 subtype');return{category:'Favorable',trace}}
   trace.push('FLT3-ITD status unknown');return{category:'Unable to determine',trace}
 }

 if(fusions.includes('MLLT3::KMT2A')){
   trace.push('t(9;11)/MLLT3::KMT2A detected');
   if(advGenes.length)trace.push('t(9;11) takes precedence over rare concurrent adverse-risk gene mutations: '+advGenes.join(', '));
   return{category:'Intermediate',trace}
 }

 if(cy.adverse.length){trace.push('Adverse-risk structured cytogenetic/rearrangement feature(s): '+cy.adverse.join(', '));return{category:'Adverse',trace}}
 if(advGenes.length){trace.push('Adverse MR-gene mutation(s): '+advGenes.join(', '));return{category:'Adverse',trace}}
 if(itd==='Positive'){trace.push('FLT3-ITD detected without favorable/adverse defining lesion');return{category:'Intermediate',trace}}
 if(itd==='Unknown'){trace.push('No favorable/adverse defining lesion established');trace.push('FLT3-ITD status unknown');return{category:'Unable to determine',trace}}
 trace.push('No favorable/adverse defining lesion identified');return{category:'Intermediate',trace}
}

function eln2024LIRisk(m){
 if(!m)return{category:'Pending',trace:['No diagnostic BMBx']};
 let trace=[];
 if(D.base.phma==='Yes'){trace.push('Prior HMA exposure documented');trace.push('2024 ELN Less-Intensive is not applicable');return{category:'Not applicable',trace}}
 let tp53=markerStatus(m,'TP53').status,itd=markerStatus(m,'FLT3-ITD').status,nr=markerStatus(m,'NRAS').status,kr=markerStatus(m,'KRAS').status,ddx41=markerStatus(m,'DDX41').status;
 if(tp53==='Positive'){trace.push('TP53 mutated');return{category:'Adverse',trace}}
 if(tp53==='Unknown'){trace.push('TP53 status unknown');return{category:'Unable to determine',trace}}
 if(ddx41==='Positive'){trace.push('DDX41 mutated');trace.push('TP53 wild-type/negative');return{category:'Favorable',trace}}
 let sig=[['FLT3-ITD',itd],['NRAS',nr],['KRAS',kr]],positive=sig.filter(x=>x[1]==='Positive').map(x=>x[0]),unknown=sig.filter(x=>x[1]==='Unknown').map(x=>x[0]);
 trace.push('TP53 wild-type/negative');
 if(positive.length){trace.push('Activating signaling alteration(s): '+positive.join(', '));return{category:'Intermediate',trace}}
 if(unknown.length){trace.push('Required signaling status unknown: '+unknown.join(', '));return{category:'Unable to determine',trace}}
 trace.push('FLT3-ITD, NRAS, and KRAS all explicitly negative');return{category:'Favorable',trace}
}


let failures=[];
const ok=(x,msg)=>{if(!x)failures.push(msg)};
let D={base:{marker_overrides:{},phma:'No'},marrows:[]};

function mkBase(){
 return {diagnostic:true,mutations:[],cytoObservations:[],fishObservations:[],raw:{ngspos:'',ngstest:'',cyto:'',fish:''}}
}

// Blast hierarchy exact QI case
let q={preferredBlastManual:null,blastAspirate:3.5,aspirateAdequacy:'Hemodilute + aspicular',blastFlow:30,flowAdequate:true,blastIhcLow:20,blastIhcHigh:25};
ok(preferredBlast(q).value===30 && preferredBlast(q).source.startsWith('Flow cytometry'),'limited aspirate should use adequate flow before IHC');

// Exact V2.9/V3.0 diagnostic biology: TP53 x2, complex karyotype, RUNX1 copy gain, t(8;21) NEGATIVE
let case1=mkBase();
case1.mutations=[
 {gene:'TP53',result:'Positive',classification:'Reported',protein:'p.(G244S)',vaf:43.05,raw_description:'TP53 G244S'},
 {gene:'TP53',result:'Positive',classification:'Reported',protein:'p.(P151S)',vaf:39.55,raw_description:'TP53 P151S'},
 {gene:'EZH2',result:'Positive',classification:'VUS',protein:'p.(M24T)',vaf:48.57}
];
case1.cytoObservations=['t(3;19)(p21;q13.3)','del(5)(q13q33)','-20','add(21)(p11.2)','add(22)(q22)','+mar1','+3','-der(3)t(3;19)(p22;q13.3)','+mar2'].map(abnormality=>({abnormality,result:'Present'}));
case1.fishObservations=[
 {target:'Del 5q',result:'Positive'},
 {target:'Del 20q12',result:'Positive'},
 {target:'Three copies of RUNX1',result:'Positive'},
 {target:'t(8;21)',result:'Negative'},
 {target:'Rearrangement of 3q26',result:'Negative'},
 {target:'Rearrangement of 11q23',result:'Negative'}
];
D.marrows=[case1];
ok(favorableCBF(case1)==='','negative t(8;21) + RUNX1 copy gain must NOT create RUNX1::RUNX1T1');
ok(!positiveFusionConcepts(case1).includes('RUNX1::RUNX1T1'),'RUNX1 copy gain remains separate from fusion');
ok(eln2022Risk(case1).category==='Adverse','exact TP53/complex/del5q case must be ELN 2022 Adverse');
ok(eln2024LIRisk(case1).category==='Adverse','TP53-mutated case must be ELN 2024 LI Adverse');

// Negative MECOM/KMT2A should not create adverse risk
let neg=mkBase();
neg.fishObservations=[{target:'Rearrangement of 3q26',result:'Negative'},{target:'Rearrangement of 11q23',result:'Negative'}];
neg.mutations=[{gene:'FLT3',result:'Negative',classification:'Not detected'},{gene:'NPM1',result:'Negative',classification:'Not detected'}];
ok(!structuredCytoRiskFeatures(neg).adverse.includes('MECOM rearrangement'),'negative MECOM cannot trigger adverse');
ok(!structuredCytoRiskFeatures(neg).adverse.includes('KMT2A rearrangement'),'negative KMT2A cannot trigger adverse');

// Raw text alone must not trigger a fusion
let rawOnly=mkBase();
rawOnly.raw.fish='t(8;21) – Not Detected; Rearrangement of 3q26 – Not Detected';
ok(favorableCBF(rawOnly)==='','raw text alone cannot trigger CBF favorable');
ok(structuredCytoRiskFeatures(rawOnly).adverse.length===0,'raw text alone cannot trigger adverse cytogenetics');

// True positive t(8;21) structured
let cbf=mkBase();
cbf.fishObservations=[{target:'t(8;21)',result:'Positive'}];
ok(favorableCBF(cbf)==='RUNX1::RUNX1T1','structured positive t(8;21) recognized');
ok(eln2022Risk(cbf).category==='Favorable','true t(8;21) favorable absent TP53');

// TP53 >=10 overrides true CBF in formal engine
cbf.mutations=[{gene:'TP53',result:'Positive',classification:'Pathogenic',vaf:20}];
ok(eln2022Risk(cbf).category==='Adverse','TP53 VAF >=10 overrides true CBF in current ELN 2022 hierarchy');

// MR gene does not override favorable CBF
let cbfMR=mkBase();
cbfMR.fishObservations=[{target:'t(8;21)',result:'Positive'}];
cbfMR.mutations=[{gene:'ASXL1',result:'Positive',classification:'Pathogenic',vaf:30}];
ok(eln2022Risk(cbfMR).category==='Favorable','MR gene must not override favorable CBF subtype');

// NPM1 interactions
let npm=mkBase();
npm.mutations=[{gene:'NPM1',result:'Positive',classification:'Pathogenic'},{gene:'FLT3',result:'Positive',classification:'Pathogenic',raw_description:'FLT3-ITD detected'}];
ok(eln2022Risk(npm).category==='Intermediate','NPM1 + FLT3-ITD intermediate');

let npmfav=mkBase();
npmfav.mutations=[{gene:'NPM1',result:'Positive',classification:'Pathogenic'}];
npmfav.raw.ngstest='FLT3-ITD not detected';
ok(eln2022Risk(npmfav).category==='Favorable','NPM1 + explicit FLT3-ITD negative favorable absent adverse cytogenetics');

let npmad=JSON.parse(JSON.stringify(npmfav));
npmad.cytoObservations=[{abnormality:'del(5)(q13q33)',result:'Present'}];
ok(eln2022Risk(npmad).category==='Adverse','NPM1 + adverse cytogenetics adverse');

// t(9;11) precedence over MR gene
let t911=mkBase();
t911.cytoObservations=[{abnormality:'t(9;11)(p21.3;q23.3)',result:'Present'}];
t911.mutations=[{gene:'ASXL1',result:'Positive',classification:'Pathogenic'}];
ok(eln2022Risk(t911).category==='Intermediate','t(9;11) intermediate despite MR gene');

// 2024 LI isolated
let li=mkBase();
li.mutations=[
 {gene:'TP53',result:'Negative',classification:'Not detected'},
 {gene:'NRAS',result:'Negative',classification:'Not detected'},
 {gene:'KRAS',result:'Negative',classification:'Not detected'}
];
li.raw.ngstest='FLT3-ITD not detected';
D.base.phma='No';
ok(eln2024LIRisk(li).category==='Favorable','2024 LI TP53wt + signaling negative favorable');
li.mutations.push({gene:'NRAS',result:'Positive',classification:'Pathogenic'});
ok(eln2024LIRisk(li).category==='Intermediate','2024 LI NRAS positive intermediate');
D.base.phma='Yes';
ok(eln2024LIRisk(li).category==='Not applicable','2024 LI prior HMA not applicable');

console.log(JSON.stringify({failures,case1_e22:eln2022Risk(case1),case1_e24:eln2024LIRisk(case1),preferred:preferredBlast(q)},null,2));
if(failures.length)process.exit(2);
