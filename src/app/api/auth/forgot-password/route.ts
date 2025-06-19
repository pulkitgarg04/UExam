import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
};

const generatePasswordResetEmailHTML = (resetLink: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - uexam</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444, #f97316);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .title {
            color: #1f2937;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
        }
        .content {
            margin: 30px 0;
        }
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        .message {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444, #f97316);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-1px);
        }
        .alternative-link {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
            color: #374151;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Reset Your Password</h1>
            <p class="subtitle">Secure password reset request</p>
        </div>

        <div class="content">
            <p class="greeting">Hello There,</p>
            
            <p class="message">
                We received a request to reset the password for your <strong>UExam</strong> account. 
                If you made this request, click the button below to create a new password.
            </p>

            <div style="text-align: center;">
                <a href="${resetLink}" class="cta-button" style="color: white">
                    Reset Password
                </a>
            </div>

            <p class="message">
                If the button above doesn't work, you can copy and paste the following link into your browser:
            </p>
            
            <div class="alternative-link">
                ${resetLink}
            </div>
        </div>

        <div class="footer">
            <p>
                <strong>Pulkit Garg</strong><br>
                If you didn't request a password reset, please ignore this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "An account with this email doesn't exist. Kindly check your email.",
        },
        { status: 200 }
      );
    }

    const now = new Date();
        let passwordResetToken = await prisma.passwordResetToken.findFirst({
          where: {
            email,
            expires: {
              gt: now,
            },
          },
          orderBy: {
            expires: "desc",
          },
        });
    
        if (!passwordResetToken) {
          const token = crypto.randomBytes(32).toString("hex");
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
          passwordResetToken = await prisma.passwordResetToken.create({
            data: {
              email,
              token,
              expires: expiresAt,
            },
          });
        }
    

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?token=${passwordResetToken.token}&email=${encodeURIComponent(
      email
    )}`;

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "Pulkit Garg",
        address: process.env.SMTP_USER || "project.pulkitgarg@gmail.com",
      },
      to: email,
      subject: "Reset Your Password - UExam",
      html: generatePasswordResetEmailHTML(resetLink),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "Password reset email sent successfully",
      expiresAt: passwordResetToken.expires.toISOString(),
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
