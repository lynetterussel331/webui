const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4200;
const app_path = '../dist/webui';

app.use('/', express.static(path.join(__dirname, app_path)))
.listen(PORT, () => console.log(`Listening on ${PORT}`));