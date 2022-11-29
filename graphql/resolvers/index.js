const bcrypt = require('bcryptjs')

const Event = require('../../models/event');
const User = require('../../models/user');

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            };
        });
    } catch (err) {
        throw err
    }
};

const user = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    } catch (error) {
        throw error
    }
}

module.exports = { // resolver functions which need to match our schema endpoints by name
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                }; // mongoose can acces to the id and convert it to string with event.id
            });
        } catch (error) {
            throw error;
        }
    },
    createEvent: async args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '6384d10935a9c8cc9a1b1b6e'
        });
        let createdEvent;
        // save is provided by the mogoose package
        try {
            const result = await event.save();
            createdEvent = {
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById('6384d10935a9c8cc9a1b1b6e')// __doc is provided by mongoose and gives us all the core properties made that make our document, or object or event and leave all metadata
            console.log(creator.createdEvents);
            if (!creator) {
                throw new Error('User not found');
            };
            creator.createdEvents.push(event);
            await creator.save();

            return createdEvent;
        }
        catch (error) {
            console.log(error);
            throw error
        }
    },
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
    }
};