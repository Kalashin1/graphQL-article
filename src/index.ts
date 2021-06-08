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
