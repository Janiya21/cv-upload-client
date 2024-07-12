import mongoose, {Document, ObjectId, Schema} from "mongoose";
import Position from "./Position";
import Applicant from "./Applicant";

export interface IVacancy extends Document{
    position: mongoose.Schema.Types.ObjectId;
    title: string;
    status: string;
    createDate: string;
    endDate: string;
    description: string;
    location:string[];
    applicants: mongoose.Schema.Types.ObjectId[];
}

const vacancySchema: Schema = new Schema({
    position: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
    title:{
        type:String,
    },
    status:{
        type:String,
    },
    createDate:{
        type:String,
    },
    endDate:{
        type:String,
    },
    description:{
        type:String,
    },
    location:{
        type:[String],
    },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant',
    }],
})

const Vacancy = mongoose.models.Vacancy || mongoose.model<IVacancy>('Vacancy', vacancySchema);

export default Vacancy;