import prisma from "../../../db/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../services/jwt.service.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { loginValidation } from "../../../utils/validationSchema.js";
import bcrypt from "bcrypt"

//Login User
export const loginUser = async (req, res) => {
  try {
    const { error } = loginValidation.validate(req.body);
    if (error) return ApiError(res, 400, error.details[0].message);

    const { email, password } = req.body;
    if (!email && !password) {
      return ApiError(res, 400, "Please Enter Both Email and Password");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return ApiError(res, 404, "User Does Not Exist");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return ApiError(res, 401, "In-valid Credentials");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const loggedInUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullname: true,
        email: true,
        role:true
      },
    });

    if (!loggedInUser)
      return ApiError(res, 500, "Something Went Wrong While Logging The User");

    const options = {
      // httpOnly: true,
      secure: true,
       maxAge: 7 * 24 * 60 * 60 * 1000 
    };

    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);
    return ApiResponse(
      res,
      201,
      { user: loggedInUser, accessToken, refreshToken },
      "User Logged In Successfully"
    );
  } catch (error) {
    console.error("Error in loginUser:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};
