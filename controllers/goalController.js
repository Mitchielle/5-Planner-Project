const mysql = require('mysql')
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


//add new goal
exports.addgoal = (req, res) => {
    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);

        var sql = "SELECT * FROM user WHERE id = ? ";
    //Use the connection
    connection.query(sql, [req.params.id], (err, user) => {
        if(err)throw(err);
        //when done with the connection release it
        connection.release();
        if(!err){
            res.render('goalplan/new',{ user})
        } else {
            console.log(err);
        }
        console.log('The user data from: \n', user);
        });
    });
}

//post new goal
exports.create = (req, res) => {
    var user_id = req.params.id;
    var title = req.body.title;
    var category = req.body.category;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var description = req.body.description;
    var resources = req.body.resources;
    var reward = req.body.reward;
        
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);

        var sqli = "SELECT * FROM user WHERE id = ? ";
            //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
            if(err)throw(err);
        var sql = "INSERT INTO goals (user_id, title, category, startDate, endDate, description, resources, reward ) VALUES ('"+user_id+"', '"+title+"', '"+category+"', STR_TO_DATE('"+startDate+"', '%d/%m/%Y'), STR_TO_DATE('"+endDate+"', '%d/%m/%Y'), '"+description+"', '"+resources+"', '"+reward+"')";
        //insert goal
        connection.query(sql, (err, goal) => {
            //when done with the connection release it

            var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
            " DATE_FORMAT( endDate,  '%Y' ) - DATE_FORMAT( startDate,  '%Y' ) as years,"+
            " DATE_FORMAT( endDate,  '%m' ) - DATE_FORMAT( startDate,  '%m' ) as months,"+
            " DATE_FORMAT( endDate,  '%d' ) - DATE_FORMAT( startDate,  '%d' ) as days"+
            " FROM goals WHERE user_id = ? AND id = (SELECT LAST_INSERT_ID()) ";
            //Use the connection
            connection.query(sqlg, [req.params.id], (err, goal) => {
                if(err)throw(err);

                var sqls = "SELECT intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate FROM priorities WHERE goal_id = ? ORDER BY intervals ASC ";
                //Use the connection
                connection.query(sqls, [goal[0].id], (err, prior) => {
                //when done with the connection release it
                connection.release();
                if(err)throw(err);

         //get intervalset
        var sqlt = "SELECT intervalset FROM priorities WHERE goal_id = ? AND id = (SELECT LAST_INSERT_ID())";
        //Use the connection
        connection.query(sqlt, [req.params.goalid], (err, int) => {
        //when done with the connection release it
        if(err)throw(err);

                if(!err){
                    res.render('goalplan/priorities', {user, goal, prior, int});
                    var mailOptions = {
                        from:  'fiveplanner@hotmail.com',
                        to: ""+user[0].email+"",
                        subject: "FIVE Planner: New Goal Plan",
                        html: 
                            "<h3>Hello "+user[0].name+", </h3> "+
                            "<p style ='margin-top: 10px;'>You have made a new "+goal[0].category+" goal plan </p>"+
                            "<p style ='margin: 10px;'><b>"+goal[0].title+"</b>, from <b>"+goal[0].startDate+" </b> to <b>"+goal[0].endDate+"</b> </p>"+
                            "<p style ='margin-top: 5px;'>let's do our best to achieve it together.</p>"+
                            "<p class='my-5'><img style='width:50px;' src='cid:unique@cid' alt='' ></p> ",
                
                        attachments:        [
                                    {
                                        filename: '5logo.png',
                                        path: 'public/component/5logo.png',
                                        cid: 'unique@cid'
                                    }
                                ]
                        }
                         // send email
                            transport.sendMail(mailOptions, (err, info) => {
                                if (err) throw(err) 
                                console.log('Message sent');   
                        });
                } else {
                    console.log(err);
                }
                console.log('The user data from: \n', goal);
                });
            });
            });
        });

    });    });
}




