var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
const jwt = require("jsonwebtoken");


const User = {
    id: 1,
    first_name: "User",
    name: "User",
    avatar: "http://10.0.2.2:4000/background.jpg",
    username: "user__"
}

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`

    type User{
        id: Int,
        first_name: String,
        avatar: String
        name: String
        username: String
    }

    type Session {
        token: String
        user: User
    }

    type Post {
        id: Int
        body: String
        image: String
        user: User
    }

    type Org {
        id: Int
        name: String
        username: String
        avatar: String
    }

    input UserInput {
        college: String
        org: String
    }

    input PostInput{
        body: String
        image: String
    }

    input OrgInput{
        name: String
        username: String
        description: String
    }

    type Query {
        validateToken(token: String): [User]
    }

    type Mutation {
        createUser(user: UserInput): Session
        signIn(email: String, password: String): Session
        createPost(post: PostInput): Post
        submitOrgForm(org: OrgInput): Org
    }

`);

// The root provides a resolver function for each API endpoint
var root = {
    createUser: (user) => {
        var token = jwt.sign({ id: user.user.id }, 'shhhhh');
        return {
            token,
            user: User,
        }
    },
    
    signIn: (user) => {
        var token = jwt.sign({ user }, 'shhhhh');
        return {
            token,
            user: User,
        };
    },

    validateToken: (token) => {
        try {
            jwt.verify(token.token, 'shhhhh');
            return [User];
        } catch (e) {
            return [{
                first_name: "Error",
            }]
        }
    },

    createPost: (data) => {
        try {
            return {
                id: 3,
                ...data.post,
                user: User,
            }
        } catch (e) {
            return {
                first_name: "Error",
            }
        }
    },

    submitOrgForm: (data) => {
        return {
            id: 3,
            ...data.org,
            avatar: "http://10.0.2.2:4000/avatar.jpg",
        }
    },
};

var app = express();

app.use(express.static("public"));


app.use(function (req, res, next) {
    let originalSend = res.send;
    res.send = function (data) {
        console.log(data);
        originalSend.apply(res, Array.from(arguments));
    }
    next();
})

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');