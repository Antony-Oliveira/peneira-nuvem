import express from 'express';
const app = express();

app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Peneira!`);
});

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});