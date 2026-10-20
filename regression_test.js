const SMART_SCHEMA_VERSION='aml_bmbx_extract_v1';

function smartExtractionPrompt(sourceText=''){
 return `You are extracting structured AML bone marrow data from heterogeneous clinical source text. Return JSON only, no markdown. Do not calculate ELN risk, AML response, complex karyotype, AML-MR status, or trial eligibility. Extract observations only. Never infer a negative result from absence. A gene is Negative only if assay coverage explicitly establishes it was tested and no mutation was detected. Generic gene-panel coverage does not establish special assay status: generic FLT3 testing is not automatically FLT3-ITD or FLT3-TKD negative, and generic KMT2A sequence testing is not KMT2A-rearrangement negative. If FLT3-ITD or FLT3-TKD is explicitly reported, use gene FLT3-ITD or FLT3-TKD with Positive/Negative. If KMT2A rearrangement is explicitly reported outside FISH/cytogenetics, use gene KMT2A-REARRANGEMENT. A FISH/rearrangement result must preserve Positive versus Negative exactly. RUNX1 copy gain is NOT RUNX1::RUNX1T1. If a field is not established, return null or Unknown. Preserve source evidence verbatim in short snippets.\n\nSchema version: ${SMART_SCHEMA_VERSION}\nJSON shape:\n{\n  "schema_version":"aml_bmbx_extract_v1",\n  "date":"YYYY-MM-DD or null",\n  "diagnostic":true|false|null,\n  "blasts":{\n    "aspirate_pct":number|null,\n    "aspirate_adequacy":"Adequate|Hemodilute / limited|Aspicular / aparticulate|Hemodilute + aspicular|Unknown",\n    "flow_pct":number|null,\n    "flow_adequate":true|false|null,\n    "ihc_low_pct":number|null,\n    "ihc_high_pct":number|null,\n    "pb_status":"Present|Absent|Unknown",\n    "pb_pct":number|null,\n    "emd_status":"Present|Absent/resolved|Unknown"\n  },\n  "flow":[{"marker":"CD34","result":"Positive|Negative|Equivocal|Reported","modifier":"dim|moderate|bright|partial|variable|heterogeneous|limited subset|aberrant|other|","evidence":"short source snippet"}],\n  "mutations":[{"gene":"TP53","result":"Positive|Negative","protein":"","cdna":"","transcript":"","vaf":number|null,"classification":"Pathogenic|Likely pathogenic|VUS|Reported|Not detected","evidence":"short source snippet"}],\n  "tested_genes":["sequence-level genes explicitly shown as assayed; do not use this for FLT3-ITD/TKD or rearrangement assays"],\n  "cytogenetics":[{"abnormality":"del(5)(q13q33)","result":"Present","evidence":"short source snippet"}],\n  "fish":[{"target":"t(8;21)","result":"Positive|Negative|Indeterminate|Unknown","evidence":"short source snippet"}],\n  "mrd":{"assessed":"Yes|No|Unknown","status":"Positive|Negative|Indeterminate|Not performed|Unknown","methods":[],"target":"","value_pct":number|null,"lod_pct":number|null,"specimen":"Bone marrow|Peripheral blood|Other|Unknown","lab":"Local|Central|Unknown","evidence":"short source snippet"},\n  "evidence":{"blasts.aspirate_pct":"...","blasts.aspirate_adequacy":"...","blasts.flow_pct":"...","blasts.ihc_low_pct":"...","blasts.pb_pct":"..."},\n  "warnings":["ambiguities or conflicts requiring human review"]\n}\n\nSOURCE TEXT:\n${sourceText}`
}

