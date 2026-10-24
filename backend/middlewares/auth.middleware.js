const jwt = require('jsonwebtoken');

exports.authMiddleware = async(req,res,next)=>{
    try {
        const {accessToken} = req.cookies;

        if(!accessToken){
            return res.status(401).json({
                success : false,
                message : "session expired login again"
            })
        }
        
        const decode =  jwt.verify(accessToken,process.env.JWT_SECRET);

        if(!decode){
            return res.status(401).json({
                success : false,
                message : "Invalid accessToken"
            })
        }

        req.user = decode;
        next();
    } catch (error) {
        console.log("error in auth middleware : ",error.message);
        res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
}