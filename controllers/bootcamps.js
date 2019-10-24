/**
 * @desc Get all bootcamps
 * @route GET api/v1/bootcamps
 * @access Public
 */
const getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps' });
};

/**
 * @desc Get single bootcamps
 * @route GET api/v1/bootcamps/:id
 * @access Public
 */
const getBootCamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Show bootcamp ${req.params.id}` });
};

/**
 * @desc Create new bootcamps
 * @route POST api/v1/bootcamps
 * @access Private
 */
const createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Create new bootcamp' });
};

/**
 * @desc Update bootcamps
 * @route PUT api/v1/bootcamps/:id
 * @access Private
 */
const updateBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

/**
 * @desc Delete bootcamps
 * @route DELETE api/v1/bootcamps/:id
 * @access Private
 */
const deleteBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};

module.exports = {
  getBootcamps,
  getBootCamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp
};
