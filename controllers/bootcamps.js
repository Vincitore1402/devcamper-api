const { get } = require('lodash/fp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

/**
 * @desc Get all bootcamps
 * @route GET api/v1/bootcamps
 * @access Public
 */
const getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();

  res.status(200)
    .json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
});

/**
 * @desc Get single bootcamps
 * @route GET api/v1/bootcamps/:id
 * @access Public
 */
const getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcampId = get('params.id', req);

  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  res.status(200)
    .json({
      success: true,
      data: bootcamp
    });
});

/**
 * @desc Create new bootcamps
 * @route POST api/v1/bootcamps
 * @access Private
 */
const createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201)
    .json({
      success: true,
      data: bootcamp
    });
});

/**
 * @desc Update bootcamps
 * @route PUT api/v1/bootcamps/:id
 * @access Private
 */
const updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcampId = get('params.id', req);

  const bootcamp = await Bootcamp.findByIdAndUpdate(
    bootcampId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  res.status(200)
    .json({
      success: true,
      data: bootcamp
    });
});

/**
 * @desc Delete bootcamps
 * @route DELETE api/v1/bootcamps/:id
 * @access Private
 */
const deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcampId = get('params.id', req);

  const bootcamp = await Bootcamp.findByIdAndDelete(bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  res.status(200)
    .json({
      success: true,
      data: {}
    });
});

/**
 * @desc Get bootcamps within a radius
 * @route GET api/v1/bootcamps/radius/:zipcode/:distance
 * @access Private
 */
const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const [geoData = {}] = await geocoder.geocode(zipcode);

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin:
        { $centerSphere: [[geoData.longitude, geoData.latitude], radius] }
    }
  });

  res.status(200)
    .json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    })
});

module.exports = {
  getBootcamps,
  getBootCamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius
};
