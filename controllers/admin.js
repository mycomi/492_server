const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const multer = require('multer')

const db = require('../connect');

const gennerateAcsessToken = (user)=>{
    return jwt.sign({id: user.id, name: user.name, email: user.email},
    process.env.SECRET_KEY
    );
}

exports.verify = (req, res, next) => {
    const token = req.headers["access-token"];

    if(token) {
        //const accesstoken = token.split(' ')[1];

        jwt.verify(token, process.env.SECRET_KEY, (err, results) => {
            if(err) {
                return res.status(403).json("Token not valid");
            }
            console.log(results);
            req.body.userId = results.id;

            next();
        })
    }else{
        res.send("You need token")
    }
}

exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, password } = req.body;

    db.query('SELECT email FROM admins WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error);
            return res.send("register fail")
        }
        if(results.length > 0){                                     //email ซ้ำไหม
            return res.send("email duplicate")
        }
        

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO admins SET ? ', {name: name , email: email, password: hashedPassword} , (error, results)=>{
            if(error){
                console.log(error);
                return res.send("register fail")
            } else {
                console.log(password);
                console.log(results);
                //return res.redirect("http://localhost:5000/login");
                return res.send("success")
            }
        });
    });

}

exports.login = (req, res) => {
    //console.log(req.body);

    const { email, password } = req.body;

    db.query('SELECT * FROM admins WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error);
            return res.status(404);

        }
        if(results.length > 0){
            console.log(results); 
            console.log(results[0]);                                
            const hashedPassword = results[0].password;

            const verified = await bcrypt.compare(password, hashedPassword);

            if(verified){
                const name = results[0].name;
                const acsessToken = gennerateAcsessToken(results[0]);
                //const refreshToken = gennerateRefreshToken(results[0]);
                //refreshTokens.push(refreshToken);
                // const acsessToken = jwt.sign(
                //     {id: id, name: name, email: email},
                //     process.env.SECRET_KEY,
                //     { expiresIn: "10m" }
                // );
                res.json({
                    name: name,
                    acsessToken
                })

                //return res.send('login success!!');
                
            }else{
                return res.status(404).send('Wrong password');
            }

        }else{                                                          //ไม่มี email นี้
            return res.status(404).send('no email');
        }
        
    });

}

exports.IsAuth = (req, res) =>{
    return res.status(200).send("User is Auth!!");
}

exports.admin_dorm = (req, res) => {

    const  {userId}  = req.body;
    
    //db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
    // db.query('INSERT INTO `user_in_room` (`user_id`, `dorm_id`, `room_id`) VALUES (?,?,?) ', value, (error, results) => {
    db.query('SELECT * FROM admin_of_dorm WHERE admin_id = ?', [userId], (error, results) => {
        console.log(results);
        if(error){
            console.log(error);
            //return res.status(404);

        }
        
        if(results.length > 0){
            // res.status(200).json({
            //     userId: userId,
            //     dormId: dormId,
            // })
            console.log(results);
            const dorm_id = results[0].dorm_id;
            console.log(dorm_id);
            db.query('SELECT * FROM dorms WHERE id = ?', [dorm_id], (error, dorm) => {
                if(error){
                    console.log(error);
                    //return res.status(404);
        
                }else{

                    res.status(200).json(dorm)

                }
            })
            


        }else{
            // res.status(200).json([{
            //     dorm: 'ไม่มีข้อมูลหอพัก',
            //     id: null,
            // }])

            res.status(200).json(null) 


        }

    })
}

exports.admin_rooms = (req, res) => {

    const {dormId} = req.body;
    // console.log('help');
    

    //const  {userId,dormId}  = req.body;
    //const  {dormId,dormName}  = req.body;

    //const value = [userId,dormId];
    //db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
    // db.query('INSERT INTO `user_in_room` (`user_id`, `dorm_id`) VALUES (?,?) ', value, (error, results) => {
    db.query('SELECT * FROM rooms WHERE dorm_id = ? AND status = 0 ORDER BY roomNum', [dormId], (error, results) => {
        console.log(results);
        if(error){
            console.log(error);
            //return res.status(404);

        }
        
        if(results.length > 0){
            // res.status(200).json({
            //     userId: userId,
            //     dormId: dormId,
                

            // })
            res.status(200).json(results)
        }else{
            res.status(404).send('not found')
        }

        })
}


