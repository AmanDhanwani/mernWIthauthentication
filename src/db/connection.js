const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/register").then(()=>{
    console.log("connected to the database successfully");
}).catch((e)=>{
    console.log("connected has not done "+ e);
});
