const express = require('express');
const router = express.Router();
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser")
JWT_SECRET = "imsuraj";//sign for jwt


//Route:1 create a user using POST "/api/auth/createuser" . no login required
router.post('/createuser', [
    body('name', 'Enter valid name').isLength({ min: 5 }),
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
    //if thre are error ,,show bad request and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //check if the email exist already
    try {
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ error: "user with this email already exists" })
        }

        //creating secure pass using bcryptjs
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        //creating user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        //generating web token using JWT
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        console.log(authtoken)
        res.json({ authtoken: authtoken })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }

}
)

//Route:2 Authenticate a user using POST "/api/auth/createuser" . no login required
router.post('/login', [
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    //if thre are error ,,show bad request and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const{email,password} = req.body //destructuring
    try {
        let user = await User.findOne({email})
        if(!user){
            res.status(400).json({error:"Please try to login with correct credentials"})
        }
        const passwordCompare = await bcrypt.compare(password,user.password)
        if(!passwordCompare){
            res.status(400).json({error:"Please try to login with correct credentials"})
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        
        res.json({ authtoken: authtoken })

    }catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

//Route:3 Get logged in user details using POST "api/auth/getuser" login required
router.post('/getuser', fetchuser, async (req, res) => {
try {
    let userId = req.user.id
    const user =await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.error(error.message)
    res.status(500).send("Internal server error")
}
})


module.exports = router