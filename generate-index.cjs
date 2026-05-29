const fs = require('fs');
const path = require('path');

function generateIndex(dirPath) {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  let imports = '';
  let exportsMap = 'export default {\n';
  
  files.forEach(file => {
    const name = file.replace('.json', '');
    // Ensure valid JS identifier
    let safeName = name.replace(/-/g, '_');
    imports += `import ${safeName} from './${file}';\n`;
    exportsMap += `  "${name}": ${safeName},\n`;
  });
  exportsMap += '};\n';
  
  fs.writeFileSync(path.join(dirPath, 'index.ts'), imports + '\n' + exportsMap);
  console.log(`Generated index for ${dirPath}`);
}

generateIndex(path.join(__dirname, 'src/messages/en'));
generateIndex(path.join(__dirname, 'src/messages/th'));
