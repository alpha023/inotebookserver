const mongoose=require('mongoose');

mongoose.set('strictQuery',false);

//const mongoURI=process.env.MONGO_URL;
//const mongoURI='mongodb+srv://dbinotebook:dbinotebook@cluster0.og6xdrl.mongodb.net/?retryWrites=true&w=majority'
const mongoURI="mongodb://0.0.0.0:27017";


const connectToMongo=()=>{

    mongoose.connect(mongoURI,()=>{
        // console.log("mongo connected successfully");
    })

};

module.exports=connectToMongo;
