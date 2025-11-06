require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/favorites', require('./routes/favorites'));
app.use('/alerts', require('./routes/alerts'));

app.get('/', (req, res) => {
  res.json({ message: 'VERITAS API is running!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
