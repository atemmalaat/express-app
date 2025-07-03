var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const brcrypt = require('bcrypt');

//  GET users listing. 
router.get('/', async function (req, res, next) {
  try {
    const users = await req.db('users').select('*');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post("/register", async function (req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
  };
  try {

    // Check if movie already exists
    const existingUser = await req.db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists - please user different email.' });
    }
    // Hash the password
    const hash = await brcrypt.hash(password, 10);

    //insert new user
    const[id] = await req.db('users').insert({email, hash});

    res.status(201).json({ message: 'New User added successfully', data: { id, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: "Email and password credentials inccorect or not provided." });
  };

  //check user
  const users = await req.db('users').where({ email }).select('*');
  const user = users[0];

  if (!user) {
    return res.status(401).json({ error: true, message: "Invalid credentials" });
  };

  // console.log('password from body:', password);
  // console.log('password hash from db:', user.hash);

  //check if user matched
  const isMatch = await brcrypt.compare(password, user.hash);
  if (!isMatch) {
    return res.status(401).json(
      {
        error: true,
        message: "Invalvid credentials"
      });
  };
  //set signed token in variable 'token'
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1hr" });
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,  //not yet - revisit after securty chapter
    sameSite: 'strict',
    maxAge: 3600000 //Set to 1hr
  });

  res.json({ 
    token: token,
    token_type: "cookie",
    expiry: "1 Hour"
   });
});

module.exports = router;
