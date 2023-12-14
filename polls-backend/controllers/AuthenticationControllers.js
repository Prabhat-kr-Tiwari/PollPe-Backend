//Registration
const connection = require("../config/database");

class AuthenticationController {
  static Register(req, res) {
    const { userID, name } = req.body;
    console.log(req.body)
    const checkUser = `SELECT * FROM userdata WHERE userID = '${userID}' AND name = '${name}'`;
    connection.query(checkUser, (error, result) => {
      if (error) {
        return res.status(500).json({
          error: error,
        });
      } 
     
        if (result.length > 0) {
         return res.status(409).send("Username already exists");
        } else {
          const insertUserSql =
            "INSERT INTO userdata (userID, name) VALUES (?, ?)";
          connection.query(insertUserSql, [userID, name], (err, result) => {
            if (err) {
              res.status(500).send("Error registering user");
            } else {
              res.status(200).send("User registered successfully");
            }
          });
        }
      
    });
  }



  //login
  static Login(req,res){
    const{userID,name}=req.body
    console.log(req.body)
    const sql = 'SELECT * FROM userdata WHERE userId = ? AND name = ?';
    connection.query(sql, [userID, name], (err, result) => {
        if (err) {
          res.status(500).send('Error logging in');
        } else {
          if (result.length > 0) {
            res.status(200).send('Login successful');
          } else {
            res.status(401).send('Invalid credentials');
          }
        }
      });
  }





}
module.exports=AuthenticationController
