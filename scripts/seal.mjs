import {readFile,writeFile} from 'node:fs/promises';import {seal} from '../assets/crypto.js';
if(!process.env.BLOG_PASSPHRASE||!process.argv[2])throw Error('Set BLOG_PASSPHRASE and pass an external private JSON file path');
const data=JSON.parse(await readFile(process.argv[2],'utf8'));if(!Array.isArray(data)||data.some(p=>!p.id||!p.title||!p.body))throw Error('Invalid archive');await writeFile('data/archive.enc.json',JSON.stringify(await seal(data,process.env.BLOG_PASSPHRASE)));console.log('Encrypted archive written; plaintext was not copied.');
