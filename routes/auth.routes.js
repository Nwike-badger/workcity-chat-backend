// routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const verifyToken = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const router = express.Router();


router.post('/signup', async (req, res) => {
  try {
    
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      
      role: 'customer', 
    });

    await user.save();
    res.status(201).json({ msg: 'Customer account registered successfully!' });
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
        res.json({
          token,
          user: {
            id: user.id, 
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



router.post('/admin/create-user', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { email, password, role } = req.body;

        
        if (!['agent', 'designer', 'merchant', 'admin'].includes(role)) {
            return res.status(400).json({ msg: 'Invalid role specified.' });
        }

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
        });

        await user.save();
        res.status(201).json({ msg: `User with role '${role}' created successfully!` });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



router.get('/all-users', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;








// // routes/auth.routes.js
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../model/User');
// const verifyToken = require('../middleware/auth.middleware');
// const authorizeRoles = require('../middleware/role.middleware');

// const router = express.Router();

// // ====================== SIGNUP ======================
// router.post('/signup', async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

    
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ msg: 'User with this email already exists.' });
//     }

    
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

    
//     user = new User({
//       email,
//       password: hashedPassword,
//       role,
//       online: false
//     });

//     await user.save();

//     res.status(201).json({ msg: 'User registered successfully!' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// // ====================== LOGIN ======================
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

    
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

    
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

    
//     const payload = {
//       user: {
//         id: user.id,
//         role: user.role
//       }
//     };

    
//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET || 'supersecretjwtkey',
//       { expiresIn: '1h' },
//       (err, token) => {
//         if (err) throw err;

//         res.json({
//           token,
//           user: {
//             id: user.id,
//             email: user.email,
//             role: user.role
//           }
//         });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// // ====================== ADMIN: GET ALL USERS ======================
// router.get('/all-users', verifyToken, authorizeRoles('admin'), async (req, res) => {
//   try {
//     const users = await User.find().select('-password'); // exclude password
//     res.json(users);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// module.exports = router;
