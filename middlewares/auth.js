const jwt = require("jsonwebtoken");
const auth = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    const decode = jwt.verify(token, process.env.SECRET_TOKEN);
    if (decode) {
      req.user = decode;
      next();
    } else {
      res.status(401).json("Vous n'etes pas autorisé");
    }
  } catch (error) {
    res.status(401).json(error);
  }
};

module.exports = auth;
