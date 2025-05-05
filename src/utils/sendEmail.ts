import nodemailer from "nodemailer";

export const sendVerificationEmail = async (
  email: string,
  token: string,
  cardType?: string,
  cardId?: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}${
      cardType && cardId ? `&cardType=${cardType}&cardId=${cardId}` : ""
    }`;

    console.log("email", email, link);
    console.log("card type and id", cardType, cardId);

    await transporter.sendMail({
      from: `"SignIn" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #3a0d4e; padding: 40px 30px; border-radius: 12px; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15); color: white;">
  
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px; color: #ffffff;">🔐 Email Verification</h1>
    <p style="font-size: 16px; color: #ccc; margin-top: 10px;">Secure your account in one click</p>
  </div>

  <p style="font-size: 16px; line-height: 1.6; color: #f1f1f1;">
    Hello! 👋 <br/>
    You're almost there. Just confirm your email by clicking the button below to activate your account.
  </p>

  <div style="text-align: center; margin: 35px 0;">
    <a href="${link}" style="background-color: #016630; color: #fff; padding: 16px 28px; font-size: 16px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); transition: background 0.3s;">
       Verify My Email
    </a>
  </div>

  <p style="font-size: 14px; color: #bbb; text-align: center;">
    Didn't request this? No worries — just ignore this message.
  </p>

  <hr style="border: none; border-top: 1px solid #555; margin: 40px 0;" />

  <p style="font-size: 12px; color: #888; text-align: center;">
    © 2025 SignIn. All rights reserved.
  </p>
</div>


      `,
    });

    console.log("✅ Verification email sent.");
  } catch (err) {
    console.error("❌ Failed to send verification email:", err);
    throw new Error("Failed to send verification email");
  }
};
