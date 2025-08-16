const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    
    email: {
        type: String,
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true, 
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    
    password: {
        type: String,
        required: [true, 'Password is required'], 
        minlength: [6, 'Password must be at least 6 characters long'] 
    },
    
    role: {
        type: String,
        required: [true, 'User role is required'], 
        enum: ['admin', 'agent', 'customer', 'designer', 'merchant'] 
    },
    
    online: {
        type: Boolean,
        default: false 
    },
    

}, {
    timestamps: true 
});


const User = mongoose.model('User', userSchema);


module.exports = User;