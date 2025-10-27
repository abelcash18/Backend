const mongoose =require ('mongoose');
const bcrypt = require ('bcryptjs');
const User = require('../Models/userModel');

exports.getUsers = async (req, res) => {
   try {
       const users = await User.findUnique();
       res.status(500).json(users);
   } catch (err) {
       console.log(err);
       res.status(500).json({message:"failed to get users"});
   };};

exports.getUser = async (req, res) => {
    const id = req.params.id;
try { 
       const users = await User.find({
        where:{ id },
       });
       res.status(500).json(users);
   } catch (err) {
       console.log(err);
       res.status(500).json({message:"failed to get user"});
   };};

  
exports.updateUser = async (req, res) => {
    const { id } = req.params.id;
    const tokenUserId = req.userId;
    const {password, avatar, ...inputs} =req.body;

    if (id !== tokenUserId){
        return res.status(403).json({message: "Not Authorized!"});
    };
    let updatePassword = null;
    try {  
       
        if(password){
            updatePassword = await bcrypt.hash(password)
        }
        
        const updateUser = await User.user.update({
            where:{ id },
            data: { ...inputs, 
            ...(updatePassword && { password: updatePassword}),
            ...(avatar && {avatar }),
            },       
        });
      const {password: userPassword, ...rest} = updateUser

        res.status(200).json(rest);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to update users" });
    }
}; 

exports.deleteUser = async (req, res) => {
const { id } = req.params.id;
    const tokenUserId = req.userId;

    if (id !== tokenUserId){
        return res.status(403).json({message: "Not Authorized!"});
    };
try {
   await User.user.delete({
    where: { id }
   });
   res.status(200).json({message:"User deleted"});
    
} catch (err) {
console.log(err);
res.status(500).json({message: "Failed to delete users"});    
};};
