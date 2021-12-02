import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

import { Platform } from 'react-native'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from './model/schema'
import migrations from './model/migrations'
// import Post from './model/Post' // ⬅️ You'll import your Models here

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
    schema,
    // (You might want to comment it out for development purposes -- see Migrations documentation)
    migrations,
    // (optional database name or file system path)
    dbName: 'morrow',
    // (recommended option, should work flawlessly out of the box on iOS. On Android,
    // additional installation steps have to be taken - disable if you run into issues...)
    jsi: Platform.OS === 'ios',
    // (optional, but you should implement this method)
    onSetUpError: error => {
        console.error(error)
        // Database failed to load -- offer the user to reload the app or log out
    }
})

// Then, make a Watermelon database from it!
const database = new Database({
    adapter,
    modelClasses: [
        // Post, // ⬅️ You'll add Models to Watermelon here
    ],
})


// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
