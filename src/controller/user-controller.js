const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        expiresIn: "30s"
    })

    if (req.cookies[`${existingUser._id}`]) {
        req.cookies[`${existingUser._id}`] = ''
    }

    res.cookie(String(existingUser._id), token, {
        path: '/',
        expires: new Date(Date.now() + 1000 * 30),
        httpOnly: true,
        sameSite: 'lax'
    })

    return res.status(200).json({ message: 'Successfully Logged In', user: existingUser, token: token })
}

const verifyToken = (req, res, next) => {
    const cookie = req.headers?.cookie || null;
    if (!cookie) {
        return res.status(400).json({ message: 'Session Expired!!' })
    }
    const token = cookie.split('=')[1];
    if (!token) {
        return res.status(404).json({ message: 'No Token Found' })
    }
    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(400).json({ message: 'Invalid Token' })
        }
        req.id = user.id;
    })
    next()
}

const getUser = async (req, res, next) => {
    const userId = req.id;
    let user;

    try {
        user = await User.findById(userId, "-password");
    } catch (err) {
        return new Error(err);
    }

    if (!user) {
        return res.status(404).json({ message: 'User not Found !!' })
    }

    return res.status(200).json({ user });

};

const refreshToken = (req, res, next) => {
    const cookie = req.headers?.cookie || null;
    const prevToken = cookie.split('=')[1];
    if (!prevToken) {
        return res.status(400).json({ message: 'Unauthorized' })
    }
    jwt.verify(String(prevToken), JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Authentication Failed' })
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`] = '';

        const token = jwt.sign({ id: user.id }, JWT_SECRET_KEY, {
            expiresIn: '30s'
        });

        res.cookie(String(user._id), token, {
            path: '/',
            expires: new Date(Date.now() + 1000 * 30),
            httpOnly: true,
            sameSite: 'lax'
        })

        req.id = user.id;
        next();

    })

}

exports.signup = signup;
exports.login = login;
exports.verifyToken = verifyToken;
exports.getUser = getUser;
exports.refreshToken = refreshToken;