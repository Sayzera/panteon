function errorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    // Jwt authentication
    return res
      .status(401)
      .json({ message: 'Kullanıcının giriş izni yok', success: 0 });
  }

  return res.status(500).json({ message: err, success: 0 });
}

module.exports = errorHandler;
