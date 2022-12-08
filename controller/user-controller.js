const bcrypt = require('bcryptjs')

const User = require('../model/User');

const signup = async (req, res, next) => {
    const { name, email, password } = req.body
    let existingUser;

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        console.log(err)
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
        res.status(400).json(err);
    }
}

exports.signup = signup