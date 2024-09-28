const jwt = require('jsonwebtoken');


exports.verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch (err) {
        res.clearCookie("token");
        return res.redirect("/");
    }
}