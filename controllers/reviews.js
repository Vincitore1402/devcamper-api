const { get } = require('lodash/fp');

const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

const { getUserId, getRole } = require('../utils/auth.utils');
const ErrorResponse = require('../utils/error-response');
const asyncHandler = require('../middleware/async');

/**
 *  @desc Get reviews
    @route GET /api/v1/reviews
    @route GET /api/v1/bootcamps/:bootcampId/reviews
    @access Public
 */
const getReviews = asyncHandler(async (req, res) => {
  const bootcampId = get('params.bootcampId', req);

  if (bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res
      .status(200)
      .json({
        success: true,
        count: reviews.length,
        data: reviews
      });
  }

  return res
    .status(200)
    .json(res.advancedResults);
});

/**
 *  @desc Get single review
    @route GET /api/v1/reviews/:id
    @access Public
 */
const getReview = asyncHandler(async (req, res, next) => {
  const reviewId = get('params.id', req);

  const review = await Review
    .findOne({ _id: reviewId })
    .populate({
      path: 'bootcamp',
      select: 'name description'
    });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${reviewId}`, 404)
    );
  }

  return res
    .status(200)
    .json({
      success: true,
      data: review
    });
});

/**
 *  @desc Add review
    @route POST /api/v1/bootcamps/:bootcampId/reviews
    @access Private
 */
const addReview = asyncHandler(async (req, res, next) => {
  const bootcampId = get('params.bootcampId', req);

  const bootcamp = await Bootcamp.findOne({ _id: bootcampId });

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${bootcampId}`,
        404
      )
    );
  }

  const review = await Review.create({
    ...req.body,
    bootcamp: bootcampId,
    user: getUserId(req)
  });

  return res
    .status(201)
    .json({
      success: true,
      data: review
    });
});

/**
 *  @desc Update review
    @route PUT /api/v1/reviews/:id
    @access Private
 */
const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findOne({ _id: req.params.id });

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  if (review.user.toString() !== getUserId(req) && getRole(req) !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to update review', 401)
    );
  }

  review = await Review.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  await review.save();

  return res
    .status(200)
    .json({
      success: true,
      data: review
    });
});

/**
 *  @desc Delete review
    @route DELETE /api/v1/reviews/:id
    @access Private
 */
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ _id: req.params.id });

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  if (review.user.toString() !== getUserId(req) && getRole(req) !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to update review', 401)
    );
  }

  await review.remove();

  return res
    .status(200)
    .json({
      success: true,
      data: {}
    });
});

module.exports = {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
};
