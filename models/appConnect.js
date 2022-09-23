import mongoose, { Schema } from "mongoose";

const connectionSchema = new Schema(
  {
    key: string,
  },
  {
    timestamps: true,
  }
);

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;
