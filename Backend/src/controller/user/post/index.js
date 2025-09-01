import prisma from "../../../db/db.js";
import { generateEmailTemplate, sendEmail } from "../../../services/email.service.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {registerValidation } from "../../../utils/validationSchema.js";


//Create User
export const registerUser = async (req, res) => {
  try {
    const { error } = registerValidation.validate(req.body);
    if (error) return ApiError(res, 400, error.details[0].message);

    const { fullname, email, password,plan } = req.body;
    const findUser = await prisma.user.findUnique({
      where: { email },
    });

    if (findUser)
      return ApiError(res, 400, "User With This Email Already Exists");

    const newUser = await prisma.user.create({
      data: { fullname, email, password, role: "admin", plan },
    });

    const createdUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      select: { id: true, fullname: true, email: true, role: true },
    });

    if (!createdUser)
      return ApiError(
        res,
        500,
        "Something Went Wrong While Registering The User"
      );
    console.log("Calling sendEmail...");

    await sendEmail({
      to: email,
      subject: "🎉 Welcome to POS!",
      message: generateEmailTemplate({
        message: `
         <p>Hi <strong>${fullname}</strong>,</p>
         <p>Welcome to our POS system! Your account has been successfully created.</p>
         <p><strong>Email:</strong> ${email}<br />
         <strong>Password:</strong> ${password}</p>
         <p>Please keep this information safe.</p>
       `,
      }),
    });

    return ApiResponse(res, 201, createdUser, "User Created Successfully");
  } catch (error) {
    console.error("Error in registerUser:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};
