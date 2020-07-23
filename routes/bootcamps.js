const express = require('express');
const {
  getBootcamps,
  getBootCamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

const advancedResults = require('../middleware/advanced.results');
const { protect } = require('../middleware/auth');

const courseRouter = require('./courses');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);

router.route('/:id/photo')
  .put(protect, uploadBootcampPhoto);

router.route('/')
  .get(
    advancedResults(Bootcamp, 'courses'),
    getBootcamps
  )
  .post(protect, createBootcamp);

router.route('/:id')
  .get(getBootCamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

module.exports = router;
