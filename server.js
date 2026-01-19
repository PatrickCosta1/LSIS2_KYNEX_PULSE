const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post('/save-email', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  const filePath = path.join(__dirname, 'emails.txt');
  fs.appendFile(filePath, email + '\n', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao guardar email' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
