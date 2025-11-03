const mongoose = require('mongoose');
const User = require('../Models/userModel');

exports.getPosts = async(req, res)=>{
    try {
        const posts = await User.post.findMany()
     res.status(200).json(posts)   
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Failed to Get Posts"})
    }
};
exports.getPost = async(req, res)=>{
    const id =req.params.id;
    try {
         const post = await User.post.findUnique({
            where:{id}
         })
     res.status(200).json(post)   
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Failed to Get Post"})
    }
};
exports.addPost = async(req, res)=>{
    const body = req.body;
    const tokenUserId = req.userId;
    try {
        const newPost = await User.post.create({
            data:{
                ...body,
                userId: tokenUserId,
            },
        });
     res.status(200).json(newPost)   
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Failed to Create Post"})
    }
};
exports.updatePost = async(req, res)=>{
    try {
     res.status(200).json()   
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Failed to Update Post"})
    }
};

exports.deletePost = async(req, res)=>{
    const id = req.params.id;
    const tokenUserId = req.userId
    try {
        const post = await User.post.findUnique({
            where:{ id },
        });

        if (post.userId !== tokenUserId){
            return res.status(403).json({message:"Not Authorized!!"});
        }
        await User.post.delete({
            where:{id},
        });
     res.status(200).json({message:"Post deleted"})   
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Failed to Delete Post"})
    }
};