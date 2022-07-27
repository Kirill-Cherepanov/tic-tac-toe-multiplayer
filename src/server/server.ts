import express from 'express';
import path from 'path';
import './app.ts';

const app = express();

app.listen(process.env.PORT || 8080);

app.use(express.static(path.resolve(__dirname, '../frontend')));

app.use((req, res) => {
  res.status(404).send('<h1>404 page not found!</h1>');
});