exports.admin_allRooms = (req, res) => {

    const {dormId} = req.body;

    db.query('SELECT * FROM rooms WHERE dorm_id = ? ORDER BY roomNum', [dormId], (error, results) => {
        console.log(results);
        if(error){
            console.log(error);
            //return res.status(404);

        }

        if(results.length > 0){
            // res.status(200).json({
            //     userId: userId,
            //     dormId: dormId,
                

            // })
            res.status(200).json(results)
        }else{
            res.status(404).send('not found')
        }

        })
}

exports.getUsers = (req, res) => {

    const  {dormId}  = req.body;
    console.log("dormId: "+dormId);
    

    //db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
    // db.query('INSERT INTO `user_in_room` (`user_id`, `dorm_id`, `room_id`) VALUES (?,?,?) ', value, (error, results) => {
    db.query(`SELECT rooms.dorm_id, users.name, users.phone, rooms.roomNum, rooms.id, rooms.status, rooms.roomFloor, rooms.price 
                FROM user_in_room 
                    INNER JOIN rooms 
                        ON  user_in_room.room_id = rooms.id
                    INNER JOIN users 
                        ON  user_in_room.user_id = users.id
                    WHERE user_in_room.dorm_id = ? ORDER BY roomNum`, [dormId], async(error, results) => {
        
        console.log(results);
        if(error){
            console.log(error);
            //return res.status(404);

        }else if(results.length > 0){

            res.status(200).json(results)

            
        }else{
            res.status(404).send("no user")

        }

        
        

    })
        

}

exports.user_pass = (req, res) => {

    const  {roomId}  = req.body;
    console.log("roomId: "+roomId);
    
    //db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
    // db.query('INSERT INTO `user_in_room` (`user_id`, `dorm_id`, `room_id`) VALUES (?,?,?) ', value, (error, results) => {
    db.query('UPDATE rooms SET status = 2 WHERE id = ?', [roomId], (error, results) => {

        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            res.status(200).send("success");
        }

    })
}

exports.user_fail = (req, res) => {

    const  {roomId}  = req.body;
    console.log("roomId: "+roomId);
    
    //db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
    // db.query('INSERT INTO `user_in_room` (`user_id`, `dorm_id`, `room_id`) VALUES (?,?,?) ', value, (error, results) => {
    db.query('UPDATE rooms SET status = 0 WHERE id = ?', [roomId], (error, results) => {

        if(error){
            console.log(error);
            //return res.status(404) ;

        }else{
            db.query('DELETE FROM user_in_room WHERE room_id = ?', [roomId], (error, results) => {

                if(error){
                    console.log(error);
                    //return res.status(404) ;
        
                }else{
                    res.status(200).send("success");
                }
        
            })
        }

    })
}

