// index.js
import { Database } from "@nozbe/watermelondb";
import Post from "./Post";

// @ts-ignore
const database = new Database({
  // ...
  modelClasses: [Post],
});
