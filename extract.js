const fs=require('fs');
const str=fs.readFileSync('chunks_raw.txt','utf8');
const parts=str.split('"TargetContent":"');
for(let i=1;i<parts.length;i++){
    const end=parts[i].indexOf('","ReplacementContent"');
    if(end!==-1){
        fs.writeFileSync('target_'+i+'.txt', parts[i].substring(0,end).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t'));
    }
}
