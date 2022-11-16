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

The <strong>graphql</strong> package will allow us to define the schema and set up a schema that follows the official graphQL specification and definitions and that will give us a valid schema, it will not just check it, it will also basically convert it to Javascript code, to Javascript objects, so it will parse our schema and convert it and we can then use this parsed converted schema together with Express GraphQL  