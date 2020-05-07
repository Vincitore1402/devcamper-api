const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
require('colors');
const fileUpload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env' });

connectDB();

const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(fileUpload({}));

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => process.exit(1));
});
