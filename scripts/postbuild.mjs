import { rm, access } from 'node:fs/promises';
await rm('out/lab',{recursive:true,force:true});
await access('out/index.html');
