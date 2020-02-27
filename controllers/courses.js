const { get } = require('lodash/fp');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');

/**
 * @desc      Get courses
   @route     GET /api/v1/courses
   @route     GET /api/v1/bootcamps/:bootcampId/courses
   @access    Public
 */
const getCourses = asyncHandler(async (req, res, next) => {
  const bootcampId = get('params.bootcampId', req);

  const query = bootcampId ? { bootcamp: bootcampId } : {};

  const courses = await Course
    .find({ ...query })
    .populate({
      path: 'bootcamp',
      select: 'name description'
    });

  res.status(200)
    .json({
      success: true,
      count: courses.length,
      data: courses
    });
});


/**
 * @desc      Get single course
 * @route     GET /api/v1/courses/:id
 * @access    Public
 */
const getCourse = asyncHandler(async (req, res, next) => {
  // TODO
});


/**
 * @desc      Add course
 * @route     POST /api/v1/bootcamps/:bootcampId/courses
 * @access    Private
 */
const createCourse = asyncHandler(async (req, res, next) => {
  // TODO
});

/**
 * @desc      Update course
 * @route     PUT /api/v1/courses/:id
 * @access    Private
 */
const updateCourse = asyncHandler(async (req, res, next) => {
  // TODO
});

/**
 * @desc      Delete course
 * @route     DELETE /api/v1/courses/:id
 * @access    Private
 */
const deleteCourse = asyncHandler(async (req, res, next) => {
  // TODO
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
};
