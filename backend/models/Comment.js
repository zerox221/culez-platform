const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment : {
        type : String,
        require : true
    },
    commentBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    post : {
         type : mongoose.Schema.Types.ObjectId,
        ref : "Post"
    }
})

module.exports = mongoose.model("Comment",commentSchema);