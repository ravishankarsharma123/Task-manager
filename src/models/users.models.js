import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    avatar: {
        type: {
            url: String,
            localpath: String,
        },
        default: {
            url: `https://placehold.co/150x150?text=Icon&font=roboto`,
            localpath: "",
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    forgotPasswordToken: {
        type: String,
        default: null,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
        default: null,
    }, 
    refreshToken: {
        type: String,
        default: null,
    },
    emailVerificationToken: {
        type: String,
        default: null,
    },
    emailVerificationTokenExpiry: {
        type: Date,
        default: null,
    },



       

},{ timestamps: true });


userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
    
});

userSchema.methods.isPasswordMatched = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.genrateAccessToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            isAdmin: this.isAdmin,

        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    )
};

userSchema.methods.genrateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.COOKIE_SECRET,
        {
            expiresIn: process.env.COOKIE_EXPIRES_IN,
        }
    )
};


userSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
    const expiry = Date.now() + 20 * (60 * 1000); // 20 minutes
     
    return {
        unHashedToken, //for sending email
        hashedToken,   //for saving in db
        expiry,        //for saving in db
    };
}

export const User = mongoose.model("User", userSchema)