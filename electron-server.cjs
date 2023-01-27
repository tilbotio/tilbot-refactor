const express = require('express');
const path = require('path');


const app = express();

app.use(express.static(path.join(__dirname, '/build/')));

app.get('/', (req, res) => {
    res.status(200);
    res.sendFile(path.join(__dirname, '/build/index.html'));
});

app.listen(2801, () => {
    console.log('listening on port 2801');
});