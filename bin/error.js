const error = (res, status, message, err = null) => {
  return res.status(status).json({
    response: 'ERROR',
    message : message ,
    err
  });
};

module.exports = error;