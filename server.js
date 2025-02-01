// const express = require("express");
// const nodemailer = require("nodemailer");
// const cors = require("cors");
// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Store OTPs temporarily (for 5 minutes)
// let otpStore = {};

// // Create a transporter object using SMTP transport (using Gmail as an example)
// const transporter = nodemailer.createTransport({
//   service: "gmail", // Use your preferred email service
//   auth: {
//     user: "cshehjal@gmail.com", // Hardcoded email address
//     pass: "qpus vpyu qjry enhw", // Hardcoded email password or app password
//   },
// });

// // Endpoint for sending OTP
// app.post("/send-otp", async (req, res) => {
//   const { email } = req.body; // Get the email from the request body

//   if (!email) {
//     return res.status(400).json({ success: false, message: "Email is required" });
//   }

//   // Generate OTP
//   const otpCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
//   otpStore[email] = { otp: otpCode, expires: Date.now() + 5 * 60 * 1000 }; // Store OTP with expiry of 5 minutes

//   // Mail options
//   const mailOptions = {
//     from: "cshehjal@gmail.com", // Sender address (your email)
//     to: email, // Recipient's email
//     subject: "Your OTP Code", // Subject of the email
//     text: `Your OTP code is: ${otpCode}`, // OTP in the email body
//     html: `
//     <div style="font-family: Arial, sans-serif; border: 1px solid #ccc; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9;">
//         <p>Dear User</p>
//         <p>We received a request to log in to your account using a One-Time Passcode (OTP). Please use the OTP below to proceed:</p>
//         <h2 style="text-align: center; color: #4CAF50;">${otpCode}</h2>
//         <p>Thank you</p>
//         <p style="font-size: 12px; color: #888;">Disclaimer: This email and its contents are intended only for the recipient. Please do not share this OTP with anyone.</p>
//       </div>
//     `,
//   };

//   try {
//     // Send the email
//     await transporter.sendMail(mailOptions);
//     console.log(`OTP sent to ${email}`);
//     res.status(200).json({ success: true, message: "OTP sent successfully." });
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Backend: Verify OTP with expiry check
// app.post("/verify-otp", (req, res) => {
//     const { email, otp } = req.body;
  
//     if (!email || !otp) {
//       return res.status(400).json({ success: false, message: "Email and OTP are required" });
//     }
  
//     const storedOtp = otpStore[email];
  
//     if (!storedOtp) {
//       return res.status(404).json({ success: false, message: "OTP not found. Please request a new OTP." });
//     }
  
//     // Check if OTP is expired
//     if (storedOtp.expires < Date.now()) {
//       return res.status(400).json({ success: false, message: "OTP has expired. Please request a new OTP." });
//     }
  
//     // Validate OTP
//     if (storedOtp.otp === parseInt(otp)) {
//       return res.status(200).json({ success: true, message: "OTP verified successfully." });
//     } else {
//       return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
//     }
//   });
  
// // Start the server
// const PORT = 8080;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require('dotenv').config();  // Load environment variables from .env file
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Store OTPs temporarily (for 5 minutes)
let otpStore = {};

// Create a transporter object using environment variables for SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,  // Use SMTP host from .env
  port: process.env.SMTP_PORT,  // Use SMTP port from .env
  secure: false,                // false for TLS, true for SSL
  auth: {
    user: process.env.EMAIL_USER,  // Sender email from .env
    pass: process.env.EMAIL_PASS,  // Sender app password from .env
  },
});

// Endpoint for sending OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;  // Get the email from the request body

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  // Generate OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  otpStore[email] = { otp: otpCode, expires: Date.now() + 5 * 60 * 1000 }; // Store OTP with expiry of 5 minutes

  // Mail options
  const mailOptions = {
    from: process.env.EMAIL_USER,  // Sender address from .env
    to: email,                    // Recipient's email
    subject: "Your OTP Code",     // Subject of the email
    text: `Your OTP code is: ${otpCode}`,  // Plain text version
    html: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #ccc; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9;">
          <p>Dear User,</p>
          <p>We received a request to log in to your account using a One-Time Passcode (OTP). Please use the OTP below to proceed:</p>
          <h2 style="text-align: center; color: #4CAF50;">${otpCode}</h2>
          <p style="font-size: 16px;">Thank you</p>
          <p style="font-size: 12px; color: #888;">Disclaimer: This email and its contents are intended only for the recipient. Please do not share this OTP with anyone.</p>
      </div>
    `,  // HTML version
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Backend: Verify OTP with expiry check
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const storedOtp = otpStore[email];

  if (!storedOtp) {
    return res.status(404).json({ success: false, message: "OTP not found. Please request a new OTP." });
  }

  // Check if OTP is expired
  if (storedOtp.expires < Date.now()) {
    delete otpStore[email];  // Delete expired OTP
    return res.status(400).json({ success: false, message: "OTP has expired. Please request a new OTP." });
  }

  // Validate OTP
  if (storedOtp.otp === parseInt(otp)) {
    return res.status(200).json({ success: true, message: "OTP verified successfully." });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;  // Use port from environment variable or default to 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
