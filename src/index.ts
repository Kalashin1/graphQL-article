//index.ts

//  * Importing our firebase-admin
import admin from 'firebase-admin'

// * Importing our serviceAccounnt
import serviceAccount from './serviceAccount.json'

// * Importing our apollo-server

import { ApolloServer, gql, ApolloError } from 'apollo-server'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "firestore Database url"
});

const db = admin.firestore()

const typeDefs = gql`
"This will provide information about what you want to describe e.g an User"
# graphQL treats anything that begins with a # as a string

"An User Schema"

type User{
  email: String!,
  id: ID!,
  name: String!,
  channels: [Channel!]!
}

type Channel {
  animal: String!,
  id: ID!,
  photoUrl: String!,
  title: String!
}

type Query {
  user(id: String!): User,
  users: [User!]!,
  channels: [Channel!]!
}

`

const resolvers = {
    // Let's resolve the channels list on the user
    User { 
    // we can customize the atrribute or logic for getting each field on the types
    // we defined above, in this case we are only interested in the channels
    async channels (parent:any) {
       // the parent refers to an individual instance of a user
      // Get a reference to the channels collection
      const chanRef = await db.collection('channels').get()
      const channels = chanRef.docs.map(d => d.data() )
      // create an empty array
      const userChan:any[] = []
      // loop through the user's channels id 
      parent.channels.forEach((chan:any) => {
        // search the channels collection for the channel with an id that 
        //  matches the id we are iterating over
        const channel = channels.find((item:any) => chan == item.id)
        // add that chanel to the array of users channel
        userChan.push(channel)
      })
      return userChan
    }
  }, 
  // Let's resolve our Query
  Query: {
      // remeber the Query we defined in typeDefs, this is for a list of channels
    channels: async (parent, args, context) => {
        // Basic firebase
      const channelsRef = await db.collection('channels').get()
      return channelsRef.docs.map(c => c.data())
    },
    // this is for a list of users
    users: async (parent, args, context) => {
      try{
        // Basic firebase stuff
        const usersRef = await db.collection('users').get()
        return usersRef.docs.map(user => user.data())
      }
      catch(err) {
        console.log(err)
        return new ApolloError(err)
      }
    },
    // an individual user, when we want to query for a user, we can pass in 
    // an id as an argument, it will be added to args object but we are destructuring
    user: async (parent:any, {id}: any, context: any) => {
        // Basic firebase
      const userRef = await db.collection('users').doc(id).get()
      return userRef.data()
    }
  }
}


const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`Server running on ${url}`)
})
