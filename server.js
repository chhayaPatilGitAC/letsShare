const express = require('express');
const app = express();
const fileRouter = require('./routes/files');
const path = require('path');
const port = process.env.PORT || 8000;

const connectDB = require('./config/connectDB');
connectDB();

app.use(express.static(path.join(__dirname, '/public')))
app.set('views', path.join(__dirname, '/view'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use('/file', fileRouter);

app.get('', (req, res) => {
    res.render('upload', {});
});

app.listen(port, () => {
    console.log(`Listening to server at port : ${port}`)
})

