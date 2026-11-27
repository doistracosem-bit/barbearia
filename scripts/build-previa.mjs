// Gera a prévia em UM único HTML (CSS e JS embutidos) para publicar como artifact do Claude.
// Uso: npm run build:previa  ->  .previa/barbearia-previa.html
// O artifact não carrega arquivos de outros hosts, então nada pode ficar em /assets.
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = join(root, '.previa', 'build')
const dest = join(root, '.previa', 'barbearia-previa.html')

await build({
  root, configFile: false, logLevel: 'warn', plugins: [react(), tailwindcss()],
  build: {
    outDir: out, emptyOutDir: true, modulePreload: false,
    rollupOptions: { input: join(root, 'preview.html'), output: { inlineDynamicImports: true } },
  },
})

let html = readFileSync(join(out, 'preview.html'), 'utf8')
const assets = join(out, 'assets')
const files = readdirSync(assets)
const js = files.filter((f) => f.endsWith('.js'))
if (js.length !== 1) throw new Error(`esperava 1 arquivo JS, veio: ${js.join(', ')}`)
const css = files.filter((f) => f.endsWith('.css')).map((f) => `<style>${readFileSync(join(assets, f), 'utf8')}</style>`).join('')
const code = readFileSync(join(assets, js[0]), 'utf8').replace(/<\/script/gi, '<\\/script')
html = html
  .replace(/<script type="module"[^>]*><\/script>/, '')
  .replace(/<link rel="stylesheet" crossorigin href="\/assets\/[^"]+">/g, '')
  .replace('</head>', () => `${css}</head>`)
  .replace('</body>', () => `<script type="module">${code}</script></body>`)
mkdirSync(join(root, '.previa'), { recursive: true })
writeFileSync(dest, html)
console.log(`prévia gerada: ${dest} (${Math.round(html.length / 1024)} KB)`)
