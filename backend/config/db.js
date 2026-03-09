import mongoose  from "mongoose";
const connectDb = async ()=>{
try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("database connected ")

} catch (error) {
    console.log("error in connecting to database")
}
}
export default connectDb;