//priorities
exports.priorities = (req, res) => {

    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
//get user
        var sqli = "SELECT * FROM user WHERE id = ? ";
        //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
//get goals
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        " DATE_FORMAT( endDate,  '%Y' ) - DATE_FORMAT( startDate,  '%Y' ) as years,"+
        " DATE_FORMAT( endDate,  '%m' ) - DATE_FORMAT( startDate,  '%m' ) as months,"+
        " DATE_FORMAT( endDate,  '%d' ) - DATE_FORMAT( startDate,  '%d' ) as days"+
        " FROM goals WHERE user_id = ? AND id = ? ";
        //Use the connection
        connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
            if(err)throw(err);
//get intervalset
        var sqlt = "SELECT intervalset FROM priorities WHERE goal_id = ? AND id = (SELECT LAST_INSERT_ID())";
        //Use the connection
        connection.query(sqlt, [req.params.goalid], (err, int) => {
        //when done with the connection release it
        if(err)throw(err);

            if(!err){
                res.render('goalplan/priorities',{ user, goal, prior:0, int})
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
            });
        }); 
    });
});
}

//post priorities
exports.addpriorities = (req, res) => {
    var goal_id = req.params.goalid;
    var intervalset  = req.body.intervalset;
    var intervals  = req.body.intervals;
    var priority = req.body.priority;
    var dueDate = req.body.dueDate;

    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
//get user
        var sqli = "SELECT * FROM user WHERE id = ? ";
        //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
//get goals
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        " DATE_FORMAT( endDate,  '%Y' ) - DATE_FORMAT( startDate,  '%Y' ) as years,"+
        " DATE_FORMAT( endDate,  '%m' ) - DATE_FORMAT( startDate,  '%m' ) as months,"+
        " DATE_FORMAT( endDate,  '%d' ) - DATE_FORMAT( startDate,  '%d' ) as days"+
        " FROM goals WHERE user_id = ? AND id = ? ";
        //Use the connection
        connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
            if(err)throw(err);
//insert priorities
            var sql = "INSERT INTO priorities (goal_id, intervalset, intervals, priority, dueDate, checked ) VALUES ('"+goal_id+"', '"+intervalset+"', '"+intervals+"', '"+priority+"', STR_TO_DATE('"+dueDate+"', '%d/%m/%Y'), '')"; 
            //Use the connection
            connection.query(sql, (err, priorities) => {
                if(err)throw(err);
//get priorities
            var sqls = "SELECT id, goal_id, intervalset, intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate FROM priorities WHERE goal_id = ? ";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, prior) => {
                if(err)throw(err);
//get intervals
            var sqlt = "SELECT intervalset, intervals FROM priorities WHERE goal_id = ? AND id = (SELECT LAST_INSERT_ID())";
            //Use the connection
            connection.query(sqlt, [req.params.goalid], (err, int) => {
            //when done with the connection release it
            connection.release();
            if(err)throw(err);

            if(!err){
                res.render('goalplan/priorities',{ user, goal, prior, int})
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
            });
            });
        });
    });
    });
});
}

//overview
exports.goalplan = (req, res) => {
        //Connect to MySQL
        pool.getConnection((err, connection) => {
            if(err) throw err; //not connected
            console.log('Connected as ID ' + connection.threadId);
    //get user
            var sqli = "SELECT * FROM user WHERE id = ? ";
            //Use the connection
            connection.query(sqli, [req.params.id], (err, user) => {
            if(err)throw(err);
    //get goals
            var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
            "  description, resources, reward FROM goals WHERE user_id = ? AND id = ? ";
            //Use the connection
            connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
                if(err)throw(err);
    //get priorities
                var sqls = "SELECT id, goal_id, intervalset, intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate, checked FROM priorities WHERE goal_id = ? ";
                //Use the connection
                connection.query(sqls, [req.params.goalid], (err, prior) => {
                    if(err)throw(err);
    //get distinct values
                var sqls = "SELECT intervalset, intervals FROM priorities WHERE goal_id = ? GROUP BY intervalset, intervals";
                //Use the connection
                connection.query(sqls, [req.params.goalid], (err, dist) => {
                    if(err)throw(err);
                connection.release();
                if(!err){
                    res.render('goalplan/overview',{ user, goal, prior, dist })


                } else {
                    console.log(err);
                }
                console.log('The user data from: \n', user, goal);
                });
            });
        });
    });
});
}

