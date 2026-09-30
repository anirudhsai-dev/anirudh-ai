const fs = require('fs');
['A','N','I','R','U','D','H'].forEach(l=>{
  fs.writeFileSync('C:\\Users\\aniru\\Downloads\\anirudh-ai\\src\\renderer\\src\\components\\letters\\Letter'+l+'.tsx', 'export { LetterBase as default } from "./LetterBase";');
});
console.log('done');