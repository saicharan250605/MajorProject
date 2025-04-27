const mongoose = require("mongoose");
const reviewModel = require("./reviewsModel");
let newSchema = new mongoose.Schema({
    title:{
        type:String,
        // set :(v)=>{
        //     return v=== "" ? "No title given yet" : v ;
        // },
    },
    description:{
        type:String,
        // default:"Nothing Added yet",
        // set : (v)=>{
        //     return v === "" ? "Nothing Added yet" : v ;
        //  },
    },
    image:{
        url: String,
        filename: String,
    },
    price:{
        type:Number,
        // default:0,
        // set : (v)=>{
        //     return v === "" ? 0 : v ;
        //  },
    },
    location:{
        type:String,
        // default:"Not Provided yet",
        // set : (v)=>{
        //     return v === "" ? "Not Provided yet" : v ;
        //  },
    },
    country:{
        type:String,
        // default:"Not Provided yet",
        // set : (v)=>{
        //     return v === "" ? "Not Provided yet" : v ;
        //  },
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Review",
    }],
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
});
newSchema.post("findOneAndDelete",async(listItem)=>{
    if(listItem.reviews.length){
        await reviewModel.deleteMany({_id:{$in:listItem.reviews}});
    }
});

let newModel = mongoose.model("lists",newSchema);
module.exports=newModel;