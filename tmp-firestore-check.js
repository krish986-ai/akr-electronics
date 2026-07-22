const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.resolve('.env.local'),'utf8');
const env = {};
for (const line of content.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const admin = require('firebase-admin');
const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
const options = {
  projectId: env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey,
};
admin.initializeApp({ credential: admin.credential.cert(options) });
const db = admin.firestore();
(async () => {
  const cats = await db.collection('categories').get();
  console.log('categories', cats.size);
  cats.docs.slice(0,3).forEach(d => console.log(' cat', d.id, JSON.stringify(d.data())));
  const brs = await db.collection('brands').get();
  console.log('brands', brs.size);
  brs.docs.slice(0,3).forEach(d => console.log(' brand', d.id, JSON.stringify(d.data())));
  const prods = await db.collection('products').limit(5).get();
  console.log('products', prods.size);
  prods.docs.slice(0,3).forEach(d => console.log(' prod', d.id, JSON.stringify(d.data())));
})();
