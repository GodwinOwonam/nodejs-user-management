const User = require('../model/User');
const bcrypt = require('bcrypt');

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
// const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

const isEmail = (email = "") => {
  return emailRegex.test(String(email).toLowerCase());
}

// const isStrongPassword = (password = "") => {
//   return passwordRegex.test(String(password).toLowerCase());
// }

const hashPassword = async (user, password) => {
  // hash the user's password
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  user.password = hashedPassword;
  return await user.save();
}

/**
 * Get all the users in the database
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns Promise<Object>
 */

const getAllUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find().select({ name: true, email: true });
  } catch(err) {
    return next(err);
  }

  if (!users) {
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }

  return res.status(200).json({
    status: true,
    data: users,
  });
}

/**
 * Add a user to the database
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns Promise<Object>
 */
const addUser = async (req, res, next) => {

  if (!req.body) {
    return res.status(422).json({
      status: false,
      error: "name, email and password required!"
    });
  }

  const { name, email, password } = req.body;

  if (!(name && name.trim().length)) {
    return res.status(422).json({
      status: false,
      error: ["name should be a string and should not be empty"]
    });
  }

  if (!(email && email.trim().length)) {
    return res.status(422).json({
      status: false,
      error: ["email should be a string and should not be empty"]
    });
  }

  if (!isEmail(email)) {
    return res.status(422).json({
      status: false,
      error: ["Invalid email"]
    });
  }

  if (!(password && password.trim().length >= 8)) {
    return res.status(422).json({
      status: false,
      error: [
        "password should be a string and should not be empty",
        "password length should be minimum 8 characters"
      ]
    });
  }

  let user;

  try {
    user = new User({
      name,
      email: email.toLowerCase(),
      password,
    });

    user = await user.save();

    if (!user) {
      return res.status(500).json({
        status: false,
        error: ["Internal server error"],
      });
    }

    // hash the password
    user = await hashPassword(user, password);

    return res.status(201).json({
      status: true,
      message: "User added successfully",
      data: {
        name,
        email
      },
    });
  } catch(err) {
    if (err.code == 11000 && err.keyPattern?.email) {
      return res.status(422).json({
        status: false,
        error: [`email ${email} already exists! Consider logging in!`],
      });
    }

    return next(err);
  }
}


/**
 * Update user details in the database
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns Promise<Object>
 */
const updateUser = async (req, res, next) => {
  const id = req.params?.id;

  if (!id) {
    return res.status(422).json({
      status: false,
      error: [
        "Required parameter id missing in request!"
      ],
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      status: false,
      error: [
        "User not found!"
      ],
    });
  }

  const  { name, email, password } = req.body;

  if (name && name.trim().length) {
    await user.updateOne({ name });
    await user.save();
  }

  if (email && email.trim().length) {
    console.log(email);
    try {
      await user.updateOne({ email });
      await user.save();
    } catch(err) {
      if (err.code == 11000 && err.keyPattern?.email) {
        return res.status(422).json({
          status: false,
          error: [`email ${email} already exists! Consider logging in!`],
        });
      }

      return next(err);
    }
  }

  if (password && password.trim().length) {
    await hashPassword(user, password);
  }

  return res.status(200).json({
    status: true,
    message: "Update successful!",
    data: {
      name: user.name,
      email: user.email,
    }
  });
}


/**
 * Delete a user from the database
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns Promise<any>
 */
const deleteUser = async (req, res, next) => {
  const id = req.params?.id;

  if (!id) {
    return res.status(422).json({
      status: false,
      error: [
        "Required parameter id missing in request!"
      ],
    });
  }

  try {
    const user = await User.findByIdAndRemove(id);

    if (!user) {
      return res.status(500).json({
        status: false,
        error: [
          'Unauthorized!'
        ]
      })
    }

    return res.status(200).json({
      status: true,
      message: "Delete successful!",
    });
  } catch(err) {
    return next(err);
  }
}


const getUserById = async (req, res, next) => {
  const id = req.params?.id;

  if (!id) {
    return res.status(422).json({
      status: false,
      error: [
        "Required parameter id missing in request!"
      ],
    });
  }

  try {
    const user = await User.findOne({ id }).select({ name: true, email: true });

    if (!user) {
      return res.status(500).json({
        status: false,
        error: [
          'Unauthorized!'
        ]
      })
    }

    return res.status(200).json({
      status: true,
      message: "User found!",
      data: user,
    });
  } catch(err) {
    return next(err);
  }
}


// Exported functions
exports.getAllUsers = getAllUsers;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getUserById = getUserById;