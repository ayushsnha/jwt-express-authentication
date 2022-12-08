const express = require('express');
const mongoose = require('mongoose')

const router = require('./src/routes/user-routes')

const app = express();
mongoose.set('strictQuery', false);
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('<span>Success!! : 200</span>')
})

app.use('/api', router)


mongoose.connect('mongodb+srv://admin:WcCjdvuoO6D2DDu2@cluster0.t5n2fcy.mongodb.net/auth?retryWrites=true&w=majority')
    .then(() => {
        app.listen(5000, () => {
            console.log('DB Connected!!, App listening to PORT 5000')
        });
    }).catch((err) => console.log(err))
