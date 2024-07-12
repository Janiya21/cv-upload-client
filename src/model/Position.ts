import mongoose, { Document, Schema } from "mongoose";

export interface IPosition extends Document {
    name: string;
    description: string;
    status: 'active' | 'inactive';
}

const positionSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'], 
        default: 'active',
      },
});

const Position = mongoose.models.Position || mongoose.model("Position", positionSchema);

export default Position;
