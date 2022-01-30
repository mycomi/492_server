const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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