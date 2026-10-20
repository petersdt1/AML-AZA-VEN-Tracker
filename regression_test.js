function detectAncillaryStudiesFromText(raw,dateHint=''){
 let text=String(raw||''),chunks=text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean),out=[];
 chunks.forEach((c,idx)=>{
   let spec=/\bCSF\b|cerebrospinal/i.test(c)?'CSF':/pleural/i.test(c)?'Pleural fluid':/ascit/i.test(c)?'Ascites':/peripheral blood|\bPB\b/i.test(c)?'Peripheral blood':'';
   let assay=/flow cytometr|immunophenotyp/i.test(c)?'Flow cytometry':/\bNGS\b|next[- ]generation|molecular panel|genomic profil/i.test(c)?'NGS':/\bFISH\b/i.test(c)?'FISH':/BCR\s*[:]{0,2}\s*ABL|BCR-ABL/i.test(c)?'BCR::ABL1 PCR':/NPM1.*(?:q?PCR|molecular)/i.test(c)?'NPM1 qPCR':/FLT3.*(?:q?PCR|molecular)/i.test(c)?'FLT3 PCR/qPCR':/\bq?PCR\b|polymerase chain/i.test(c)?'PCR/qPCR':'';
   if(!spec||!assay)return;
   if(/bone marrow|marrow aspirate|core biopsy|bmbx/i.test(c)&&spec==='Peripheral blood'&&!/peripheral blood[^\n.]{0,40}flow cytometr|flow cytometr[^\n.]{0,40}peripheral blood/i.test(c))return;
   let dm=c.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/),date=dm?normalizeDateText(dm[1],'Ancillary date'):(dateHint||'');
   let positive=/\bpositive\b|\bdetected\b|abnormal (?:myeloid|blast|population)/i.test(c)&&!/not detected|negative/i.test(c);
   let negative=/not detected|\bnegative\b/i.test(c)&&!positive;
   let pct=c.match(/(?:blasts?|abnormal[^%\n]{0,50}?)\s*(?:comprise|represent|=|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*%/i);
   let target=assay==='Flow cytometry'?(pct?`Abnormal population ${pct[1]}%`:'Abnormal population / phenotype'):assay.replace(' PCR/qPCR','').replace(' qPCR','');
   out.push({id:'AS'+Date.now()+idx,date,specimen:spec,assay,status:positive?'Positive':negative?'Negative':'Unknown',target,value:pct?pct[1]:'',units:pct?'%':'',lod:'',summary:c.slice(0,500),raw:c,notes:'',evidence:c.slice(0,320),_selected:true})
 });
 return out
}


function normalizeDateText(raw){let m=String(raw||'').match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);if(!m)return raw&&/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:'';let y=m[3].length===2?2000+Number(m[3]):Number(m[3]);return `${y}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`}
function normalizeTimestamp(line){let m=line.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})\s*$/);if(!m)return null;let y=m[3].length===2?2000+Number(m[3]):Number(m[3]);return `${y}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}T${m[4].padStart(2,'0')}:${m[5]}:00`}
function numericFrom(line){let m=line.match(/:\s*([0-9]+(?:\.[0-9]+)?)/);return m?Number(m[1]):null}
let t=`Peripheral blood flow cytometry 01/22/2024: abnormal myeloid blasts comprise 18% of events.

CSF FLOW CYTOMETRY 03/05/2024: Positive for an abnormal myeloid blast population, 2.1%.`;
let a=detectAncillaryStudiesFromText(t,'');
let pb=a.find(x=>x.specimen==='Peripheral blood'),csf=a.find(x=>x.specimen==='CSF');
let fail=[];if(pb?.value!=='18')fail.push('PB flow percent');if(csf?.value!=='2.1')fail.push('CSF flow percent');
console.log(JSON.stringify({fail,a},null,2));if(fail.length)process.exit(2);
