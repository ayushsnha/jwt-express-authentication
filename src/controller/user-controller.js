const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const User = require('../model/User');

const JWT_SECRET_KEY = 'someKey';

const signup = async (req, res, next) => {
    const { name, email, password } = req.body
    let existingUser;

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        return new Error(err)
    }

    if (existingUser) {
        return res.status(400).json({ message: 'User Already Exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = new User({
        name,
        email,
        password: hashedPassword,
    });

    try {
        await user.save();
        return res.status(201).json({ message: user })
    } catch (err) {
        return res.status(400).json(err);
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        return new Error(err)
    }

    if (!existingUser) {
        return res.status(400).json({ message: 'User Not Found !!' })
    }

    const isCorrectPassword = bcrypt.compareSync(password, existingUser.password);

    if (!isCorrectPassword) {
        return res.status(400).json({ message: 'Invalid Email / Password' });
    }

    const token = jwt.sign({ id: existingUser._id }, JWT_SECRET_KEY, {
        expiresIn: "1h"
    })

    return res.status(200).json({ message: 'Successfully Logged In', user: existingUser, token: token })
}

exports.signup = signup;
exports.login = login;