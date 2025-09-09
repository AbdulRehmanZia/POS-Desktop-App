// import nodemailer from "nodemailer";


// const transporter = nodemailer.createTransport({
//   //host: "smtp.gmail.com",
//   service:"gmail",
//  // port: 465,
//  // secure: true,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASSWORD,
//   },
// });

// export const sendEmail = async (to, subject, message) => {
//   try {
//     // console.log("MAIL_USER:", process.env.MAIL_USER);
//     // console.log("MAIL_PASS:", process.env.MAIL_PASSWORD ? "Loaded" : "Missing");

//     const info = await transporter.sendMail({
//       from: `"POS Bootcamp" <${process.env.MAIL_USER}>`,
//       to,
//       subject,
//       html: message,
//     });
//     console.log("Email Sent: ", info.response);
//     return info
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// };


import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});
export const generateEmailTemplate = ({ message }) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>POS Notification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #2563eb; padding: 30px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 24px;">POS Notification</h1>
                  <p style="margin: 4px 0 0; font-size: 14px;">Your trusted business system</p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 40px 30px; font-size: 16px; line-height: 1.6;">
                  ${message}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; background-color: #f9fafb; text-align: center; font-size: 12px; color: #888888;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} POS System. All rights reserved.</p>
                  <p style="margin: 5px 0 0;">
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Unsubscribe</a> |
                    <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};


export const sendEmail = async ({ to, subject, message }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: message, // we use `html` for rich formatting
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("📨 Email sent:", result.response);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw new Error("Failed to send email");
  }
};
