const { pipe, replace, join, split } = require('lodash/fp');

const buildQuery = pipe(
  it => JSON.stringify(it),
  replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`),
  it => JSON.parse(it)
);

const buildSelectOrSortQuery = (inputQuery) => {
  if (!inputQuery) return null;

  return pipe(
    split(','),
    join(' ')
  )(inputQuery);
};

module.exports = {
  buildQuery,
  buildSelectOrSortQuery
};
