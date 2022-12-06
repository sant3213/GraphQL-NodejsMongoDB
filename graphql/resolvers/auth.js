const User = require('../../models/user');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

module.exports = { // resolver functions which need to match our schema endpoints by name
    createUser: async args => {
        // second argument is salt that is a random string that makes the hash unpredictable. Defines the security of the generated hash. 12 is considered as save.
        try {
            const existingUser = await User.findOne({ email: args.userInput.email });
            if (existingUser) {
                throw new Error('User exists already');
            };
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return { ...result._doc, password: null, _id: result.id };
        } catch (error) {
            throw error;
        }
    },
    // the name login has to match with the rootQuery method name
    login: async ({ email, password }) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('User does not exist!');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('Password is incorrect!');
        }
        const token = jwt.sign({userId: user.id, email: user.email}, 'somesupersecretkey', {
            expiresIn: '1h'
        });
        return { userId: user.id, token: token, tokenExpiration: 1 }; // It has to return the AuthData expected (check it at the schema)
    }
};