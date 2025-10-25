const mongoose =require ('mongoose');

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
       res.status(500).json({message:"failed to get users"});
   };};



  
exports.updateUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get user" });
    }
};


exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    // Logic to delete a user by ID
    res.send(`Delete user with ID: ${id}`);
};