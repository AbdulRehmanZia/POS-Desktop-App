import prisma from "../../../db/db.js";
import {
  generateEmailTemplate,
  sendEmail,
} from "../../../services/email.service.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return ApiError(res, 400, "Please Enter Email");
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return ApiError(res, 404, "User Not Found");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 1000 * 60 * 10);

    await prisma.user.update({
      where: { email },
      data: { resetToken: otp, resetTokenExpiry: expiry },
    });

    await sendEmail({
      to: email,
      subject: "Your Password Reset OTP",
      message: generateEmailTemplate({
        message: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2BAE66FF;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password. Use the following One-Time Password (OTP) to proceed:</p>
        <p style="font-size: 24px; font-weight: bold; color: #2BAE66FF;">${otp}</p>
        <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <br />
        <p>Regards,<br />Your App Team</p>
      </div>
    `,
      }),
    });
    console.log("Generated OTP:", otp);
    return ApiResponse(res, 200, null, "OTP Sent Successfully");
  } catch (error) {
    console.error("Error in forgetPassword");
    return ApiError(res, 500, "Internal Server Error");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return ApiError(res, 400, "All Fields Are Required");
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      user.resetToken !== otp ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < new Date()
    ) {
      return ApiError(res, 400, "Invalid or expired OTP");
    }
    await prisma.user.update({
      where: { email },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return ApiResponse(res, 200, null, "Password reset successful");
  } catch (error) {
    console.error("Error In resetPassword");
    return ApiError(res, 500, "Internal Server Error");
  }
};
