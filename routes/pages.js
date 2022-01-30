const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
})

router.get('/register', (req, res) => {
    res.render('http://localhost:5000/register');
})

module.exports = router;