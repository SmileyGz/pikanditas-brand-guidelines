import fs from 'fs';
import { parse } from '@babel/parser';

function check(file) {
  try {
    const code = fs.readFileSync(file, 'utf-8');
    parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log(file, "OK");
  } catch(e) {
    console.error(file, "ERROR:", e.message);
  }
}

check('src/App.jsx');
check('src/store/authStore.ts');
check('src/portals/admin/AdminLogin.jsx');
check('src/portals/seller/SellerLogin.jsx');
