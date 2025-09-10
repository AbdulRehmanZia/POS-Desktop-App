import jwt from "jsonwebtoken";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";

export const SuperAdminLogin =(req , res)=>{
    
    const { email, password } = req.body;
     if (!email || !password) {
    return ApiError(res, 400, "Please Enter Both Email and Password");
  }
  if (
    email !== process.env.SUPER_ADMIN_EMAIL ||
    password !== process.env.SUPER_ADMIN_PASSWORD
  ) {
    return ApiError(res, 400, "Invalid Super Admin credentials");
  }
  const payload = {
    sais: false,
  };

  const token = jwt.sign(payload, process.env.SA_SECRET);

  ApiResponse(res, 200, token, "Super Admin login Successfuly");
};