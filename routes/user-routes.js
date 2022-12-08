const express = require('express');
const { signup } = require('../controller/user-controller');

const router = express();

router.post('/signup', signup)

module.exports = router;