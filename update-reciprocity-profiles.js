const fs = require('fs');
const path = require('path');

// 读取 Photography.ts 文件
const filePath = path.join(__dirname, 'src', 'constants', 'Photography.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 定义正则表达式来匹配旧的配置格式
const profileRegex = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*nameKey:\s*['"]([^'"]+)['"]\s*,\s*descriptionKey:\s*['"]([^'"]+)['"]\s*,\s*hintKey:\s*['"]([^'"]+)['"]\s*,\s*curve:\s*createSegmentedCurve\((\{[^}]+\})\)\s*,?\s*\}/g;

// 替换匹配到的配置
content = content.replace(profileRegex, (match, id, nameKey, descKey, hintKey, params) => {
  return `createReciprocityProfile('${id}',\n    '${nameKey}',\n    '${descKey}',\n    '${hintKey}',\n    ${params})`;
});

// 写回文件
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Successfully updated reciprocity profiles');
