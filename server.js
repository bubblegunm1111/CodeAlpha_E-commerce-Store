const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4500; // 3001 is used by another project

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