exports.add_dorm = (req, res) => {
    const {userId,name,phone,floors,rooms,room,price,isPet,isAir,isAirs,imageUrl,imageFloorUrl,distance,position} = req.body;
    // console.log("userId "+JSON.stringify(userId))
    // console.log("rooms" +JSON.stringify(room))
    // console.log("rooms" +room[0])
    console.log("imageUrl" +imageUrl)

    const lowPrice = Math.min(...price)
    const highPrice = Math.max(...price)

    const lat = position.lat;
    const lng = position.lng; 

    const value_dorms = [name,phone,lowPrice,highPrice,isAir,isPet,floors,imageUrl,imageFloorUrl,distance,lat,lng]
    

    db.query('INSERT INTO `dorms` (`name`,`phone`, `lowPrice`, `highPrice`,`isAir`, `isPet`, `floor`, `imageUrl`,`imageFloorUrl`, `distance`, `lat`, `lng`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ', value_dorms, (error, dorms) => {
        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            console.log("dorms "+dorms.insertId)
            const dormId = dorms.insertId;
            const value_admin = [userId,dormId]
            db.query('INSERT INTO `admin_of_dorm` (`admin_id`, `dorm_id`) VALUES (?,?) ', value_admin, (error, admin) => {
                if(error){
                    console.log(error);
                    //return res.status(404);
        
                }else{
                    
                    for (let index = 0; index < (rooms*floors); index++) {

                        const floor = room[index][0][0];
                        const value_room = [dormId,floor,room[index],price[index],isAirs[index],0];

                        db.query('INSERT INTO `rooms` (`dorm_id`, `roomFloor`, `roomNum`, `price`, `isAir`, `status`) VALUES (?,?,?,?,?,?) ', value_room, (error, room) => {
                            if(error){
                                console.log(error);
                                //return res.status(404);
                    
                            }
                        })
                    }
                    res.status(200).send("success");
                }
            })
        }
    })

    
}

exports.add_user = (req, res) => {

    //return res.status(200).send("good");
    const  {dormId,roomId}  = req.body;
    //const  {dormId,dormName}  = req.body;

    console.log(dormId);
    console.log(roomId);

    const value = [1,dormId,roomId];
    //db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
    db.query('INSERT INTO `user_in_room` (`user_id`, `dorm_id`, `room_id`) VALUES (?,?,?) ', value, (error, results) => {
    //db.query('SELECT * FROM rooms WHERE dorm_id = ?', [dormId], (error, results) => {
        console.log(results);
        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            // res.status(200).json({
            //     userId: userId,
            //     dormId: dormId,
                

            // })
            db.query('UPDATE rooms SET status = 2 WHERE id = ?', [roomId], (error, book) => {
                if(error){
                    console.log(error);
                    //return res.status(404);
        
                }else{

                    res.status(200).json({results,dormId,roomId})
                    
                }
            })
            
        }

        })
}


exports.add_photo = (req, res) => {

    //return res.status(200).send("good");
    // console.log("req.body"+JSON.stringify(req.body))
    const  {imageUrl,userId}  = req.body;
    db.query('SELECT dorm_id FROM admin_of_dorm WHERE admin_id = ?', [userId], (error, dorm) => {
        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            console.log(dorm[0].dorm_id);
            const dorm_id = dorm[0].dorm_id;
            db.query('INSERT INTO `photos` (`imageUrl`, `dorm_id`) VALUES (?,?) ', [imageUrl,dorm_id], (error, results) => {
                if(error){
                    console.log(error);

                }else{
                    
                    res.status(200).send("success");
                }
            })
        }
    })

}

exports.get_photo = (req, res) => {
    const  {imageUrl,userId}  = req.body;
    db.query('SELECT dorm_id FROM admin_of_dorm WHERE admin_id = ?', [userId], (error, dorm) => {
        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            const dorm_id = dorm[0].dorm_id;
            db.query('SELECT * FROM photos WHERE dorm_id = ?', [dorm_id], (error, photos) => {
                if(error){
                    console.log(error);
        
                }else{
                    res.status(200).json(photos)
                }
            })
        }
    })
}

exports.delete_photo = (req, res) => {
    const  {id}  = req.body;
    db.query('DELETE FROM photos WHERE id = ?', [id], (error, results) => {
        console.log("results "+JSON.stringify(results))
        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            res.status(200).send('success');
        }
    })
}


exports.edit_rooms = (req, res) => {
    const  {id,roomFloor,roomNum,price,isAir}  = req.body;
    for (let i = 0; i < id.length; i++) {
         db.query('UPDATE rooms SET roomFloor = ? , roomNum = ? , price = ? , isAir = ? WHERE id = ?', 
            [roomFloor[i],roomNum[i],price[i],isAir[i], id[i]], (error, results) => {

                if(error){
                    console.log(error);
                    //return res.status(404);
        
                }
            }
        )

    }
    res.status(200).send('success');
    
}