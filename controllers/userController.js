const mysql = require('mysql')
const crypto = require('crypto');
const nodemailer = require('nodemailer')

//Create connection
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

//transporter
var transport = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    
    auth: {
      user: "fiveplanner@hotmail.com",
      pass: "12345#goals"
    }
    
  });


//post register
exports.create = (req, res) => {

    var name = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    //encrypt password
    var hash = crypto.createHash('sha256');
    var pwd = hash.update(password, 'utf-8')
    var pwdhash = pwd.digest('hex');
// mail '1867b39b6a-093ede+1@inbox.mailtrap.io'
   var mailOptions = {
        from:  'fiveplanner@hotmail.com',
        to: ""+email+"",
        subject: "No-Reply: Welcome to FIVE Planner",
        html: "<h3>Hello "+name+", </h3> "+
              "<p class='my-5'><img style='width:50px;' src='cid:unique@cid' alt='' ></p> "+
              "<p class='mt-5'>Welcome to FIVE Planneryour goal acheiving aid, you have made the right choice.</p> "+
              "<p class='mt-5'>visit the website <a href='five-planner.herokuapp.com/login'>FIVE Planner</a> to create your goal plans and start your journey to success.</p>",
    
        attachments:        [
                    {
                        filename: '5logo.png',
                        path: 'public/component/5logo.png',
                        cid: 'unique@cid'
                    }
                ]
        }
    
pool.getConnection((err, connection) => {
    if(err) throw err; //not connected
    console.log('Connected as ID ' + connection.threadId);
    
    var sqli = "SELECT email FROM user where email = ?";
    connection.query(sqli, [email], (err, user) => {
        if (err){
            console.log(err);
        } else if(user.length > 0){
          res.render('validate/register', {message: "This email already exists."});
        } else {
        var sql = "INSERT INTO user (name, email, password, created) VALUES ('"+name+"', '"+email+"', '"+pwdhash+"', CURDATE())";
    //insert user
    connection.query(sql, (err, user) => {
        //when done with the connection release it
        connection.release();

        if(!err){
            res.render('validate/login', {alert: "Congratulations!! This was an important decision, many more to come!" });
            // send email
            transport.sendMail(mailOptions, (err, info) => {
                if (err) throw(err) 
                console.log('Message sent');   
            });
        } else {
                console.log(err);
            }
        console.log('The user data from: \n', user);
    });
}});  
});
}

//post login
exports.access = (req, res) => {

    var email = req.body.email;
    var password = req.body.password;
    //encrypt password
    var hash = crypto.createHash('sha256');
    var pwd = hash.update(password, 'utf-8')
    var pwdhash = pwd.digest('hex');
pool.getConnection((err, connection) => {
    if(err) throw err; //not connected
    console.log('Connected as ID ' + connection.threadId);

    var sqlc = "SELECT goal_id FROM complete WHERE user_id = ? ";
    //Use the connection
    connection.query(sqlc, [req.params.id], (err, done) => {
    var sql = "SELECT * FROM user WHERE email = ? ";
    //Use the connection
    connection.query(sql, [email], (err, user) => {
     //when done with the connection release it
        connection.release();
        if(err) throw(err);
     
        if(user.length <= 0){
            res.render('validate/login', {message: "The user doesn't exist."});
        }else if(user[0].password != pwdhash){
            res.render('validate/login', {message: "Incorrect password"});
        } else {
            req.session.loggedin = true;
            var sqli = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
            "  description, resources, reward FROM goals WHERE user_id = ? ";
            connection.query(sqli, [user[0].id], (err, goal) => {
                if(err)throw(err);
                
            res.render('goalplan/index', {user, goal, done});
            })
        }
        console.log('The user data from: \n', user);
        });
    });
});
}

//view homepage
exports.view = (req, res) => {
    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);

        var sqli = "SELECT * FROM user WHERE id = ? ";
    //Use the connection
    connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
        var sql = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward FROM goals WHERE user_id = ? "; 
        //Use the connection
        connection.query(sql, [req.params.id] , (err, goal) => {
            if(err)throw(err);
        var sqlc = "SELECT goal_id FROM complete WHERE user_id = ? ";
            //Use the connection
            connection.query(sqlc, [req.params.id], (err, done) => {
                //when done with the connection release it
                connection.release();

            if(!err){
                res.render('goalplan/index',{ user, goal, done })
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal, done);
        });
    });
});
});

}

//view profile
exports.profile = (req, res) => {

    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
     
        var sql = "SELECT * FROM user where id = ?"; 
        //Use the connection
        connection.query(sql,[req.params.id], (err, user) => {
            //when done with the connection release it
            connection.release();
    
            if(!err){
                res.render('goalplan/profile', {user});
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user);
        });
      });
    }

//edit profile
exports.user = (req, res) => {

    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
     
        var sql = "SELECT * FROM user where id = ?"; 
        //Use the connection
        connection.query(sql,[req.params.id], (err, user) => {
            //when done with the connection release it
            connection.release();
    
            if(!err){
                res.render('goalplan/edit_profile', {user});
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user);
        });
      });
    }

//post edit profile
exports.edit = (req, res) => {
    var name = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
     //encrypt password
     var hash = crypto.createHash('sha256');
     var pwd = hash.update(password, 'utf-8')
     var pwdhash = pwd.digest('hex');
    //Connect to MySQL
pool.getConnection((err, connection) => {
    if(err) throw err; //not connected
    console.log('Connected as ID ' + connection.threadId);

    var sqli = "UPDATE user SET name = '"+name+"', password = '"+pwdhash+"', email = '"+email+"' WHERE id = ? "; 
    //Use the connection
    connection.query(sqli, [req.params.id], (err, user) => {
        var sql = "SELECT * FROM user where id = ?"; 
        //Use the connection
        connection.query(sql,[req.params.id], (err, user) => {
            //when done with the connection release it
            connection.release();

        if(!err){
            res.render('goalplan/profile', {user});
        } else {
            console.log(err);
        }
        console.log('The user data from: \n', user);
    });
  });
});
}

//logout
exports.end = (req, res) => {
    res.clearCookie("key");
        req.session.destroy() 
        res.render('validate/login');
}



