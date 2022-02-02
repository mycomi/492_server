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
router.post('/dorms' ,authController.dorms)
//router.post('/dorm' ,authController.verify,authController.dorm)
router.get('/dorm' ,authController.dorm)
router.post('/room' ,authController.verify,authController.room)
// router.get('/room' ,authController.verify,authController.room)
router.get('/dorm/:id' ,authController.rooms)
router.get('/user_room' ,authController.verify,authController.user_room)
router.get('/isRoom' ,authController.verify,authController.isRoom)
router.post('/login_line', authController.login_line )
router.get('/dropRoom' ,authController.verify,authController.dropRoom)


//admin routes
router.post('/admin/register', authAdminController.register )
router.post('/admin/login', authAdminController.login )
router.get('/admin/IsAuth' ,authAdminController.verify, authAdminController.IsAuth)
router.get('/admin/admin_dorm' ,authAdminController.verify, authAdminController.admin_dorm)
router.post('/admin/getUsers' , authAdminController.getUsers)
router.post('/admin/user_pass' , authAdminController.user_pass)



module.exports = router;