const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const sequelize = new Sequelize('mydb', 'kduah', '', {
  host: 'localhost',
  dialect: 'postgres',
  define: {
    timestamps: false,
  }
});

const Pic = sequelize.define('pics', {
  picpath: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { tableName: 'picsdemo' });


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

const app = express();

sequelize.authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(error => console.error('Unable to connect to the database:', error));

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  try {
    const data = await Pic.findAll();
    res.render('home', { data: data });
  } catch (err) {
    console.log(err);
    res.render('home', { data: {} });
  }
});

app.post('/', upload.single('pic'), async (req, res) => {
  try {
    const x = 'uploads/' + req.file.originalname;
    await Pic.create({ picpath: x });
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
});

app.get('/download/:id', async (req, res) => {
  try {
    const data = await Pic.findByPk(req.params.id);
    if (data) {
      const x = path.join(__dirname, 'public', data.picpath);
      res.download(x);
    } else {
      res.status(404).send('File not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running at port ' + port));

