import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,

    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

        const info = await transporter.sendMail({
          from: '"Prisma Blog" <prismablog@test.com>',
          to: user.email,
          subject: "Verify Your Email Address",
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Email Verification</title>
          </head>
          <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
          <tr>
          <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
          <td style="background:#2563eb;padding:30px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:30px;">
          Prisma Blog
          </h1>
          </td>
          </tr>

          <!-- Body -->
          <tr>
          <td style="padding:40px;">

          <h2 style="margin-top:0;color:#111827;">
          Verify Your Email Address
          </h2>

          <p style="color:#4b5563;font-size:16px;line-height:1.7;">
          Thanks for signing up for <strong>Prisma Blog</strong>!
          </p>

          <p style="color:#4b5563;font-size:16px;line-height:1.7;">
          Please verify your email address by clicking the button below.
          This link will expire in <strong>15 minutes</strong>.
          </p>

          <div style="text-align:center;margin:40px 0;">
          <a
          href="${verificationUrl}"
          style="
          display:inline-block;
          background:#2563eb;
          color:#ffffff;
          padding:16px 32px;
          text-decoration:none;
          font-size:16px;
          font-weight:bold;
          border-radius:8px;
          ">
          Verify Email
          </a>
          </div>

          <p style="color:#6b7280;font-size:14px;line-height:1.7;">
          If the button doesn't work, copy and paste the following URL into your browser:
          </p>

          <p style="word-break:break-all;font-size:14px;color:#2563eb;">
          ${verificationUrl}
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:35px 0;" />

          <p style="color:#9ca3af;font-size:14px;">
          If you didn't create an account, you can safely ignore this email.
          </p>

          </td>
          </tr>

          <!-- Footer -->
          <tr>
          <td style="background:#f9fafb;padding:25px;text-align:center;">
          <p style="margin:0;color:#6b7280;font-size:13px;">
          © ${new Date().getFullYear()} Prisma Blog. All rights reserved.
          </p>

          <p style="margin-top:10px;color:#9ca3af;font-size:12px;">
          This is an automated email. Please do not reply.
          </p>
          </td>
          </tr>

          </table>

          </td>
          </tr>
          </table>

          </body>
          </html>
          `,
        });

        console.log("Message sent: %s", info.messageId);
      } catch (error: any) {
        console.error(error);
        throw new Error(error);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
