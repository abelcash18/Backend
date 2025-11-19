const Property = require('../Models/propertyModel');
const mongoose = require('mongoose');

exports.getPosts = async (req, res) => {
    try {
        console.log('📝 Getting all posts...');
        const posts = await Property.find().populate('userId', 'username avatar');
        console.log(`✅ Found ${posts.length} posts`);
        res.status(200).json(posts);
    } catch (err) {
        console.log('❌ Error getting posts:', err);
        res.status(500).json({ message: "Failed to Get Posts" });
    }
};

exports.addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;
    
    console.log('📝 Add Post Request:', { body, tokenUserId });
    
    try {
        // Validate required fields
        const requiredFields = ['title', 'price', 'address', 'city', 'bedroom', 'bathroom', 'type', 'propertyType'];
        for (let field of requiredFields) {
            if (!body[field]) {
                console.log(`❌ Missing required field: ${field}`);
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        // Ensure images is an array
        if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        // Generate mock coordinates if not provided
        let latitude = body.latitude;
        let longitude = body.longitude;
        
        if (!latitude || !longitude) {
            const mockCoords = generateMockCoordinates(body.city);
            latitude = mockCoords.latitude;
            longitude = mockCoords.longitude;
            console.log('📍 Generated mock coordinates:', mockCoords);
        }

        console.log('✅ All required fields present');
        const newPost = new Property({
            ...body,
            latitude,
            longitude,
            userId: tokenUserId,
        });

        console.log('📝 Saving post to database...');
        const savedPost = await newPost.save();
        console.log('✅ Post saved successfully:', savedPost._id);
        
        await savedPost.populate('userId', 'username avatar');
        console.log('✅ Post populated with user data');
        
        res.status(201).json(savedPost);
    } catch (err) {
        console.log('❌ Error creating post:', err);
        
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({ 
                message: messages.join(', ') 
            });
        }
        
        res.status(500).json({ message: "Failed to Create Post" });
    }
};

// Helper function to generate mock coordinates based on city
function generateMockCoordinates(city) {
    const cityCoordinates = {
        'london': { latitude: 51.5074, longitude: -0.1278 },
        'new york': { latitude: 40.7128, longitude: -74.0060 },
        'los angeles': { latitude: 34.0522, longitude: -118.2437 },
        'chicago': { latitude: 41.8781, longitude: -87.6298 },
        'miami': { latitude: 25.7617, longitude: -80.1918 },
        'toronto': { latitude: 43.6532, longitude: -79.3832 },
        'paris': { latitude: 48.8566, longitude: 2.3522 },
        'berlin': { latitude: 52.5200, longitude: 13.4050 },
        'tokyo': { latitude: 35.6762, longitude: 139.6503 },
        'sydney': { latitude: -33.8688, longitude: 151.2093 }
    };

    const normalizedCity = city.toLowerCase().trim();
    
    if (cityCoordinates[normalizedCity]) {
        return cityCoordinates[normalizedCity];
    }

    // Generate random coordinates within a reasonable range
    return {
        latitude: 51.5074 + (Math.random() - 0.5) * 0.1, // Around London area
        longitude: -0.1278 + (Math.random() - 0.5) * 0.1
    };
}

exports.updatePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    const body = req.body;

    console.log('📝 Updating post:', { id, tokenUserId, body });

    try {
        const post = await Property.findById(id);
        
        if (!post) {
            console.log('❌ Post not found for update:', id);
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user owns the post
        if (post.userId.toString() !== tokenUserId) {
            console.log('❌ Unauthorized update attempt. User:', tokenUserId, 'Post owner:', post.userId);
            return res.status(403).json({ message: "Not Authorized!" });
        }

        // Ensure images is an array
        if (body.images && (!Array.isArray(body.images) || body.images.length === 0)) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        const updatedPost = await Property.findByIdAndUpdate(
            id,
            { $set: body },
            { 
                new: true,
                runValidators: true 
            }
        ).populate('userId', 'username avatar');

        console.log('✅ Post updated successfully:', updatedPost._id);
        res.status(200).json(updatedPost);
    } catch (err) {
        console.log('❌ Error updating post:', err);
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({ 
                message: messages.join(', ') 
            });
        }
        
        res.status(500).json({ message: "Failed to Update Post" });
    }
};

exports.getUserPosts = async (req, res) => {
    const userId = req.params.userId;
    console.log('📝 Getting posts for user:', userId);
    
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('❌ Invalid user ID format:', userId);
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const posts = await Property.find({ userId }).populate('userId', 'username avatar');
        console.log(`✅ Found ${posts.length} posts for user ${userId}`);
        
        res.status(200).json(posts);
    } catch (err) {
        console.log('❌ Error getting user posts:', err);
        res.status(500).json({ message: "Failed to Get User Posts" });
    }
};

// Keep your other methods the same...
exports.getPost = async (req, res) => {
    const id = req.params.id;
    try {
        console.log('📝 Getting post:', id);
        const post = await Property.findById(id).populate('userId', 'username avatar');
        if (!post) {
            console.log('❌ Post not found:', id);
            return res.status(404).json({ message: "Post not found" });
        }
        console.log('✅ Post found:', post._id);
        res.status(200).json(post);
    } catch (err) {
        console.log('❌ Error getting post:', err);
        res.status(500).json({ message: "Failed to Get Post" });
    }
};

exports.deletePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;

    try {
        console.log('📝 Deleting post:', id);
        const post = await Property.findById(id);

        if (!post) {
            console.log('❌ Post not found for deletion:', id);
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.userId.toString() !== tokenUserId) {
            console.log('❌ Unauthorized deletion attempt');
            return res.status(403).json({ message: "Not Authorized!" });
        }

        await Property.findByIdAndDelete(id);
        console.log('✅ Post deleted successfully:', id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        console.log('❌ Error deleting post:', err);
        res.status(500).json({ message: "Failed to Delete Post" });
    }
};