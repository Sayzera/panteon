
var { expressjwt: jwt } = require("express-jwt");

/**
 * izin verilen yollar 
 */
var unprotected = [
  /\/api\/users\/(login|list|user-detail\/(.*))/,

];


function authJwt() {
  const secret  = process.env.JWT_SECRET;
  return jwt(
    {
      secret,
      algorithms: ['HS256'],
      // özel bir kontrol yapılacaksa .
      
    })
    .unless(
      {
        path:  unprotected
      }
    )
}



module.exports = authJwt;