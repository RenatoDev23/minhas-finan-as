const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const baseDist = path.join(__dirname, 'dist');

let distPath;

// pega automaticamente a pasta dentro de dist (ex: app)
const subDirs = fs.readdirSync(baseDist);

if (subDirs.length > 0) {
  distPath = path.join(baseDist, subDirs[0], 'browser');
} else {
  console.error('Nenhuma pasta dentro de dist encontrada!');
  process.exit(1);
}

console.log('Usando pasta:', distPath);

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});