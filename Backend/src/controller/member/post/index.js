import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { sendEmail, generateEmailTemplate } from "../../../services/email.service.js";
import { registerMemberValidation } from "../../../utils/validationSchema.js";

// Register Store Member
export const addStoreMember = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return ApiError(res, 403, "Only Admin Can Add Store Members");
    }

    const { error } = registerMemberValidation.validate(req.body);
    if (error) return ApiError(res, 400, error.details[0].message);

    const { fullname, email, password } = req.body;
    const storeId = req.store.id;



    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true, members: true },
    });

    if (!store) {
      return ApiError(res, 404, "Store not found");
    }

    const userPlan = store.owner.plan || "basic";

    const planLimits = {
      basic: 3,
      standard: 7,
      premium: Infinity, // unlimited
    };

    const memberCount = await prisma.user.count({
      where: {
        memberOfStores: { some: { id: storeId } },
        isDeleted: false,
      },
    });

    if (memberCount >= planLimits[userPlan]) {
      return ApiError(
        res,
        403,
        `Member limit reached for your plan (${userPlan}). Upgrade to add more members.`
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (!existingUser.isDeleted) {
        return ApiError(res, 400, "User With This Email Already Exists");
      } else {
        const restoredUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            fullname,
            password,
            role: "cashier",
            isDeleted: false,
            memberOfStores: {
              connect: { id: storeId },
            },
          },
          select: { id: true, fullname: true, email: true, role: true },
        });

        await sendEmail({
          to: email,
          subject: "🎉 Welcome Back to POS!",
          message: generateEmailTemplate({
            message: `
              <p>Hi <strong>${fullname}</strong>,</p>
              <p>Your account has been re-activated successfully for store <b>${req.store.name}</b>.</p>
              <p><strong>Email:</strong> ${email}<br />
              <strong>Password:</strong> ${password}</p>
            `,
          }),
        });

        return ApiResponse(res, 200, restoredUser, "Store Member Restored & Added Successfully");
      }
    }

    const newMember = await prisma.user.create({
      data: {
        fullname,
        email,
        password,
        role: "cashier",
        memberOfStores: {
          connect: { id: storeId },
        },
      },
      select: { id: true, fullname: true, email: true, role: true },
    });

    await sendEmail({
      to: email,
      subject: "🎉 Welcome to POS!",
      message: generateEmailTemplate({
        message: `
          <p>Hi <strong>${fullname}</strong>,</p>
          <p>Welcome to store <b>${req.store.name}</b>!</p>
          <p>Your account has been successfully created.</p>
          <p><strong>Email:</strong> ${email}<br />
          <strong>Password:</strong> ${password}</p>
          <p>Please keep this information safe.</p>
        `,
      }),
    });

    return ApiResponse(res, 201, newMember, "Store Member Added Successfully");
  } catch (error) {
    console.log("Error in addStoreMember:", error);
    return ApiError(res, 500, "Internal Server Error");
  }
};
