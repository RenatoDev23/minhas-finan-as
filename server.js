const express = require('express');
const path = require('path');

const app = express();

// tenta múltiplos caminhos
const possiblePaths = [
  'dist/app/browser',
  'dist/browser',
  'dist'
];

let distPath;

for (const p of possiblePaths) {
  const fullPath = path.join(__dirname, p);
  if (require('fs').existsSync(fullPath)) {
    distPath = fullPath;
    break;
  }
}

if (!distPath) {
  console.error('Nenhuma pasta dist encontrada!');
  process.exit(1);
}

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});