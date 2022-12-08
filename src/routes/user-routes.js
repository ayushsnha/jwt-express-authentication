const express = require('express');
const { signup } = require('../controller/user-controller');

const router = express();

router.post('/signup', signup);
router.post('/login', signup)

module.exports = router;