import mongoose from "mongoose";

let cached =
  global.mongoose || (global.mongoose = { conn: null, promise: null });

async function connectdb() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(
      `${process.env.MONGODB_URI}/jubayer26`,
      opts
    );
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectdb;
