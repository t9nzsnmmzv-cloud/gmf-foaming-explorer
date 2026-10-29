import {build} from 'esbuild';
await build({entryPoints:['entry.js'],bundle:true,minify:true,format:'iife',outfile:'../docs/app.js'});
