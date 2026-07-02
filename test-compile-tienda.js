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

check('src/portals/tienda/TiendaLogin.jsx');
check('src/portals/tienda/TiendaLayout.jsx');
check('src/portals/tienda/pages/TiendaHome.jsx');
check('src/portals/tienda/pages/TiendaAgreement.jsx');
check('src/portals/tienda/pages/TiendaPurchases.jsx');
check('src/portals/tienda/pages/TiendaSigning.jsx');
check('src/App.jsx');
