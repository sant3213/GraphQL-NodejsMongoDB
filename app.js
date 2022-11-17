const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql'); // It is a function that takes a javascript template literal string which we can then use to define our schema
const mongoose = require('mongoose');

const Event = require('./models/event');

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

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
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
            createEvent: (args) => {
                /*const event = {
                  _id: Math.random().toString(),
                  title: args.eventInput.title,
                  description: args.eventInput.description,
                  price: +args.eventInput.price,
                  date: args.eventInput.date
                };*/
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date)
                });
                // save is provided by the mogoose package
                return event.save()
                    .then(result => {
                        console.log(result);
                        return { ...result._doc, _id: result._doc._id.toString() }; // __doc is provided by mongoose and gives us all the core properties made that make our document, or object or event and leave all metadata
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    })
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