//post checkbox
exports.check = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
    //insert checked value
    var sql = "UPDATE priorities SET checked = 'true' WHERE id = ?"; 
    //Use the connection
    connection.query(sql, [req.params.priorid], (err) => {
        if(err)throw(err);
        //get user
        var sqli = "SELECT * FROM user WHERE id = ? ";
        //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
//get goals
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward FROM goals WHERE user_id = ? AND id = ? ";
        //Use the connection
        connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
            if(err)throw(err);
//get priorities
            var sqls = "SELECT id, goal_id, intervalset, intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate, checked FROM priorities WHERE goal_id = ? ";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, prior) => {
                if(err)throw(err);
//get distinct values
            var sqls = "SELECT intervalset, intervals FROM priorities WHERE goal_id = ? GROUP BY intervalset, intervals";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, dist) => {
                if(err)throw(err);
            connection.release();
            if(!err){
                res.render('goalplan/overview',{ user, goal, prior, dist })
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
            });
        });
    });
});
})
})
}

//post checkbox to uncheck
exports.uncheck = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
    //insert checked value
    var sql = "UPDATE priorities SET checked = ' ' WHERE id = ?"; 
    //Use the connection
    connection.query(sql, [req.params.priorid], (err) => {
        if(err)throw(err);
        //get user
        var sqli = "SELECT * FROM user WHERE id = ? ";
        //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
//get goals
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward FROM goals WHERE user_id = ? AND id = ? ";
        //Use the connection
        connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
            if(err)throw(err);
//get priorities
            var sqls = "SELECT id, goal_id, intervalset, intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate, checked FROM priorities WHERE goal_id = ? ";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, prior) => {
                if(err)throw(err);
//get distinct values
            var sqls = "SELECT intervalset, intervals FROM priorities WHERE goal_id = ? GROUP BY intervalset, intervals";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, dist) => {
                if(err)throw(err);
            connection.release();
            if(!err){
                res.render('goalplan/overview',{ user, goal, prior, dist })
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
            });
        });
    });
});
})
})
}

//progress
exports.track = (req, res) => {
  //Connect to MySQL
  pool.getConnection((err, connection) => {
    if(err) throw err; //not connected
    console.log('Connected as ID ' + connection.threadId);
//get user
    var sqli = "SELECT * FROM user WHERE id = ? ";
    //Use the connection
    connection.query(sqli, [req.params.id], (err, user) => {
    if(err)throw(err);
//get goals
var sqlg = "SELECT *, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate,"+
"   DATEDIFF(endDate, startDate) as Ttime, DATEDIFF(endDate, CURDATE()) as Tleft,  "+
"p.id, p.goal_id, COUNT(*) as tprior, COUNT(IF(checked = 'true', 1, NULL)) 'tick', COUNT(IF(checked = '', 1, NULL)) 'notick', COUNT(DISTINCT(intervalset)) as intset FROM goals as g JOIN priorities as p ON g.id=p.goal_id WHERE user_id = ? GROUP BY  g.id";
//Use the connection
connection.query(sqlg, [req.params.id], (err, goal) => {
    if(err)throw(err);
//get completed
        var sqls = "SELECT c.id, g.id, g.title, COUNT (c.id) as comp, COUNT (g.id) as tgoal, COUNT (g.id) - COUNT (c.id) as gleft FROM complete as c RIGHT JOIN goals as g ON g.id=c.goal_id WHERE user_id = req.params.id ORDER BY g.id";
        //Use the connection
        connection.query(sqls, (err, done) => {
            if(err)throw(err);
        connection.release();
        if(!err){
            res.render('goalplan/progress',{ user, goal, done})
        } else {
            console.log(err);
        }
        console.log('The user data from: \n', user, goal, done);
        });
    });
});
});
}


//delete priority from overview
exports.delprior = (req, res) => {
    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
//delete priority
        var sql = "DELETE FROM priorities WHERE id = ? ";
    //Use the connection
    connection.query(sql, [req.params.priorid], (err, remove) => {
        if(err)throw(err);
//get user
        var sqli = "SELECT * FROM user WHERE id = ? ";
        //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
//get goals
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward FROM goals WHERE user_id = ? AND id = ? ";
        //Use the connection
        connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
            if(err)throw(err);
//get priorities
            var sqls = "SELECT id, goal_id, intervalset, intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate, checked FROM priorities WHERE goal_id = ? ";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, prior) => {
                if(err)throw(err);
//get distinct values
var sqls = "SELECT intervalset, intervals FROM priorities WHERE goal_id = ? GROUP BY intervalset, intervals";
//Use the connection
connection.query(sqls, [req.params.goalid], (err, dist) => {
    if(err)throw(err);
connection.release();

            if(!err){
                res.render('goalplan/overview',{ user, goal, prior, dist, message: "Priority successfully deleted."})
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
            });
        });
    });
});
});
});
}


