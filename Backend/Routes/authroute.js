const express = require('express');
const router = express.Router();
const User = require('../models/Usermodel')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const fetchUser = require('../middleware/fetchUser')
require('dotenv').config()

router.post('/signup' , async (req, res) => {
    const {name, email, password} = req.body
    try {
        if(!name || !email || !password){
            return res.status(400).json({error : "required all details"})
        }

        if (!email.includes("@")) {
            return res.status(400).json({ error: "Please enter a valid email" })
        }

        //* Find Unique User with email
        const user = await User.findOne({ email });

        if (user) {
            res.status(200).json({ error: "User already exists" })
        }

        //* Save Data into database
        const newUser = await User({
            name,
            email,
            password
        });
        await newUser.save();
        console.log(newUser);
        res.status(201).json({success: "Signup Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})


router.post("/login", async (req, res) => {
    const {  email , password } = req.body

            try {
            //validation
            if(!email || !password){
                return res.status(400).json({message : "user not found"})
            }
            //Email validation
            if(!email.includes("@")){
                return res.status(400).json({error : "Please enter a valid email"})
            } 
            //find unique user with email
            const user = await User.findOne({ email });

            //if user not exist with that email
            if(!user){
                return res.status(400).json({error : "user not found"})
            }

            //mathching user password to hash password with bcrypt.compare()
            const doMatch =  bcrypt.compare(password , user.password)
            console.log(doMatch);

            if(doMatch){
                const token = jwt.sign({userId : user.id}, process.env.JWT_SECRET , {
                    expiresIn : '7d'
                })
                res.status(201).json({token})
            }else{
                res.status(404).json({error : "Email and password not found"})
            }

            } catch (error) {
                console.log(error);
                res.status(500).send("Internal server error")
            }
})

router.get('/getuser', fetchUser, async (req, res) => {
    try {
        const userId = req.userId
        console.log("getuser Id", userId)
        const user = await User.findById(userId).select("-password")
        res.send(user)
        console.log("getuser", user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error");
    }
})

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log(email)
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User with this email does not exist" });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://localhost:5173/reset-password/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (error, response) => {
            if (error) {
                console.error('There was an error:', error);
            } else {
                res.status(200).json('Recovery email sent');
            }
        });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() } // Check if the token has expired
        });
        console.log(user);
        if (!user) {
            return res.status(400).json({ error: "Password reset token is invalid or has expired" });
        }

        // Hash the new password before saving
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password has been updated" });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;