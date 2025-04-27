let {data} = require("./data");
const model = require("../models/model");
const mongoose = require("mongoose");
async function hell(){
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}
hell().then(()=>{
    console.log("connection established successfully with airbnb");
});

data = data.map((obj)=>{
    return {...obj,owner:"67ebda2bcc4c2be6bea51748"};
});

model.insertMany(data).then((res)=>{
    console.log(res);
}).catch((err)=>{
    console.log(err);
})

// const express= require("express");
// const app=express();`
// app.listen(8000,()=>{
//     console.log(data);
// });