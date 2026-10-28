const User = require("../models/User");

//controller for creating post 
const createPostController = async(req,res)=>{
    try{
        const {description , coverImage} = req.body;

        if(!description || !coverImage){
            return res.status(401).json({
                success : false,
                message : "fill all the details "
            })
        }

    }catch(err){
        res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
}
