const { get } = require('lodash/fp');
const path = require('path');
const { getUserId, getRole } = require('../utils/auth.utils');
const ErrorResponse = require('../utils/error-response');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

/**
 * @desc Get all bootcamps
 * @route GET api/v1/bootcamps
 * @access Public
 */
const getBootcamps = asyncHandler(async (req, res) => {
  res.status(200)
    .json(res.advancedResults);
});

/**
 * @desc Get single bootcamps
 * @route GET api/v1/bootcamps/:id
 * @access Public
 */
const getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcampId = get('params.id', req);

  const bootcamp = await Bootcamp.findOne({ _id: bootcampId });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  return res
    .status(200)
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
  const userId = getUserId(req);
  const role = getRole(req);

  const publishedBootcamp = await Bootcamp.findOne({ user: userId });

  if (publishedBootcamp && role !== 'admin') {
    return next(
      new ErrorResponse(`User with id ${userId} has already published a bootcamp`, 400)
    );
  }

  const bootcamp = await Bootcamp.create({
    ...req.body,
    user: userId
  });

  return res
    .status(201)
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
  const userId = getUserId(req);
  const role = getRole(req);
  const bootcampId = get('params.id', req);

  const bootcamp = await Bootcamp.findOne({ _id: bootcampId });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  if (bootcamp.user.toString() !== userId && role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${userId} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  const updatedBootcamp = await Bootcamp.findOneAndUpdate(
    { _id: bootcampId },
    req.body,
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json({
      success: true,
      data: updatedBootcamp
    });
});

/**
 * @desc Delete bootcamps
 * @route DELETE api/v1/bootcamps/:id
 * @access Private
 */
const deleteBootcamp = asyncHandler(async (req, res, next) => {
  const userId = getUserId(req);
  const role = getRole(req);
  const bootcampId = get('params.id', req);

  const bootcamp = await Bootcamp.findOne({ _id: bootcampId });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  if (bootcamp.user.toString() !== userId && role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${userId} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  await bootcamp.remove();

  return res
    .status(200)
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
const getBootcampsInRadius = asyncHandler(async (req, res) => {
  const { zipcode, distance } = req.params;

  const [geoData = {}] = await geocoder.geocode(zipcode);

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin:
        { $centerSphere: [[geoData.longitude, geoData.latitude], radius] }
    }
  });

  return res
    .status(200)
    .json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
});

/**
 * @desc Upload photo for bootcamp
 * @route PUT api/v1/bootcamps/:id/photo
 * @access Private
 */
/* eslint-disable consistent-return */
const uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const userId = getUserId(req);
  const role = getRole(req);
  const bootcampId = get('params.id', req);

  const bootcamp = await Bootcamp.findOne({ _id: bootcampId });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  if (bootcamp.user.toString() !== userId && role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${userId} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(
      new ErrorResponse('Please upload the file', 400)
    );
  }

  const file = get('files.file', req);

  if (!file.mimetype || !file.mimetype.startsWith('image')) {
    return next(
      new ErrorResponse('Please upload an image file', 400)
    );
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`Please upload an image less then ${process.env.MAX_FILE_UPLOAD}`, 400)
    );
  }

  file.name = `photo_${bootcampId}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Error while uploading file', 500));
    }

    await Bootcamp.findByIdAndUpdate(bootcampId, { photo: file.name });

    res
      .status(200)
      .json({
        success: true,
        data: file.name
      });
  });
});

module.exports = {
  getBootcamps,
  getBootCamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto
};
