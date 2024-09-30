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

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        console.log("Found user:\n", user);
        return user;
    }
    catch (error) {
        console.error(error.message);
    }
}
