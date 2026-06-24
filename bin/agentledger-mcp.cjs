#!/usr/bin/env node
// CJS wrapper — required because npm 11 rejects .js bin entries in ESM packages
import('../dist/index.js').catch((e) => { console.error(e); process.exit(1); });
