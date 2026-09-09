constfs = require('fs');
const path1 = './node_modules/expo-firebase-core/src/ExponentPushToken.ts';
const path2 = './node_modules/expo-firebase-core/build/ExponentPushToken.js';
[ path1, path2 ].forEach(p => {
  try {
    if (fs.existsSync(p)) {
      let c = fs.readFileSync(p, 'utf8');
      c = c.replace(/from ['"]uuid\/v4['"]/g, "from 'uuid'");
      c = c.replace(/require\(['"]uuid\/v4['"]\)/g, "require('uuid')");
      fs.writeFileSync(p, c);
      console.log('Fixed:', p);
    }
  } catch (e) {
    console.log('Fix failed', e);
  }
});
