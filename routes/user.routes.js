// routes/user.routes.js
const express = require('express');
const verifyToken = require('../middleware/auth.middleware');
const User = require('../model/User');

const router = express.Router();


router.get('/support', verifyToken, async (req, res) => {
  try {
    
    const supportUsers = await User.find({ 
      _id: { $ne: req.userId },
      role: { $in: ['agent', 'designer', 'merchant', 'admin'] } 
    }).select('-password');

    res.json(supportUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;







// const express = require('express');
// const verifyToken = require('../middleware/auth.middleware');
// const User = require('../model/User');

// const router = express.Router();


// router.get('/', verifyToken, async (req, res) => {
//   try {
    
//     const users = await User.find({ _id: { $ne: req.userId } }).select('-password');
//     res.json(users);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// module.exports = router;