const express = require('express');
const authController = require('../controllers/auth')
const authAdminController = require('../controllers/admin')
const jwt = require('jsonwebtoken');
const router = express.Router();

//user routes
router.post('/register', authController.register )
router.post('/login', authController.login )
//router.post('/logout',authController.logout )
router.post('/logout', authController.verify , authController.IsAuth)
//router.post('/refresh', authController.refresh )
router.get('/IsAuth' ,authController.verify, authController.IsAuth)
//router.get('/IsAuth' ,authController.verify)
router.get('/dormsAll' ,authController.dormsAll)
router.post('/filter' ,authController.filter)
//router.post('/dorm' ,authController.verify,authController.dorm)
router.get('/dorm' ,authController.dorm)
router.post('/room' ,authController.verify,authController.room)
// router.get('/room' ,authController.verify,authController.room)
router.get('/dorm/:id' ,authController.rooms)
router.get('/get_photo/:id' ,authController.get_photo)
router.get('/user_room' ,authController.verify,authController.user_room)
router.get('/isRoom' ,authController.verify,authController.isRoom)
router.post('/login_line', authController.login_line )
router.post('/isLine' ,authController.isLine)
router.get('/dropRoom' ,authController.verify,authController.dropRoom)


//admin routes
router.post('/admin/register', authAdminController.register )
router.post('/admin/login', authAdminController.login )
router.get('/admin/IsAuth' ,authAdminController.verify, authAdminController.IsAuth)
router.get('/admin/admin_dorm' ,authAdminController.verify, authAdminController.admin_dorm)
router.post('/admin/getUsers' , authAdminController.verify,authAdminController.getUsers)
router.post('/admin/user_pass' , authAdminController.verify,authAdminController.user_pass)
router.post('/admin/user_fail' , authAdminController.verify,authAdminController.user_fail)
router.post('/admin/add_dorm' , authAdminController.verify,authAdminController.add_dorm)
router.post('/admin/admin_rooms' ,authAdminController.verify,authAdminController.admin_rooms)
router.post('/admin/admin_allRooms' ,authAdminController.verify,authAdminController.admin_allRooms)
router.post('/admin/add_user' ,authAdminController.verify,authAdminController.add_user)
router.post('/admin/add_photo' ,authAdminController.verify,authAdminController.add_photo)
router.get('/admin/get_photo' ,authAdminController.verify,authAdminController.get_photo)
router.post('/admin/delete_photo' ,authAdminController.verify,authAdminController.delete_photo)
router.post('/admin/edit_rooms' ,authAdminController.verify,authAdminController.edit_rooms)

module.exports = router;
