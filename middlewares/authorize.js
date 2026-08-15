const AppError = require("../utils/AppError");

const authorization = (...allowedRoles) => {
   return (req , res , next) => {
    try {
        if(!req.user) 
          throw new AppError(
            "authontication required" ,
            401
        );
        if (!allowedRoles.includes(req.user.role))
            throw new AppError(
             "Access denied " ,
             403
            )
       next() ;
    } catch (error) {
        next(error)
    }

   }
}

module.exports = authorization;