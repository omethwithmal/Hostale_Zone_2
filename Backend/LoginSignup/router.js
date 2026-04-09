const express = require('express');
const router = express.Router();
const controller = require('./controller');

// Public routes
router.post('/register', controller.registerUsers);
router.post('/login', controller.loginUsers);
router.post('/logout', controller.logoutUser);

// Protected routes
router.get('/users', controller.getUsers);
router.get('/user/:id', controller.getUserById);
router.get('/verify', controller.verifyUser);
router.get('/profile', controller.getProfile);
router.put('/user/:id', controller.updateUser);
router.delete('/user/:id', controller.deleteUser);
router.get('/search', controller.searchUsers);

module.exports = router;