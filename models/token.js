const mongoose=require('mongoose');

const tokenSchema=new mongoose.Schema({
loginid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'login',
},
token: {
    type:String,

}
});

module.exports=mongoose.model('token',tokenSchema);

    


