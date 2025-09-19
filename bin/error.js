const error = (res, status, message, err = null) => {
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(status).json({
    response: 'ERROR',
    message : message ,
    err
  });
};

module.exports = error;