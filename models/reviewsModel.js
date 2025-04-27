const mongoose = require("mongoose");

let reviewSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    rating:{
        type:Number,
        min:1,
        max:5,
    },
    comment:{
        type:String,
    },
    time:{
        type:Date,
        default: new Date(Date.now()),
    }
});
let Review = mongoose.model("Review",reviewSchema);

module.exports = Review;