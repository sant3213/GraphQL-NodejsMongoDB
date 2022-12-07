const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');
const { dateToString } = require('../../helpers/date');

module.exports = { // resolver functions which need to match our schema endpoints by name
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformEvent(event); 
            });
        } catch (error) {
            throw error;
        }
    },
    createEvent: async (args, req) => {
        if(!req.isAuth) {
            throw new Error('Unauthenticated!');
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: req.userId
        });
        let createdEvent;
        // save is provided by the mogoose package
        try {
            const result = await event.save();
            createdEvent = transformEvent(result);
            const creator = await User.findById(req.userId)// __doc is provided by mongoose and gives us all the core properties made that make our document, or object or event and leave all metadata
            //console.log(creator.createdEvents);
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
    }
};