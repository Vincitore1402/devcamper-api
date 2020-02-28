const { get } = require('lodash/fp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

/**
 * @desc      Get courses
 * @route     GET /api/v1/courses
 * @route     GET /api/v1/bootcamps/:bootcampId/courses
 * @access    Public
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
  const courseId = get('params.id', req);

  const course = await Course
    .findById(courseId)
    .populate({
      path: 'bootcamp',
      select: 'name description'
    });

  if (!course) {
    return next(
      new ErrorResponse(
        `No course with the id of ${courseId}`,
        404
      )
    );
  }

  res.status(200)
    .json({
      success: true,
      data: course
    });
});

/**
 * @desc      Add course
 * @route     POST /api/v1/bootcamps/:bootcampId/courses
 * @access    Private
 */
const createCourse = asyncHandler(async (req, res, next) => {
  const bootcampId = get('params.bootcampId', req);

  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${bootcampId}`,
        404
      )
    );
  }

  const course = await Course.create({
    ...req.body,
    bootcamp: bootcampId
  });

  res.status(200)
    .json({
      success: true,
      data: course
    });
});

/**
 * @desc      Update course
 * @route     PUT /api/v1/courses/:id
 * @access    Private
 */
const updateCourse = asyncHandler(async (req, res, next) => {
  const courseId = get('params.id', req);

  const course = await Course.findById(courseId);

  if (!course) {
    return next(
      new ErrorResponse(
        `No course with the id of ${courseId}`,
        404
      )
    );
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200)
    .json({
      success: true,
      data: updatedCourse
    });
});

/**
 * @desc      Delete course
 * @route     DELETE /api/v1/courses/:id
 * @access    Private
 */
const deleteCourse = asyncHandler(async (req, res, next) => {
  const courseId = get('params.id', req);

  const course = await Course.findById(courseId);

  if (!course) {
    return next(
      new ErrorResponse(
        `No course with the id of ${courseId}`,
        404
      )
    );
  }

  await course.remove();

  res.status(200)
    .json({
      success: true,
      data: {}
    });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
};
