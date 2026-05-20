import mongoose, { Schema, Document, Model } from "mongoose";
import { IRoom } from "@/types";

export interface IRoomDocument extends Omit<IRoom, "_id" | "hostelId">, Document {
  hostelId: mongoose.Types.ObjectId;
}

const RoomSchema = new Schema<IRoomDocument>(
  {
    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: true,
      default: 0, // 0 = ground floor
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
    },
    availableBeds: {
      type: Number,
      required: true,
      default: 4,
    },
    block: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure room number is unique within a single hostel/block
RoomSchema.index({ hostelId: 1, block: 1, roomNumber: 1 }, { unique: true });

const Room: Model<IRoomDocument> =
  mongoose.models.Room || mongoose.model<IRoomDocument>("Room", RoomSchema);

export default Room;