//delete goal
exports.delgoal = (req, res) => {
    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
//delete goal
        var sql = "DELETE FROM goals WHERE id = ? ";
        //Use the connection
        connection.query(sql, [req.params.goalid], (err, rem) => {
            if(err)throw(err);
//delete priority
        var sqlj = "DELETE FROM priorities WHERE goal_id = ? ";
        //Use the connection
        connection.query(sqlj, [req.params.goalid], (err, remove) => {
            if(err)throw(err);

        var sqli = "SELECT * FROM user WHERE id = ? ";
    //Use the connection
    connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward FROM goals WHERE user_id = ?"; 
        //Use the connection
        connection.query(sqlg, [req.params.id] , (err, goal) => {
            //when done with the connection release it
            var sqlc = "SELECT goal_id FROM complete WHERE user_id = ?";
            //Use the connection
            connection.query(sqlc, [req.params.id], (err, done) => {
                if(err)throw(err);
                connection.release();
            
            if(!err){
                res.render('goalplan/index',{ user, goal, done, message: "Goal plan successfully deleted." })
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
        });
    });
});
});
});
});
}

//view edit goalplan
exports.edit = (req, res) => {
    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
//get user
        var sqli = "SELECT * FROM user WHERE id = ? ";
        //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
//get goals
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward FROM goals WHERE user_id = ? AND id = ? ";
        //Use the connection
        connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
            if(err)throw(err);
//get priorities
            var sqls = "SELECT id, goal_id, intervalset, intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate, checked FROM priorities WHERE goal_id = ? ";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, prior) => {
                if(err)throw(err);
//get distinct values
            var sqls = "SELECT intervalset, intervals FROM priorities WHERE goal_id = ? GROUP BY intervalset, intervals";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, dist) => {
                if(err)throw(err);
            connection.release();
            if(!err){
                res.render('goalplan/edit_goal',{ user, goal, prior, dist })
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
            });
        });
    });
});
});
}

//update goalplan
exports.editgoal = (req, res) => {

    var description = req.body.description;
    var resources = req.body.resources;
    var reward = req.body.reward;
    //Connect to MySQL
pool.getConnection((err, connection) => {
    if(err) throw err; //not connected
    console.log('Connected as ID ' + connection.threadId);
//update goals
    var sqlu = "UPDATE goals SET description = '"+description+"', resources = '"+resources+"', reward = '"+reward+"' WHERE id = ? "; 
    //Use the connection
    connection.query(sqlu, [req.params.goalid], (err, edit) => {
        if(err)throw(err);
//get user
        var sqli = "SELECT * FROM user WHERE id = ? ";
        //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
//get goals
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward FROM goals WHERE user_id = ? AND id = ? ";
        //Use the connection
        connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
            if(err)throw(err);
//get priorities
            var sqls = "SELECT id, goal_id, intervalset, intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate, checked FROM priorities WHERE goal_id = ? ";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, prior) => {
                if(err)throw(err);
//get distinct values
            var sqls = "SELECT intervalset, intervals FROM priorities WHERE goal_id = ? GROUP BY intervalset, intervals";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, dist) => {
                if(err)throw(err);
            connection.release();
            if(!err){
                res.render('goalplan/edit_goal',{ user, goal, prior, dist })
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
            });
        });
    });
});
});
});
}

//update priorities
exports.editprior = (req, res) => {
    var priority = req.body.priority;
    var dueDate = req.body.dueDate;
    //Connect to MySQL
pool.getConnection((err, connection) => {
    if(err) throw err; //not connected
    console.log('Connected as ID ' + connection.threadId);
//update priority
    var sqlu = "UPDATE priorities SET priority = '"+priority+"', dueDate = STR_TO_DATE('"+dueDate+"', '%d/%m/%Y') WHERE id = ? "; 
    //Use the connection
    connection.query(sqlu, [req.params.priorid], (err, edit) => {
        if(err)throw(err);
//get user
        var sqli = "SELECT * FROM user WHERE id = ? ";
        //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
//get goals
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward FROM goals WHERE user_id = ? AND id = ? ";
        //Use the connection
        connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
            if(err)throw(err);
//get priorities
            var sqls = "SELECT id, goal_id, intervalset, intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate, checked FROM priorities WHERE goal_id = ? ";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, prior) => {
                if(err)throw(err);
//get distinct values
            var sqls = "SELECT intervalset, intervals FROM priorities WHERE goal_id = ? GROUP BY intervalset, intervals";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, dist) => {
                if(err)throw(err);
            connection.release();
            if(!err){
                res.render('goalplan/edit_goal',{ user, goal, prior, dist })
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
            });
        });
    });
});
});
});
}

