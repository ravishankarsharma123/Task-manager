import { asyncHandler } from "../utils/async-handler.js";
const registerUser = asyncHandler(async (req, res) => {
    const {email, username, password, role} = res.body;
    // validation
    if (!email || !username || !password || !role) {

    }
})

export {registerUser}