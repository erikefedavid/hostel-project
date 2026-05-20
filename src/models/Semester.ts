import mongoose, { Schema, Document, Model } from "mongoose";
import { ISemester } from "@/types";

export interface ISemesterDocument extends Omit<ISemester, "_id">, Document {}

const SemesterSchema = new Schema<ISemesterDocument>(
  {
    label: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: false,
      required: true,
    },
    openedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Semester: Model<ISemesterDocument> =
  mongoose.models.Semester || mongoose.model<ISemesterDocument>("Semester", SemesterSchema);

export default Semester;
