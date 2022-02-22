
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { json } = require('express/lib/response');
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
      const {username, password} = req.body
      const hash = bcrypt.hashSync(password, 8)
      const newUser = { username, password: hash}
      const inserted = await helpers.add(newUser)
      res.status(200).json(inserted)
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

  router.post('/login', checkUsernameExists, (req, res, next) => {
    res.json({message: 'nicejob hommie login'})
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
    res.json({message: 'nicejob hommie logout'})
  })


module.exports = router