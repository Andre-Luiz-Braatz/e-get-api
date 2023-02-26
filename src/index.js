const express = require("express");
const md5 = require("md5");
const PORT = 4000;
const app = express();
const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432,
})

app.use(express.json());


// Middleware

function verifyIfExistsData(request, response, next) {
  const {email,password} = request.body;
  console.log("1: ",email,password);

  if (!email || !password)
    return response.status(500).json({ error: "Invalid data!" });
  request.email = email;
  request.password = password;
  return next();
}
function verifyIfExistsUser(request, response, next) {
  const {email} = request;
  const sql = `SELECT * FROM "user" where email ilike '${email}'`;
  pool.query(sql, (error, result) => {
    console.log('error, result: ',email,error, result);
    if (error) return response.status(401).json({msg: 'Unable to register!'});
    else if(result && result.rows && result.rows[0] && result.rows[0].id) 
      return response.status(401).json({msg: 'User already exists!'});
    else next();
  })
}

app.get("/signin",verifyIfExistsData, (request, response) => {
  const {email,password} = request;
  const sql = `SELECT * FROM "user" where email ilike '${email}' and password ilike 
  '${password}'`;
  pool.query(sql, (error, result) => {
    if (error) return response.status(401).json({msg: 'Unable to login!'});
    else response.status(201).json(result.rows)  
  })
});

app.post("/signup",verifyIfExistsData,verifyIfExistsUser, (request, response) => {
  const {email,password} = request;
  const sql = `insert into "user" (email,password) values ('${email}','${password}') returning *`;
  pool.query(sql, (error, result) => {
    if (error) return response.status(401).json({msg: 'Unable to register!'});
    else response.status(201).json(result.rows)  
  })
});

app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
