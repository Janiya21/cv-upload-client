import mongoose, { Schema, Document } from 'mongoose';

export interface ApplicantALT extends Document {
  firstName: string;
  lastName: string;
  phoneNo: string;
  email: string;
  noticePeriod: Number;
  position: mongoose.Types.ObjectId;
  location: string;
  url: string;
}

const applicantSchema: Schema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  phoneNo: { type: String },
  email: { type: String },
  noticePeriod: { type: Number },
  position: { type: mongoose.Types.ObjectId, ref: 'Position' },
  location: { type: String },
  url: { type: String },
}, { collection: 'applicantsALT' });

export default mongoose.models.ApplicantALT || mongoose.model<ApplicantALT>('ApplicantALT', applicantSchema);
