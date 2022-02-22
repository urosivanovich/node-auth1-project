
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const helpers = require('../users/users-model')
const {
    checkPasswordLength,
    checkUsernameExists,
    checkUsernameFree, 
 } = require('./auth-middleware')

// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!


/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */

  router.post('/register', checkUsernameFree, checkPasswordLength, async (req, res, next) => {
    try {
      // pulls credentials from req.body
      const {username, password} = req.body
      // hash the password 2^8
      const hash = bcrypt.hashSync(password, 8)
      // store newUser in db
      const newUser = { username, password: hash}
      const inserted = await helpers.add(newUser)
      // respond
      res.status(201).json(inserted)
    } catch(err){
      next(err)
    }
  })


/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

  router.post('/login', checkUsernameExists, async (req, res, next) => { // eslint-disable-line
    // pull username and password from req.body
    const { username, password} = req.body
    // pull the username from the db by the username
    const [user] = await helpers.findBy({username})
    if(user && bcrypt.compareSync(password, user.password)){
      // password good, we can initialize a session
      req.session.user = user // THIS CODE DOES EVERYTHING
      res.json({status: 200, message: `Welcome ${username}`})
    }else{
      res.json({status:401, message:"Invalid credentials"})
    }
  })


/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

  router.get('/logout', (req, res, next) => {
  if(req.session.user){
    req.session.destroy((err) => {
      if(err) {
        res.json({message: 'could you please retry'})
      }else{
        res.json({message: "logged out", status: 200 })
      }
    })
  }else{
    next({ status: 200, message: "no session" })
  }
  })
module.exports = router