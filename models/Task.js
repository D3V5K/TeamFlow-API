const mongoose = require("mongoose") ;

const taskSchema = new mongoose.Schema({
    title : {
         type : String ,
         required : [true , "title is required"],
         trim : true ,
    },
   description: {
    type: String,
    default: ""
},
    status : {
         type : String ,
         enum : ['PENDING', 'IN_PROGRESS' ,'SUBMITTED','APPROVED','DONE' ],
         default : "PENDING"
    },
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
   } 
}, 
{
    timestamps: true
});
module.exports = mongoose.model("Task", taskSchema);