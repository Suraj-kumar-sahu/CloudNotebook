const jwt = require('jsonwebtoken');
JWT_SECRET = "imsuraj";

const fetchuser =(req,res,next)=>{
    //Get the user from the jwt token and add to req object
    const token = req.header("auth-token");
    if(!token){
        res.status(401).send({error:"please authenticate using a valid token"})
    }
    try {
        const data = jwt.verify(token,JWT_SECRET)
        req.user = data.user
        next()
    } catch (error) {
        console.error(error.message)
        res.status(500).send("please authenticate using a valid token")
    }
}

module.exports = fetchuser