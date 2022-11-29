# GraphQL-Nodejs-express-MongoDB

GraphQL Query

```js
{
    query { // operation type (query, mutation, subscription)
        user { // Operation "endpoint" we want to target with the query
                    // requested fields
            name
            age
        }
    }
}
``` 

Operation Types

- Query: Retrieve Data("GET"). Everything is sent as a POST request.
- Mutation: Manipule Data ("POST", "PUT", "PATCH", "DELETE").
- Subscription: Set up realtime connection via Webscokets.

The type definition, query definitions, mutation definitions and subscriptions definitions are like <strong>Routes</strong> and the <strong>Resolvers</strong> that contain my server-side logic are like controllers.

<font size="3"><strong>General Configuration</strong></font>

```js
npm init
npm i --save express body-parser
npm i --save-dev nodemon
```
app.js file

```js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send('Hello World!');
})

app.listen(3000);

```

```
npm i --save express-graphql graphql
```

The <strong>express-graphql</strong> package can be used as a middleware in express application and that allows us to point at a schema, at resolvers and automatically all of that for us and route requests to a parser and then handle them according to our schema and forward them to the right resolvers.

The <strong>graphql</strong> package will allow us to define the schema and set up a schema that follows the official graphQL specification and definitions and that will give us a valid schema, it will not just check it, it will also basically convert it to Javascript code, to Javascript objects, so it will parse our schema and convert it and we can then use this parsed converted schema together with Express GraphQL.

<strong>Basic graphQL Configuration</strong>

```js
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql'); // It is a function that takes a javascript template literal string which we can then use to define our schema

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
                return events;
            },
            createEvent: (args) => {
              const event = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: args.eventInput.date
              };
              events.push(event);
              return event;
            }
        },
        graphiql: true // Shows a graphic url in the page

}));

app.listen(3000);

```

Now we create an event and this event will be taken by the RootQuery and the RootMutation will return the same type Event.


```js
    .
    .
    .
    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        }

    type RootQuery {
        events: [Event!]!
        }

    type RootMutation {
        createEvent(title: String!, description: String!, price: Float!, date: String): Event
        }

       .
       .

```

Instead of writing all the properties of the Event in the createEvent arguments, there's another way:

```js
    .
    .
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
    .
    .

          type RootMutation {
            createEvent(eventInput: EventInput): Event
        }
    .
    .

```

To test it go to localhost:3000/graphql and write:

```js
mutation {
    createEvent(eventInput: { title: "A Test", description: "Working", price: 9.99, date: "2022-11-17T17:02:26.339Z"}) {
        title
        price
    }
}
```

```js
query {
    events {
        _id
        date
    }
}
```

<font size="3"><strong>GraphQL with MongoDB</strong></font>

Go to https://www.mongodb.com/cloud/atlas


```
npm install --save mongoose
```

Add a nodemon.json file to store the keys of the database

```
{
    "env": {
        "MONGO_USER": "",
        "MONGO_PASSWORD": "",
        "MONGO_DB": ""
    }
}
```

Then create a file with the name of event.js inside a folder named models.

```js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number // There is not Float in Javascript
    },
    date: {
        type: Date,
        required: true
    }
});

// Two arguments
// The first one is the name of the model (Event)
// The second one is a pointer at the Schema we want to use for that model.
module.exports = mongoose.model('Event', eventSchema)
```

And change the app.js according to the model created above

```js
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
```

Test it on the GraphQL console

```js
mutation {
    createEvent(eventInput: { title: "A Test", description: "This is a test", price: 9.99, date: "2022-11-17T17:02:26.339Z"}) {
        title
    }
}
```

```js
query {
    events {
        title
        _id
    }
}
```


<hr>
<hr>
<font size="3"><strong>Adding Relations</strong></font>

Create a file named user.js
```js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdEvents: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Event' // 
        }
    ]
});

mongoose.model('User', userSchema);

```

ref property allows me to set up a relation and let mongoose know that two models are related which will help us later to fetch data.
We use the name of the model which we want to connect with, in this case is Event.

In the event.js add the property "creator" which will be the <strong>user</strong> entity.

```js
    .
    .
    .
    date: {
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

    .
    .

```

Install bcryptjs to handle the user password.

```
 npm i --save bcryptjs
```

Then in the app.js add the method and the type user.

```js
    .
    .
    .
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

    .
    .`

    .
    .
    .
        createEvent: args => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date),
                    creator: '6377dd4fe3b034da58505dc9'
                });
                let createdEvent;
                return event
                    .save()
                    .then(result => {
                        createdEvent = { ...result._doc, _id: result._doc._id.toString()}
                        return User.findById('6377dd4fe3b034da58505dc9')
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
        .
        .
        .


```

To create the user run the next lines in the graphical

```js
mutation {
    createUser(userInput: {email: "test@gmail", password: "test"}) {
        email
        password
    }
}

```

To create an event run the next lines in the graphical

```js
mutation {
    createEvent(eventInput: {title: "Testing", description: "This is a test", price: 9.99, date: "2022-11-18T16:54:29.374Z"}) {
        title
        description
    }
}

```


<hr>
<hr>
<font size="3"><strong>Dynamic Relations</strong></font>

So far I'm missing the relation between users and events in my mongoose models which have no direct effect on the api. So we really want to emphasize that.

Add creator to event and add createdEvents property to User.

```js
    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
    }

    type User {
        _id: ID!
        email: String!
        password: String
        createdEvents: [Event!]
    }
```

If I try to retrieve the email with the events I'm going to get an error because the creator field in event only has the id.


```
query {
    events {
        creator {
            email
        }
    }
}

```

We would have to adjust the data retrieved in the events method.

Populated() is a method provided by mongoose to populate any relations as knows and Mongoose knows a relation by the creator: { ...ref:'User'.. in the event model so it pulls all the extra data from our database for the given user ID which is actually stored in the creator field.

```js
    .
    .
    .
 rootValue: { 
            events: () => {
                return Event.find()
                .populate('creator')
                    .then(events => {
                        return events.map(event => {
                            return { 

    .
    .
    .

```

If I try to fetch the id
```
query {
    events {
        creator {
            _id
        }
    }
}

```

I'll get an error, this is related on how the id is stored and that it is this object ID which is not understood by GraphQl.
We could fix that overwriting the creator with the id:

```js
    .
    .
    .
  events: () => {
                return Event.find()
                    .then(events => {
                        return events.map(event => {
                            return { 
                                ...event._doc,
                                _id: event.id,
                                creator: user.bind(this, event._doc.creator)
                            }; // mongoose can acces to the id and convert it to string with event.id
                        });
                    })
                    .catch(err => {
                        throw err
                    })
            },
    .
    .

```

Now we can drill into this without entering an infinite loop

```
query {
    events {
        creator {
            email
            createdEvents {
                title
                creator {
                    email
                }
            }
        }
    }
}
```

```
query {
    events {
        title
        creator {
            email
        }
    }
}
```

```
mutation {
    createEvent(eventInput: {title:"This should now work", description: "It really should!", price:29.99, date:"2022-11-17T17:02:26.339Z"}) {
        creator {
            email
        }
    }
}
```

After refactoring the code adding the date to the resolvers I can query with:

```
query {
   events {
    title
    date
    creator{
      email
      createdEvents {
        title
      }
    }
  }
}
```

```
mutation {
    createUser(userInput: {email: "tests@gmail.com", password:"yester"}) {
        _id
    }
}
```