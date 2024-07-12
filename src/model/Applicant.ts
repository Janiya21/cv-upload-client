import mongoose, {Document, ObjectId, Schema} from "mongoose";
import Vacancy from "./Vacancy";


export interface IApplicant extends Document{
    email: string;
    firstName: string;
    lastName: string;
    location: string;
    notice: Number;
    phoneNo: string;
    url: string;
    vacancy: mongoose.Types.ObjectId;
}

const applicantchema: Schema = new Schema({
    email:{
        type:String,
    },
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    location:{
        type:String,
    },
    notice:{
        type:Number,
    },
    phoneNo:{
        type:String,
    },
    vacancy: { type: mongoose.Types.ObjectId, ref: 'Vacancy' },
    url: { type: String },
}, { collection: 'applicants' })

const Applicant = mongoose.models.Applicant || mongoose.model<IApplicant>('Applicant', applicantchema);

export default Applicant;