function smartSections(text,type='auto'){
 let all=String(text||''),out={path:'',flow:'',cyto:'',fish:'',ngs:'',tested:''};
 if(type!=='auto'){if(type==='pathology')out.path=all;if(type==='flow')out.flow=all;if(type==='cyto')out.cyto=all;if(type==='fish')out.fish=all;if(type==='ngs')out.ngs=all;return out}
 let lines=all.split(/\r?\n/),current='path';
 for(let line of lines){let l=line.trim();if(/^(?:flow cytometry|flow\b)/i.test(l))current='flow';else if(/^(?:cytogenetics|karyotype|chromosome analysis)/i.test(l))current='cyto';else if(/^(?:fish|fluorescence in situ)/i.test(l))current='fish';else if(/^(?:ngs|molecular|next[- ]generation sequencing|heme malignanc.*panel|genomic profiling)/i.test(l))current='ngs';else if(/^(?:pathology|morphology|final diagnosis|bone marrow|peripheral blood)/i.test(l)&&!/flow/i.test(l))current='path';out[current]+=(out[current]?'\n':'')+line}
 if(!out.flow&&/flow cytometr|immunophenotyp/i.test(all))out.flow=all;
 if(!out.cyto&&/(?:\b46,[XY]|\b45,[XY]|\b47,[XY]|karyotype|cytogenetic)/i.test(all))out.cyto=all;
 if(!out.fish&&/\bFISH\b|not detected.*t\(|deletion.*q/i.test(all))out.fish=all;
 if(!out.ngs&&/\bVAF\b|pathogenic|variant of (?:unknown|uncertain) significance|\bc\.[0-9]|\bp\.[A-Z]/i.test(all))out.ngs=all;
 return out
}

function smartNum(x){return x===null||x===undefined||x===''?null:(Number.isFinite(Number(x))?Number(x):null)}
function normalizeSmartDraft(d){
 d=d?.extraction||d?.data||d||{};let b=d.blasts||{},m=d.mrd||{};
 let mutations=(Array.isArray(d.mutations)?d.mutations:[]).map(x=>({gene:String(x.gene||'').toUpperCase(),result:['Positive','Negative'].includes(x.result)?x.result:'Positive',protein:x.protein||'',cdna:x.cdna||'',transcript:x.transcript||'',vaf:smartNum(x.vaf),classification:x.result==='Negative'?'Not detected':(x.classification||'Reported'),source:'AI-assisted extraction',raw_description:x.evidence||'',evidence:x.evidence||''})).filter(x=>x.gene);
 let posGenes=new Set(mutations.filter(x=>x.result==='Positive').map(x=>x.gene)),negGenes=new Set(mutations.filter(x=>x.result==='Negative').map(x=>x.gene));
 (Array.isArray(d.tested_genes)?d.tested_genes:[]).map(x=>String(x||'').trim().toUpperCase()).filter(Boolean).forEach(g=>{if(!posGenes.has(g)&&!negGenes.has(g))mutations.push({gene:g,result:'Negative',protein:'',cdna:'',transcript:'',vaf:null,classification:'Not detected',source:'AI explicit assay coverage + not detected',raw_description:'',evidence:'Explicitly listed as assayed; no detected variant returned'})});
 return {schema_version:d.schema_version||SMART_SCHEMA_VERSION,date:d.date||null,diagnostic:typeof d.diagnostic==='boolean'?d.diagnostic:null,blasts:{aspirate_pct:smartNum(b.aspirate_pct),aspirate_adequacy:['Adequate','Hemodilute / limited','Aspicular / aparticulate','Hemodilute + aspicular','Unknown'].includes(b.aspirate_adequacy)?b.aspirate_adequacy:'Unknown',flow_pct:smartNum(b.flow_pct),flow_adequate:typeof b.flow_adequate==='boolean'?b.flow_adequate:null,ihc_low_pct:smartNum(b.ihc_low_pct),ihc_high_pct:smartNum(b.ihc_high_pct),pb_status:['Present','Absent','Unknown'].includes(b.pb_status)?b.pb_status:'Unknown',pb_pct:smartNum(b.pb_pct),emd_status:['Present','Absent/resolved','Unknown'].includes(b.emd_status)?b.emd_status:'Unknown'},flow:(Array.isArray(d.flow)?d.flow:[]).map(x=>({marker:String(x.marker||'').toUpperCase(),result:['Positive','Negative','Equivocal','Reported'].includes(x.result)?x.result:'Reported',modifier:x.modifier||'',evidence:x.evidence||'',source:'AI-assisted extraction'})).filter(x=>x.marker),mutations,tested_genes:Array.isArray(d.tested_genes)?d.tested_genes:[],cytogenetics:(Array.isArray(d.cytogenetics)?d.cytogenetics:[]).map(x=>withAMLNormalization({abnormality:x.abnormality||'',result:'Present',source:'AI-assisted extraction',evidence:x.evidence||''},'abnormality')).filter(x=>x.abnormality),fish:(Array.isArray(d.fish)?d.fish:[]).map(x=>withAMLNormalization({target:x.target||'',result:['Positive','Negative','Indeterminate','Unknown'].includes(x.result)?x.result:'Unknown',raw_description:x.evidence||'',evidence:x.evidence||''},'target')).filter(x=>x.target),mrd:{assessed:['Yes','No','Unknown'].includes(m.assessed)?m.assessed:'Unknown',status:['Positive','Negative','Indeterminate','Not performed','Unknown'].includes(m.status)?m.status:'Unknown',methods:Array.isArray(m.methods)?m.methods:[],target:m.target||'',value_pct:smartNum(m.value_pct),lod_pct:smartNum(m.lod_pct),specimen:m.specimen||'Bone marrow',lab:m.lab||'Unknown',evidence:m.evidence||''},evidence:d.evidence||{},warnings:Array.isArray(d.warnings)?d.warnings:[]}
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

function normalizeSmartDraft(d){
 d=d?.extraction||d?.data||d||{};let b=d.blasts||{},m=d.mrd||{};
 let mutations=(Array.isArray(d.mutations)?d.mutations:[]).map(x=>({gene:String(x.gene||'').toUpperCase(),result:['Positive','Negative'].includes(x.result)?x.result:'Positive',protein:x.protein||'',cdna:x.cdna||'',transcript:x.transcript||'',vaf:smartNum(x.vaf),classification:x.result==='Negative'?'Not detected':(x.classification||'Reported'),source:'AI-assisted extraction',raw_description:x.evidence||'',evidence:x.evidence||''})).filter(x=>x.gene);
 let posGenes=new Set(mutations.filter(x=>x.result==='Positive').map(x=>x.gene)),negGenes=new Set(mutations.filter(x=>x.result==='Negative').map(x=>x.gene));
 (Array.isArray(d.tested_genes)?d.tested_genes:[]).map(x=>String(x||'').trim().toUpperCase()).filter(Boolean).forEach(g=>{if(!posGenes.has(g)&&!negGenes.has(g))mutations.push({gene:g,result:'Negative',protein:'',cdna:'',transcript:'',vaf:null,classification:'Not detected',source:'AI explicit assay coverage + not detected',raw_description:'',evidence:'Explicitly listed as assayed; no detected variant returned'})});
 return {schema_version:d.schema_version||SMART_SCHEMA_VERSION,date:d.date||null,diagnostic:typeof d.diagnostic==='boolean'?d.diagnostic:null,blasts:{aspirate_pct:smartNum(b.aspirate_pct),aspirate_adequacy:['Adequate','Hemodilute / limited','Aspicular / aparticulate','Hemodilute + aspicular','Unknown'].includes(b.aspirate_adequacy)?b.aspirate_adequacy:'Unknown',flow_pct:smartNum(b.flow_pct),flow_adequate:typeof b.flow_adequate==='boolean'?b.flow_adequate:null,ihc_low_pct:smartNum(b.ihc_low_pct),ihc_high_pct:smartNum(b.ihc_high_pct),pb_status:['Present','Absent','Unknown'].includes(b.pb_status)?b.pb_status:'Unknown',pb_pct:smartNum(b.pb_pct),emd_status:['Present','Absent/resolved','Unknown'].includes(b.emd_status)?b.emd_status:'Unknown'},flow:(Array.isArray(d.flow)?d.flow:[]).map(x=>({marker:String(x.marker||'').toUpperCase(),result:['Positive','Negative','Equivocal','Reported'].includes(x.result)?x.result:'Reported',modifier:x.modifier||'',evidence:x.evidence||'',source:'AI-assisted extraction'})).filter(x=>x.marker),mutations,tested_genes:Array.isArray(d.tested_genes)?d.tested_genes:[],cytogenetics:(Array.isArray(d.cytogenetics)?d.cytogenetics:[]).map(x=>withAMLNormalization({abnormality:x.abnormality||'',result:'Present',source:'AI-assisted extraction',evidence:x.evidence||''},'abnormality')).filter(x=>x.abnormality),fish:(Array.isArray(d.fish)?d.fish:[]).map(x=>withAMLNormalization({target:x.target||'',result:['Positive','Negative','Indeterminate','Unknown'].includes(x.result)?x.result:'Unknown',raw_description:x.evidence||'',evidence:x.evidence||''},'target')).filter(x=>x.target),mrd:{assessed:['Yes','No','Unknown'].includes(m.assessed)?m.assessed:'Unknown',status:['Positive','Negative','Indeterminate','Not performed','Unknown'].includes(m.status)?m.status:'Unknown',methods:Array.isArray(m.methods)?m.methods:[],target:m.target||'',value_pct:smartNum(m.value_pct),lod_pct:smartNum(m.lod_pct),specimen:m.specimen||'Bone marrow',lab:m.lab||'Unknown',evidence:m.evidence||''},evidence:d.evidence||{},warnings:Array.isArray(d.warnings)?d.warnings:[]}
}

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
   if(pos.some(x=>x.gene==='FLT3-ITD')||pos.some(x=>x.gene==='FLT3'&&/\bITD\b|internal tandem/i.test([x.protein,x.cdna,x.raw_description].join(' '))))return{status:'Positive',evidence:'FLT3-ITD detected'};
   if(neg.some(x=>x.gene==='FLT3-ITD')||/\bFLT3[-\s]?ITD\b[^.\n]{0,50}(?:not detected|negative|wild[- ]?type)/i.test(raw))return{status:'Negative',evidence:'FLT3-ITD explicitly negative'};
   return{status:'Unknown',evidence:'Generic FLT3 testing does not establish ITD result'}
 }
 if(key==='FLT3-TKD'){
   if(pos.some(x=>x.gene==='FLT3-TKD')||pos.some(x=>x.gene==='FLT3'&&/\bTKD\b|D835|I836|tyrosine kinase domain/i.test([x.protein,x.cdna,x.raw_description].join(' '))))return{status:'Positive',evidence:'FLT3-TKD detected'};
   if(neg.some(x=>x.gene==='FLT3-TKD')||/\bFLT3[-\s]?TKD\b[^.\n]{0,50}(?:not detected|negative|wild[- ]?type)/i.test(raw))return{status:'Negative',evidence:'FLT3-TKD explicitly negative'};
   return{status:'Unknown',evidence:'Generic FLT3 testing does not establish TKD result'}
 }
 if(key==='KMT2A'){
   if((m.fishObservations||[]).some(x=>x.result==='Positive'&&/KMT2A|11q23/i.test(x.target||''))||pos.some(x=>/^(?:KMT2A[- ]?REARRANGEMENT|KMT2A::)/i.test(x.gene||'')||x.gene==='KMT2A'&&/rearrange|fusion|::/i.test(x.raw_description||'')))return{status:'Positive',evidence:'KMT2A rearrangement/fusion detected'};
   if((m.fishObservations||[]).some(x=>x.result==='Negative'&&/KMT2A|11q23/i.test(x.target||''))||neg.some(x=>/KMT2A[- ]?REARRANGEMENT/i.test(x.gene||'')))return{status:'Negative',evidence:'KMT2A rearrangement explicitly negative'};
   if(pos.some(x=>x.gene==='KMT2A')||neg.some(x=>x.gene==='KMT2A'))return{status:'Unknown',evidence:'KMT2A sequence-level testing does not establish rearrangement status'};
   return{status:'Unknown',evidence:'KMT2A rearrangement not explicitly tested'}
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


let failures=[]; const ok=(x,m)=>{if(!x)failures.push(m)};
let D={base:{marker_overrides:{},phma:'No'},marrows:[]};

// Smart prompt safeguards
ok(smartExtractionPrompt('x').includes('do not use this for FLT3-ITD/TKD')||smartExtractionPrompt('x').includes('generic FLT3 testing is not automatically FLT3-ITD'),'prompt protects special assay status');
ok(smartExtractionPrompt('x').includes('RUNX1 copy gain is NOT RUNX1::RUNX1T1'),'prompt protects copy gain vs fusion');

// Smart sectioning
let mixed='PATHOLOGY\nAspirate 10% blasts\nFLOW CYTOMETRY\nBlasts 20%\nCYTOGENETICS\n46,XY\nFISH\nt(8;21) - Not Detected\nNGS\nTP53 p.R175H VAF 40%';
let sec=smartSections(mixed,'auto');
ok(/Aspirate 10/.test(sec.path),'smartSections pathology');
ok(/Blasts 20/.test(sec.flow),'smartSections flow');
ok(/46,XY/.test(sec.cyto),'smartSections cyto');
ok(/Not Detected/.test(sec.fish),'smartSections fish');
ok(/TP53/.test(sec.ngs),'smartSections ngs');

// AI JSON normalization: explicit tested genes only
let d=normalizeSmartDraft({blasts:{},mutations:[{gene:'TP53',result:'Positive',vaf:42,classification:'Pathogenic'}],tested_genes:['TP53','NPM1','FLT3'],fish:[{target:'t(8;21)',result:'Negative'}],cytogenetics:[],flow:[]});
ok(d.mutations.some(x=>x.gene==='TP53'&&x.result==='Positive'),'positive mutation kept');
ok(d.mutations.some(x=>x.gene==='NPM1'&&x.result==='Negative'),'explicit tested gene gets negative row');
ok(d.mutations.some(x=>x.gene==='FLT3'&&x.result==='Negative'),'generic FLT3 coverage stored sequence-level');
ok(d.fish[0].result==='Negative','negative FISH preserved');

let m={mutations:d.mutations,fishObservations:d.fish,raw:{ngspos:'',ngstest:''}};
ok(markerAutoStatus(m,'FLT3-ITD').status==='Unknown','generic FLT3 negative does not imply FLT3-ITD negative');
let itd=normalizeSmartDraft({blasts:{},mutations:[{gene:'FLT3-ITD',result:'Negative'}],tested_genes:[],fish:[],cytogenetics:[],flow:[]});
ok(markerAutoStatus({mutations:itd.mutations,fishObservations:[],raw:{}},'FLT3-ITD').status==='Negative','explicit FLT3-ITD negative recognized');
let k=normalizeSmartDraft({blasts:{},mutations:[],tested_genes:['KMT2A'],fish:[],cytogenetics:[],flow:[]});
ok(markerAutoStatus({mutations:k.mutations,fishObservations:[],raw:{}},'KMT2A').status==='Unknown','generic KMT2A sequence coverage does not imply rearrangement negative');

// Copy-gain normalization stays distinct
let n=normalizeAMLAbnormality('Three copies of RUNX1');
ok(n.concept==='RUNX1 copy gain','RUNX1 copy gain normalizes separately');

// V3.1 blast hierarchy preserved
let q={preferredBlastManual:null,blastAspirate:3.5,aspirateAdequacy:'Hemodilute + aspicular',blastFlow:30,flowAdequate:true,blastIhcLow:20,blastIhcHigh:25};
ok(preferredBlast(q).value===30,'limited aspirate uses adequate flow');

// ELN exact prior problem preserved as adverse
let case1={diagnostic:true,mutations:[{gene:'TP53',result:'Positive',classification:'Pathogenic',vaf:43.05},{gene:'TP53',result:'Positive',classification:'Pathogenic',vaf:39.55}],cytoObservations:['t(3;19)(p21;q13.3)','del(5)(q13q33)','-20','add(21)(p11.2)','add(22)(q22)','+3'].map(abnormality=>({abnormality,result:'Present'})),fishObservations:[{target:'Three copies of RUNX1',result:'Positive'},{target:'t(8;21)',result:'Negative'}],raw:{ngspos:'',ngstest:''}};
ok(favorableCBF(case1)==='','RUNX1 copy gain + negative t(8;21) is not CBF AML');
ok(eln2022Risk(case1).category==='Adverse','TP53/complex-like case remains adverse');

console.log(JSON.stringify({failures},null,2)); if(failures.length)process.exit(2);
