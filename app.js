const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql'); // It is a function that takes a javascript template literal string which we can then use to define our schema
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

const events = [];

app.use(bodyParser.json());

// Here we define where to find our schema which defines the endpoints, which defines the queries you can handle,
//  where to find the resolvers to which my request should be forwarded once I identify the query when request I want to execute
app.use('/graphql',
    graphqlHTTP({
        schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }`),
        rootValue: { // resolver functions which need to match our schema endpoints by name
            events: () => {
                return Event.find()
                    .then(events => {
                        return events.map(event => {
                            return { ...event._doc, _id: event.id }; // mongoose can acces to the id and convert it to string with event.id
                        });
                    })
                    .catch(err => {
                        throw err
                    })
            },
            createEvent: args => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date),
                    creator: '6377dd4fe3b034da58505dc9'
                });
                let createdEvent;
                // save is provided by the mogoose package
                return event
                    .save()
                    .then(result => {
                        createdEvent = { ...result._doc, _id: result._doc._id.toString()}
                        return User.findById('6377dd4fe3b034da58505dc9')// __doc is provided by mongoose and gives us all the core properties made that make our document, or object or event and leave all metadata
                    })
                    .then(user => {
                        if (!user) {
                            throw new Error('User not found');
                        }
                        user.createdEvents.push(event);
                        return user.save();
                    })
                    .then( result => {
                        return createdEvent;
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    })
            },
            createUser: args => {
                // second argument is salt that is a random string that makes the hash unpredictable. Defines the security of the generated hash. 12 is considered as save.
                return User.findOne({ email: args.userInput.email })
                    .then(user => {
                        if (user) {
                            throw new Error('User exists already');
                        }
                        return bcrypt.hash(args.userInput.password, 12);
                    })
                    .then(hashedPassword => {
                        const user = new User({
                            email: args.userInput.email,
                            password: hashedPassword
                        });
                        return user.save();
                    })
                    .then(result => {
                        return { ...result._doc, password: null, _id: result.id };
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        },
        graphiql: true // Shows a graphic url in the page

    }));

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.j979lvb.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });