const fs = require('fs');

let content = fs.readFileSync('frontend/src/admin/pages/Campaigns.jsx', 'utf8');
const calls = JSON.parse(fs.readFileSync('campaigns_calls.json', 'utf8'));

for (const call of calls) {
  if (call.name === 'replace_file_content') {
    const target = call.args.TargetContent;
    const replacement = call.args.ReplacementContent;
    if (content.includes(target)) {
      content = content.replace(target, replacement);
    } else {
      console.log('Target not found for replace_file_content! Instruction:', call.args.Instruction);
    }
  } else if (call.name === 'multi_replace_file_content') {
    const chunks = call.args.ReplacementChunks;
    // chunks is sometimes a string?
    let parsedChunks = chunks;
    if (typeof chunks === 'string') {
      try {
        parsedChunks = JSON.parse(chunks);
      } catch(e) { console.error('Failed to parse chunks', e); continue; }
    }
    
    // Sort chunks by StartLine descending to avoid offset issues
    if (parsedChunks && parsedChunks.length > 0) {
        parsedChunks.sort((a,b) => b.StartLine - a.StartLine);
        for (const chunk of parsedChunks) {
          const target = chunk.TargetContent;
          const replacement = chunk.ReplacementContent;
          if (content.includes(target)) {
            content = content.replace(target, replacement);
          } else {
            console.log('Chunk Target not found for multi_replace_file_content!');
          }
        }
    }
  }
}

fs.writeFileSync('frontend/src/admin/pages/Campaigns.jsx.restored', content);
console.log('Restored content saved to Campaigns.jsx.restored');
