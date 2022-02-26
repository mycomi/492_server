//const mysql = require('mysql');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// const db = mysql.createConnection({
//     host: process.env.DATABASE_HOST ,
//     user: process.env.DATABASE_USER ,
//     password: process.env.DATABASE_PASSWORD ,
//     database: process.env.DATABASE
//   });

const db = require('../connect');

const gennerateAcsessToken = (user)=>{
    return jwt.sign({id: user.id, name: user.name, email: user.email},
    process.env.SECRET_KEY
    );
}

// const gennerateRefreshToken = (user)=>{
//     return jwt.sign({id: user.id, name: user.name, email: user.email},
//     process.env.SECRET_REFRESH_KEY,
//     { expiresIn: "10m" }
//     );
// }

//let refreshTokens = [];

// exports.refresh = (req, res) => {
//     const refreshToken = req.body.token

//     if(!refreshToken) return res.status(401).json("no auth");
//     if(!refreshTokens.includes(refreshToken)){
//         return res.status(403).json("refresh token not valid");
//     }
//     jwt.verify(refreshToken, process.env.SECRET_REFRESH_KEY, (err, user) => {
//         if(err) {
//             console.log(err); 
//         }
//         refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

//         const newAcsessToken = gennerateAcsessToken(user);
//         const newRefreshTokens = gennerateRefreshToken(user);

//         refreshTokens.push(newRefreshTokens);

//         res.status(200).json({
//             accessToken: newAcsessToken,
//             refreshToken: newRefreshTokens
//         })
//     })
// }
    

// exports.verify = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if(authHeader) {
//         const token = authHeader.split(' ')[1];

//         jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
//             if(err) {
//                 return res.status(403).json("Token not valid");
//             }

//             req.user = user;
//             next();
//         })
//     }
// }

exports.verify = (req, res, next) => {
    const token = req.headers["access-token"];
    console.log("token:"+token)
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

    const { name, email, password, phone } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error);
            return res.send("register fail")
        }
        if(results.length > 0){                                     //email ซ้ำไหม
            return res.status(400).send("email duplicate")
        }
        

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ? ', {name: name , email: email, password: hashedPassword, phone: phone} , (error, results)=>{
            if(error){
                console.log(error);
                return res.status(400).send("register fail")
            } else {
                console.log(password);
                console.log(results);
                //return res.redirect("http://localhost:5000/login");
                return res.status(200).send("success")
            }
        });
    });

}


exports.login = (req, res) => {
    //console.log(req.body);

    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
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

exports.isLine = (req, res) => {
    const { line_id } = req.body;

    console.log(line_id)
    db.query('SELECT * FROM users WHERE line_id = ?', [line_id], async (error, results) => {
        if(error){
            console.log(error);
            return res.status(404);

        }
        if(results.length > 0){
            const name = results[0].name;
            const acsessToken = gennerateAcsessToken(results[0]);
            console.log(results);
            res.json({
                name: name,
                acsessToken
            })

        }else{
            return res.status(300).send("error");
        }
    })

}


exports.login_line = (req, res) => {
    //console.log("body"+req.body);

    const { email, password, line_id } = req.body;

    db.query('SELECT * FROM users WHERE line_id = ?', [line_id], async (error, results) => {
        if(error){
            console.log(error);
            return res.status(404);

        }
        if(results.length > 0){
            const name = results[0].name;
            const acsessToken = gennerateAcsessToken(results[0]);
            
            res.json({
                name: name,
                acsessToken
            })

        }else{

            db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
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
                        
        
                        db.query('UPDATE users SET line_id = ? WHERE email = ?', [line_id,email], (error, results) => {
                            console.log("line: "+results+","+line_id);
                            res.json({
                                name: name,
                                acsessToken
                            })
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

    })

}

exports.logout = (req, res) => {
    

}

exports.IsAuth = (req, res) =>{
    return res.status(200).send("User is Auth!!");
}

exports.dormsAll = (req, res) => {

    db.query('SELECT * FROM dorms ', (error, results) => {
        if(error){
            console.log(error);
            //return res.status(404);

        }
        if(results.length > 0){
            console.log(results); 
            console.log(results[0]);  
                 
            res.status(200).json(results)
                //return res.send('login success!!');
                
            }else{
                return res.status(404).send('fail');
            }

        })
}
        
exports.rooms = (req, res) => {

    const dormId = req.params.id;
    // console.log('help');
    

    //const  {userId,dormId}  = req.body;
    //const  {dormId,dormName}  = req.body;

    //const value = [userId,dormId];
    //db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
    // db.query('INSERT INTO `user_in_room` (`user_id`, `dorm_id`) VALUES (?,?) ', value, (error, results) => {

    db.query('SELECT * FROM rooms WHERE dorm_id = ? AND status = 0 ORDER BY roomNum ASC;', [dormId], (error, results) => {
        console.log(results);
        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            
            res.status(200).json(results)
        }

    })
    
}

exports.get_photo = (req, res) => {

    const dorm_id = req.params.id;

    db.query('SELECT * FROM photos WHERE dorm_id = ? ',dorm_id, (error, results) => {
        if(error){
            console.log(error);
            //return res.status(404);

        }
        if(results.length > 0){
            console.log(results); 
            console.log(results[0]);  
                 
            res.status(200).json(results)
                //return res.send('login success!!');
                
            }else{
                return res.status(404).send('fail');
            }

        })
}

exports.dorm = (req, res) => {

    const {dormId} = req.query
    console.log("dorm "+dormId);
    db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
        
        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            // res.status(200).json({
            //     userId: userId,
            //     dormId: dormId,
                

            // })
            res.status(200).json(results)
        }

        })
}

