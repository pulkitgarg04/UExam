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

const generateVerificationEmailHTML = (
  userName: string,
  verificationLink: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - uexam</title>
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
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
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
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
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
        .security-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
            font-size: 14px;
        }
        .features {
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        .feature {
            text-align: center;
            flex: 1;
            min-width: 150px;
            margin: 10px;
        }
        .feature-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
        }
        .feature-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
        }
        .feature-desc {
            color: #6b7280;
            font-size: 12px;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .features {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Verify Your Email Address</h1>
            <p class="subtitle">Complete your account setup to get started</p>
        </div>

        <div class="content">
            <p class="greeting">Hello ${userName},</p>
            
            <p class="message">
                Welcome to <strong>UExam</strong>! We're excited to have you join our community of educators and students. 
                To ensure the security of your account and enable all features, please verify your email address by clicking the button below.
            </p>

            <div style="text-align: center;">
                <a href="${verificationLink}" class="cta-button" style="color: white">
                    Verify Email Address
                </a>
            </div>

            <div class="security-note">
                <strong>🔒 Security Note:</strong> This verification link will expire in 24 hours for your security. 
                If you didn't create an account with uexam, please ignore this email.
            </div>

            <p class="message">
                If the button above doesn't work, you can copy and paste the following link into your browser:
            </p>
            
            <div class="alternative-link">
                ${verificationLink}
            </div>

            <p class="message">
                Once verified, you'll have access to all uexam features including test creation, student management, 
                real-time proctoring, and comprehensive analytics.
            </p>
        </div>

        <div class="footer">
            <p>
                <strong>UExam</strong> - Test Management Platform<br>
                This email was sent to ${userName} because you created an account on uexam.<br>
                If you have any questions, contact us at <a href="mailto:support@uexam.com" style="color: #3b82f6;">project.pulkitgarg@gmail.com</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                © 2025 UExam. All rights reserved.<br>
                <a href="#" style="color: #6b7280;">Privacy Policy</a> | 
                <a href="#" style="color: #6b7280;">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const now = new Date();
    let verificationToken = await prisma.verificationToken.findFirst({
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

    if (!verificationToken) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      verificationToken = await prisma.verificationToken.create({
        data: {
          email,
          token,
          expires: expiresAt,
        },
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/auth/verify-email?token=${
      verificationToken.token
    }&email=${encodeURIComponent(email)}`;

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "Pulkit Garg",
        address: process.env.SMTP_USER || "project.pulkitgarg@gmail.com",
      },
      to: email,
      subject: "Verify Your Email Address - Welcome to UExam!",
      html: generateVerificationEmailHTML(name, verificationLink),
      text: `
Hello ${name},

Welcome to UExam! Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours for security reasons.

If you didn't create an account with uexam, please ignore this email.

Best regards,
Pulkit Garg

---
UExam - Test Management Platform
Support: project.pulkitgarg@gmail.com
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "Verification email sent successfully",
      expiresAt: verificationToken.expires.toISOString(),
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
