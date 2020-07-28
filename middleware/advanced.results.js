const { pipe, get, omitAll, defaultTo } = require('lodash/fp');

const { buildQuery, buildSelectOrSortQuery } = require('../utils/query.utils');

const advancedResultsMiddleware = (model, populate) => async (req, res, next) => {
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Get request query and remove fields with specific purposes
  const reqQuery = pipe(
    get('query'),
    (it) => ({ ...it }),
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
    (it) => parseInt(it, 10),
    defaultTo(1)
  )(req);

  const limit = pipe(
    get('query.limit'),
    (it) => parseInt(it, 10),
    defaultTo(25)
  )(req);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

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

  const documents = await model
    .find({ ...buildQuery(reqQuery) })
    .populate(populate)
    .select(selectQuery)
    .sort(sortQuery)
    .skip(startIndex)
    .limit(limit);

  res.advancedResults = {
    success: true,
    count: documents.length,
    pagination,
    data: documents
  };

  next();
};

module.exports = advancedResultsMiddleware;
