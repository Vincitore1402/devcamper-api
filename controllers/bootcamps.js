const { get, pipe, omitAll, defaultTo } = require('lodash/fp');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { buildQuery, buildSelectOrSortQuery } = require('../utils/query.utils');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

/**
 * @desc Get all bootcamps
 * @route GET api/v1/bootcamps
 * @access Public
 */
const getBootcamps = asyncHandler(async (req, res, next) => {
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Get request query and remove fields with specific purposes
  const reqQuery = pipe(
    get('query'),
    it => ({ ...it }),
    omitAll(removeFields)
  )(req);

  const selectQuery = pipe(
    get('query.select'),
    buildSelectOrSortQuery
  )(req);

  const sortQuery = pipe(
    get('query.sort'),
    buildSelectOrSortQuery,
    defaultTo('-createdAt')
  )(req);

  const page = pipe(
    get('query.page'),
    it => parseInt(it, 10),
    defaultTo(1)
  )(req);

  const limit = pipe(
    get('query.limit'),
    it => parseInt(it, 10),
    defaultTo(25)
  )(req);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  const bootcamps = await Bootcamp
    .find({ ...buildQuery(reqQuery) })
    .populate('courses')
    .select(selectQuery)
    .sort(sortQuery)
    .skip(startIndex)
    .limit(limit);

  res.status(200)
    .json({
      success: true,
      count: bootcamps.length,
      pagination,
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

  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  await bootcamp.remove();

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
    });
});

/**
 * @desc Upload photo for bootcamp
 * @route PUT api/v1/bootcamps/:id/photo
 * @access Private
 */
const uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcampId = get('params.id', req);

  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${bootcampId}`, 404)
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
      new ErrorResponse(`Please upload an image less then ${process.env.MAX_FILE_UPLOA}`, 400)
    );
  }

  file.name = `photo_${bootcampId}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Error while uploading file`, 500));
    }

    await Bootcamp.findByIdAndUpdate(bootcampId, { photo: file.name });

    res.status(200)
      .json({
        success: true,
        data: file.name
      });
  })
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