//new priorities
exports.newprior = (req, res) => {
    var goal_id = req.params.goalid;
    var intervalset  = req.body.intervalset;
    var intervals  = req.body.intervals;
    var priority = req.body.priority;
    var dueDate = req.body.dueDate;

    //Connect to MySQL
pool.getConnection((err, connection) => {
    if(err) throw err; //not connected
    console.log('Connected as ID ' + connection.threadId);
//new priority
var sql = "INSERT INTO priorities (goal_id, intervalset, intervals, priority, dueDate ) VALUES ('"+goal_id+"', '"+intervalset+"', '"+intervals+"', '"+priority+"', STR_TO_DATE('"+dueDate+"', '%d/%m/%Y'))"; 
//Use the connection
    connection.query(sql, [req.params.priorid], (err, edit) => {
        if(err)throw(err);
//get user
        var sqli = "SELECT * FROM user WHERE id = ? ";
        //Use the connection
        connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
//get goals
        var sqlg = "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward FROM goals WHERE user_id = ? AND id = ? ";
        //Use the connection
        connection.query(sqlg, [req.params.id, req.params.goalid], (err, goal) => {
            if(err)throw(err);
//get priorities
            var sqls = "SELECT id, goal_id, intervalset, intervals, priority, DATE_FORMAT(dueDate, '%d/%m/%Y') as dueDate, checked FROM priorities WHERE goal_id = ? ";
            //Use the connection
            connection.query(sqls, [req.params.goalid], (err, prior) => {
                if(err)throw(err);
//get distinct values
            var sqlu = "SELECT intervalset, intervals FROM priorities WHERE goal_id = ? GROUP BY intervalset, intervals";
            //Use the connection
            connection.query(sqlu, [req.params.goalid], (err, dist) => {
                if(err)throw(err);
            connection.release();
            if(!err){
                res.render('goalplan/edit_goal',{ user, goal, prior, dist })
            } else {
                console.log(err);
            }
            console.log('The user data from: \n', user, goal);
            });
        });
    });
});
});
});
}

//complete
exports.complete = (req, res) => {
    //Connect to MySQL
    pool.getConnection((err, connection) => {
        if(err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);
        var sqli = "SELECT * FROM user WHERE id = ? ";
    //Use the connection
    connection.query(sqli, [req.params.id], (err, user) => {
        if(err)throw(err);
        var sqls =  "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward, complete FROM goals WHERE user_id = ?"; 
        //Use the connection
        connection.query(sqls, [req.params.id] , (err, goal) => {
            if(err)throw(err);

            //when done with the connection release it
            //insert complete
    var sqlr = "SELECT goal_id FROM complete where goal_id = ?";
    connection.query(sqlr, [req.params.goalid], (err, result) => {
        if (err){
            console.log(err);
        } else if(result.length > 0){
          res.render('goalplan/index',{ user, goal });
        } else {
    var sqlc = "INSERT INTO complete (goal_id, user_id) VALUES ("+req.params.goalid+", "+req.params.id+")";
    //Use the connection
    connection.query(sqlc, (err) => {
    if(err)throw(err);
    var sqlg = "UPDATE goals SET complete = 'true' WHERE id = ? ";
    //Use the connection
    connection.query(sqlg,[req.params.goalid], (err, complete) => {
    if(err)throw(err);
    var sqls =  "SELECT id, title, category, DATE_FORMAT(startDate, '%d/%m/%Y') as startDate, DATE_FORMAT(endDate, '%d/%m/%Y') as endDate ,"+
        "  description, resources, reward, complete FROM goals WHERE user_id = ?"; 
        //Use the connection
        connection.query(sqls, [req.params.id] , (err, goal) => {
            if(err)throw(err);
            connection.release();

                res.render('goalplan/index',{ user, goal })
           
            console.log('The user data from: \n', user, goal);
        });
    });
});
};
});
});
});
});
}