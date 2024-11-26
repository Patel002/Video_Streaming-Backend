import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    
    content: {
        type: String,
        required: true
    },
    video: { 
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Video"    
        },
        videoFile: {
            type: String,
            required: true
        },
        thumbnails: {
            type: String,
            required: true
        },
    },
    owner: {
            _id: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "User"
            },
            username: {
                type: String,
                required: true
            },
            avatar: {
                type: String,
                required: true
        },
    }
},{ timestamps: true })

commentSchema.plugin(mongooseAggregatePaginate)


export const Comment = mongoose.model("Comment", commentSchema)