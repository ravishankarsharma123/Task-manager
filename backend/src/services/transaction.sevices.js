import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";



const withTransactionSession = async (serviceFunction) =>{
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const result = await serviceFunction(session);
        await session.commitTransaction();
        session.endSession();
        return result;

                
    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        throw new ApiError(500, "problem with transaction service please try again and check", error.message)
        
    } finally {
        session.endSession();
    }
}

export {withTransactionSession};