exports.filter = (req, res) => {

    const  {lowPrice,highPrice} = req.body;
    
    //console.log(userId);

    //db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
    // db.query('INSERT INTO `user_in_room` (`user_id`, `dorm_id`) VALUES (?,?) ', value, (error, results) => {
    db.query('SELECT * FROM dorms WHERE (highPrice <= ? AND highPrice >= ? ) OR (lowPrice >= ? AND lowPrice <= ?)', [highPrice,lowPrice,lowPrice,highPrice], (error, results) => {
        console.log("dorms: "+results);
        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            res.status(200).json(results)
        }
        })
}

exports.room = (req, res) => {

    //return res.status(200).send("good");
    const  {userId,dormId,roomId}  = req.body;
    //const  {dormId,dormName}  = req.body;
    console.log(userId);
    console.log(dormId);
    console.log(roomId);

    const value = [userId,dormId,roomId];
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
            db.query('UPDATE rooms SET status = 1 WHERE id = ?', [roomId], (error, book) => {
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

exports.user_room = (req, res) => {

    const  {userId}  = req.body;
    
    //db.query('SELECT * FROM dorms WHERE id = ?', [dormId], (error, results) => {
    // db.query('INSERT INTO `user_in_room` (`user_id`, `dorm_id`, `room_id`) VALUES (?,?,?) ', value, (error, results) => {
    db.query('SELECT * FROM user_in_room WHERE user_id = ?', [userId], (error, results) => {
        console.log(results);
        if(error){
            console.log(error);
            //return res.status(404);

        }else if(results.length > 0){
            // res.status(200).json({
            //     userId: userId,
            //     dormId: dormId,
            // })
            console.log(results);
            const dorm_id = results[0].dorm_id;
            const room_id = results[0].room_id;
            console.log(dorm_id);
            db.query('SELECT * FROM dorms WHERE id = ?', [dorm_id], (error, dorm) => {
                if(error){
                    console.log(error);
                    //return res.status(404);
        
                }else{
                    db.query('SELECT * FROM rooms WHERE id = ?', [room_id], (error, room) => {
                        if(error){
                            console.log(error);
                            //return res.status(404);
                
                        }else{
                            let Isconfirm = false;
                            if(room[0].status == '2'){
                                Isconfirm = true;
                            }

                            res.status(200).json([{
                                dormId: dorm_id,
                                dorm: dorm[0].name,
                                image: dorm[0].imageUrl,
                                room: room[0].roomNum,
                                price: room[0].price,
                                haveRoom: true,
                                Isconfirm : Isconfirm,
                                
                            }])

                            
                        }
                    })

                }
            })
            
        }else{
            res.status(200).json([{
                dorm: 'ไม่มีข้อมูลหอพัก',
                room: 'ไม่มีข้อมูลห้องพัก',
                haveRoom: false,
            }])


        }

        })
}

exports.isRoom = (req, res) =>{
    const  {userId}  = req.body;
    db.query('SELECT * FROM user_in_room WHERE user_id = ? ', [userId], (error, results) => {
        if(error){
            console.log(error);
            //return res.status(404);

        }if(results.length > 0){
            res.status(200).send('success')
        }else{
            res.status(404).send('no room')
        }
    })
}

exports.dropRoom = (req, res) =>{
    const  {userId}  = req.body;

    db.query('SELECT * FROM user_in_room WHERE user_id = ? ', [userId], (error, results) => {
        console.log(results);
        if(error){
            console.log(error);
            //return res.status(404);

        }else{
            const  room_id = results[0].room_id;
            
            db.query('DELETE FROM user_in_room WHERE user_id = ? ', [userId], (error, results) => {
                console.log(results);
                if(error){
                    console.log(error);
                    //return res.status(404);
        
                }else{
                    db.query('UPDATE rooms SET status = 0 WHERE id = ?', [room_id], (error, results) => {
                        if(error){
                            console.log(error);
                            //return res.status(404);
                
                        }else{
        
                            res.status(200).json(results)
                            
                        }
                    })

                }
        
            })
        }
    })


    

}