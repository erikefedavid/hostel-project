import mongoose, { Schema, Document, Model } from "mongoose";
import { IHostel } from "@/types";

export interface IHostelDocument extends Omit<IHostel, "_id">, Document {}

const HostelSchema = new Schema<IHostelDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    totalRooms: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Hostel: Model<IHostelDocument> =
  mongoose.models.Hostel || mongoose.model<IHostelDocument>("Hostel", HostelSchema);

export default Hostel;
