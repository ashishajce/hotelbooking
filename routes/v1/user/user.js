const express = require('express');
const bcrypt = require('bcrypt');

const token = require('../../../models/token');
const otpModel = require('../../../models/otp');
const emailSend = require('../../../controllers/email');
const userModel = require('../../../models/login');
const category = require('../../../models/category');
const bookingModel = require('../../../models/booking');


const isuser=require('../../../controllers/middleware').isuser;
const jwt = require('jsonwebtoken');

const emailsend=require('../../../controllers/email');

const router = express.Router();

// Register
router.post('/v1/user/register', async (req, res) => {
    try {
        const { name, phonenumber, email, password, role } = req.body;

        // Input validation
        if (!name || typeof name !== 'string' || name.trim().length < 2)
            return res.status(400).json({ status: false, message: "Please enter a valid name" });

        if (!phonenumber || typeof phonenumber !== 'number' || phonenumber.length < 10)
            return res.status(400).json({ status: false, message: "Please enter a valid phone number" });

        if (!email || typeof email !== 'string' || !email.includes('@'))
            return res.status(400).json({ status: false, message: "Please enter a valid email" });

        if (!password || typeof password !== 'string' || password.length < 6)
            return res.status(400).json({ status: false, message: "Please enter a valid password with at least 6 characters" });

        if (!role || (role !== 'admin' && role !== 'user'))
            return res.status(400).json({ status: false, message: "Please select a valid role" });

        const existingUser = await userModel.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        // Remove any existing OTPs for the email
        await otpModel.deleteMany({ email });

        if (!existingUser) {
            // Create a new user
            const newUser = new userModel({
                name,
                phonenumber,
                email,
                password: hashedPassword,
                role,
                status: false
            });
            await newUser.save();
        } else {
            // Update existing user
            await userModel.updateOne(
                { email },
                {
                    $set: {
                        name,
                        phonenumber,
                        password: hashedPassword,
                        role
                    }
                },
                { upsert: true }
            );
        }

        const savedUser = await userModel.findOne({ email });

        // Save OTP
        const newOtp = new otpModel({
            loginid: savedUser._id,
            email,
            otp: otpCode,
            expireat: expiresAt
        });
        await newOtp.save();
        // Send OTP email
        await emailSend.sendTestEmail(email, 'Your OTP Code', `Your OTP code is: ${otpCode}`);
        return res.status(200).json({
            status: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// Login
router.post('/v1/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !email.includes('@'))
            return res.status(400).json({ status: false, message: "Please enter a valid email" });

        if (!password || password.length < 6)
            return res.status(400).json({ status: false, message: "Please enter a valid password with at least 6 characters" });

        const user = await userModel.findOne({ email });
        if (!user)
            return res.status(404).json({ status: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ status: false, message: "Incorrect password" });

        // Generate JWT token
        const tokenModel = jwt.sign({ id: user._id }, 'mysecretkey123', { expiresIn: '1h' });


        // Save token in the database (optional, if you want to track tokens)
        const newToken = new token({
            loginid: user._id,
            token: tokenModel,
        });

        await newToken.save();


        res.status(200).json({
            status: true,
            message: "Login successful",
            token, // Include the token in the response
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
                phonenumber: user.phonenumber,
                token: tokenModel // Include the token in the user object
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});
// Logout
router.post('/v1/user/logout', async (req, res) => {
    try {
        const tokenValue = req.headers["token"];
        if (!tokenValue)
            return res.status(400).json({ status: false, message: "Token is required" });

        await token.deleteOne({ token: tokenValue });

        res.status(200).json({
            status: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// Send Email
router.post('/v1/user/sendmail', async (req, res) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body)
        return res.status(400).json({ status: false, message: "Please provide all required fields" });

    try {
        await emailSend.sendTestEmail(to, subject, body);
        res.status(200).json({ status: true, message: "Email sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// Check Existing User
router.post('/v1/user/existinguser', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@'))
        return res.status(400).json({ status: false, message: "Please enter a valid email" });

    try {
        const userExists = await existingUserController.checkUserExists(email);
        if (userExists) {
            res.status(200).json({
                status: true,
                message: "User exists",
                user: userExists
            });
        } else {
            res.status(404).json({ status: false, message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// Verify OTP
router.post("/v1/user/verifyotp/:otp", async (req, res) => {
    try {
        const userOtp = req.params.otp;
        const { email } = req.body;

        if (!email || !userOtp)
            return res.status(400).json({ status: false, message: "Email and OTP are required" });

        const verifyOtp = await otpModel.findOne({ email });
        if (!verifyOtp)
            return res.status(404).json({ status: false, message: "OTP not found" });

        if (verifyOtp.expireat < new Date())
            return res.status(400).json({ status: false, message: "OTP has expired" });

        if (verifyOtp.otp === userOtp) {
            await userModel.updateOne({ email }, { $set: { status: true } });

            const verifiedUser = await userModel.findOne({ _id: verifyOtp.loginid });
            await emailSend.sendTestEmail(email, 'OTP Verification Successful', `Your OTP has been verified successfully.`);

            return res.status(200).json({
                status: true,
                message: "OTP verified successfully",
                user: verifiedUser
            });
        } else {
            return res.status(400).json({ status: false, message: "Invalid OTP" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});



router.post('/user/bookroom', isuser, async (req, res) => {
    try {
        const userid = req.user._id;
        const categoryid = req.query.categoryid;
        const { noofrooms, checkin, checkout } = req.body;
        console.log("Request Body:", req.body);

        // Validate required fields
        if (!categoryid || !noofrooms || !checkin || !checkout) {
            return res.status(400).json({ status: false, message: "Please provide all required fields" });
        }

        // Fetch category details
        const category1 = await category.findOne({ _id: categoryid });
        if (!category1) {
            return res.status(404).json({ status: false, message: "Category not found" });
        }

        const checkoutDate = new Date(checkout);
        const checkinDate = new Date(checkin);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        checkinDate.setHours(0, 0, 0, 0);
        checkoutDate.setHours(0, 0, 0, 0);

        // Validate date formats
        if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
            return res.status(400).json({ status: false, message: "Invalid date format" });
        }

        // Validate check-in and check-out dates
        if (checkinDate < today || checkoutDate <= checkinDate) {
            return res.status(400).json({ status: false, message: "Invalid check-in or check-out date" });
        }

        // Check if check-in date is within 3 days from today
        const maxCheckinDate = new Date();
        maxCheckinDate.setDate(today.getDate() + 3);

        if (checkinDate > maxCheckinDate) {
            return res.status(400).json({
                status: false,
                message: "Check-in date must be within 3 days from today"
            });
        }

        console.log(category1.isavailable, noofrooms);

        // Check if enough rooms are available
        if (category1.isavailable < noofrooms) {
            return res.status(400).json({ status: false, message: "Not enough rooms available" });
        }

        // Check if rooms are available for the selected date
        const bookingsCount = await bookingModel.countDocuments({
            checkindate: {
                $gte: checkinDate,
                $lt: new Date(checkinDate.getTime() + 24 * 60 * 60 * 1000) // next day
            }
        });

        if (bookingsCount >= 15) {
            return res.status(400).json({ status: false, message: "No rooms available for the selected date" });
        }

        // Update room availability
        category1.isavailable -= noofrooms;
        await category1.save();

        // Calculate total amount
        const totalamount = noofrooms * category1.price;

        // Create a new booking
        const booking = new bookingModel({
            userid,
            categoryid,
            noofrooms,
            checkindate: checkinDate,
            checkoutdate: checkoutDate,
            totalamount
        });

        await booking.save();

        // Fetch user's email (assuming it's stored in req.user)
        const userEmail = req.user.email;

        // Send booking confirmation email
        const bookingDetails = `
    Hello ${req.user.name},

    Your booking is confirmed.

    Details:
    Name: ${req.user.name}
    Total Amount: $${totalamount}
    Check-in Date: ${checkinDate.toDateString()}

    Thank you for booking with us!
`;
        await emailsend.sendTestEmail(userEmail,'booking confirm' ,bookingDetails);

        // Send success response
        res.status(200).json({
            status: true,
            message: "Room booked successfully. A confirmation email has been sent.",
            booking
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;






