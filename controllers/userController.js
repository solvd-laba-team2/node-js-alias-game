const User = require("../models/userModel");
exports.createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        console.log("User created:\n", newUser);
    }
    catch (error) {
        console.error(error.message);
    }
}

exports.getUser = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            console.log(`No user with username: ${username}`);
            return null;
        }
        console.log("Found user:\n", user);
        return user;
    }
    catch (error) {
        console.error(error.message);
    }
}
