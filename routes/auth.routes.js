// routes/auth.routes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const User = require('../model/User'); 


router.post('/signup', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with this email already exists.' });
        }

    
        const salt = await bcrypt.genSalt(10);
        
        const hashedPassword = await bcrypt.hash(password, salt);

        
        user = new User({
            email,
            password: hashedPassword, 
            role,
            online: false 
        });

        
        await user.save();

        
        res.status(201).json({ msg: 'User registered successfully!' });

    } catch (err) {
        
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; 

        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        
        const payload = {
            user: {
                id: user.id, 
                role: user.role
            }
        };

        
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretjwtkey', 
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) throw err; 
                
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 
