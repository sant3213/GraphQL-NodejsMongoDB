const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql'); // It is a function that takes a javascript template literal string which we can then use to define our schema
const app = express();

app.use(bodyParser.json());

// Here we define where to find our schema which defines the endpoints, which defines the queries you can handle,
//  where to find the resolvers to which my request should be forwarded once I identify the query when request I want to execute
app.use('/graphql', 
graphqlHTTP({
        schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }`),
        rootValue: { // resolver functions which need to match our schema endpoints by name
            events: () => {
                return ['Romantic Cooking', 'Sailing', 'All-Night Coding'];
            },
            createEvent: (args) => {
                const event = args.name; // it is 'name' because in the RootMutation the argument is name
                return eventName;
            }
        },
        graphiql: true

}));

app.listen(3000);