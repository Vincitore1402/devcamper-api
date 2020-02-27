const express = require('express');
const {
  getBootcamps,
  getBootCamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius
} = require('../controllers/bootcamps');

const courseRouter = require('./courses');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);

router.route('/')
  .get(getBootcamps)
  .post(createBootcamp);

router.route('/:id')
  .get(getBootCamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
