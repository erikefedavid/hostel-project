import mongoose, { Schema, Document, Model } from "mongoose";
import { IApplication } from "@/types";

export interface IApplicationDocument
  extends Omit<IApplication, "_id" | "studentId" | "roomId">,
    Document {
  studentId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId | null;
}

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ALLOCATED", "NOT_ALLOCATED"],
      default: "PENDING",
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    allocatedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// A student can submit at most one application per semester
ApplicationSchema.index({ studentId: 1, semester: 1 }, { unique: true });

const Application: Model<IApplicationDocument> =
  mongoose.models.Application ||
  mongoose.model<IApplicationDocument>("Application", ApplicationSchema);

export default Application;
