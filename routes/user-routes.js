const express = require('express');
const { getAllUsers, addUser, updateUser, getUserById, deleteUser } = require('../controllers/users-controller');

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', addUser);
router.put('/:id', updateUser);
router.get('/user/:id', getUserById);
router.delete('/:id', deleteUser);

module.exports = router;