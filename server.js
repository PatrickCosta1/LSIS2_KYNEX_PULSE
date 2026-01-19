db.serialize(() => {
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Substitua pela sua string de conexão do Atlas
const MONGO_URI = 'mongodb+srv://dbuser:sinf2abmp@sinf2.ymbvmi4.mongodb.net/';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const EmailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const Email = mongoose.model('Email', EmailSchema);

app.use(express.json());
app.use(express.static(__dirname));

app.post('/save-email', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  try {
    await Email.create({ email });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao guardar email' });
  }
});

app.get('/emails', async (req, res) => {
  try {
    const emails = await Email.find().sort({ created_at: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar emails' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

});