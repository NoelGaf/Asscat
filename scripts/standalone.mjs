import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
// Inline the production bundle for a downloadable, network-free playable file.
const assets=await readdir('dist/assets');
const js=await readFile('dist/assets/'+assets.find(p=>p.endsWith('.js')),'utf8');
const css=await readFile('dist/assets/'+assets.find(p=>p.endsWith('.css')),'utf8');
const license=await readFile('THIRD_PARTY_LICENSES.txt','utf8');
let html=await readFile('dist/index.html','utf8');
html=html.replace('<head>',()=>'<head><!--\nThree.js license:\n'+license+'\n-->');
html=html.replace(/<script type="module"[^>]*src="[^"]+"[^>]*><\/script>/,()=>'<script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
html=html.replace(/<link rel="stylesheet"[^>]*>/,()=>'<style>'+css+'</style>');
await mkdir('dist',{recursive:true});await writeFile('dist/asscat-3d.html',html);
console.log('Created dist/asscat-3d.html');
