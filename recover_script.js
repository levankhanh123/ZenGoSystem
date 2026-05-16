const fs = require('fs');
const txt = fs.readFileSync('C:/Users/Doan Hieu/.gemini/antigravity/brain/f712df86-2da1-4c23-9810-5c3edafdbe03/.system_generated/logs/overview.txt', 'utf8');
const lines = txt.split('\n');
const calls = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"tool_calls":[')) {
    try {
      const obj = JSON.parse(lines[i]);
      if (obj.tool_calls) {
        for (const call of obj.tool_calls) {
          if (call.name === 'replace_file_content' || call.name === 'multi_replace_file_content' || call.name === 'write_to_file') {
            if (call.args && call.args.TargetFile && call.args.TargetFile.includes('Campaigns.jsx')) {
              calls.push(call);
            }
          }
        }
      }
    } catch(e) {}
  }
}
fs.writeFileSync('campaigns_calls.json', JSON.stringify(calls, null, 2));
