import {ApiResponse } from "../utils/api-respose.js";
import ApiError, {} from "../utils/ApiError.js"
const  healthcheck = async (req, res) => {
    try {
        res.status(200).json(
            new ApiResponse(200, {message: "Server is running"})
        );
    
    } catch (error) {
    res.status(500).json(
        new ApiError(500, "Internal Server Error", error.message ,error.stack)

    )
        
    }
}


export default healthcheck;
