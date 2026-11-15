// Bundles js/ + css/ into a single deployable file.  Usage: node build.mjs
// Output: dist/index.html (full HTML document for any static host)
//         dist/artifact.html (same page as a fragment, for preview hosting)
import { build } from '/opt/npm-tools/node_modules/.bin/../esbuild/lib/main.js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const js = await build({ entryPoints: ['js/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020', write: false, legalComments: 'none' });
const css = readFileSync('css/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n');
const src = readFileSync('index.src.html', 'utf8');
const body = src.replace('/*CSS*/', () => css).replace('/*JS*/', () => js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script'));
mkdirSync('dist', { recursive: true });
const headEnd = body.indexOf('<style>');
const headPart = body.slice(0, body.indexOf('<style>'));
const rest = body.slice(body.indexOf('<style>'));
const styleEnd = rest.indexOf('</style>') + 8;
const doc = '<!doctype html>\n<html lang="en">\n<head>\n' + headPart + rest.slice(0, styleEnd) + '\n</head>\n<body>\n' + rest.slice(styleEnd) + '\n</body>\n</html>\n';
writeFileSync('dist/index.html', doc);
writeFileSync('dist/artifact.html', body);
console.log('built', (doc.length / 1024).toFixed(0) + ' KB');
