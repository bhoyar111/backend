import mongoose from "mongoose";
import { get } from "./Config.js";

const db = get(process.env.NODE_ENV).DB;
const mongodburl = `mongodb://localhost:27017/${db.DATABASE}`;
// console.log(mongodburl, "mongodburl");

export const mongoconnection = async () => {
  try {
    const options = {};

    if (db.USERNAME && db.PASSWORD) {
      options.user = db.USERNAME;
      options.pass = db.PASSWORD;
      options.authSource = "admin"; // only if using auth
    }

    await mongoose.connect(mongodburl, options);

    console.log("Auth DB is connected!!!");
  } catch (e) {
    console.error("MongoDB connection error:", e);
    throw e;
  }
};

mongoconnection();
