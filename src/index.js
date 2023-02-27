const express = require("express");
const cors = require("cors");
// const md5 = require("md5");
const PORT = 4000;
const app = express();
const Pool = require('pg').Pool

app.use(cors())
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432,
})

// Middleware

app.get("/signin", (request, response) => {
  const {email,password} = request.query;
  if (!email || !password)
    return response.status(500).send();

  const sql = `SELECT * FROM "user" where email ilike '${email}' and password ilike 
  '${password}'`;
  pool.query(sql, (error, result) => {
    if (error) return response.status(401).send();
    else if(!result || !result.rows || !result.rows.length) response.status(401).send()
    else {
      delete result.rows[0].password
      response.status(201).json(result.rows[0]);
    }
  })
});

app.post("/signup", (request, response) => {
  const {email,password} = request.body;
  if (!email || !password)
    return response.status(500).json({ error: "Invalid data!" });

  const sql = `insert into "user" (email,password) values ('${email}','${password}') returning *`;
  pool.query(sql, (error, result) => {
    if (error) return response.status(401).send();
    else if(!result || !result.rows || !result.rows.length) response.status(401).send()
    else {
      delete result.rows[0].password
      response.status(201).json(result.rows[0]);
    }
  })
});

app.get("/category", (request, response) => {
  const {user_id} = request.query;
  if (!user_id)
    return response.status(500).send();

  const sql = `select * from category where user_id = ${user_id} order by created_at desc`;

  pool.query(sql, (error, result) => {
    if (error) return response.status(401).send();
    else response.status(201).json(result.rows);
  })
});

app.post("/category", (request, response) => {
  const {user_id,name,description} = request.body;
  if (!user_id || !name || !description)
    return response.status(500).send();

  const sql = `insert into category (user_id, name,description) 
  values ('${user_id}','${name}','${description}') returning *`;

  pool.query(sql, (error, result) => {
    if (error) return response.status(401).send();
    else response.status(201).json(result.rows);
  })
});
app.put("/category/:id", (request, response) => {
  const {user_id,name,description} = request.body;
  const {id} = request.params;
  if (!user_id || !name || !description || !id)
    return response.status(500).send();

  const sql = `update category set name = '${name}', description = '${description}' 
  where id = ${id} and user_id = ${user_id}
  returning *`;

  pool.query(sql, (error, result) => {
    if (error) return response.status(401).send();
    else response.status(201).json(result.rows);
  })
});

app.get("/product", (request, response) => {
  const {user_id} = request.query;
  if (!user_id)
    return response.status(500).send();

  const sql = `select product.*,category.name as category_name from product 
  inner join category on category.id = product.category_id
  where category.user_id = '${user_id}' order by created_at desc`;

  pool.query(sql, (error, result) => {
    if (error) return response.status(401).send();
    else response.status(201).json(result.rows);
  })
});
app.post("/product", (request, response) => {
  const {user_id,category_id,name,description,value,stock} = request.body;
  if (!user_id || !category_id || !name || !description || !value || !stock)
    return response.status(500).send();
    const sql = `insert into product (category_id,name,description,value,stock)
    values ('${category_id}','${name}','${description}','${value}','${stock}') returning *`;

  pool.query(sql, (error, result) => {
    if (error) return response.status(401).send();
    else response.status(201).json(result.rows);
  })
});

app.put("/product/:id", (request, response) => {
  const {user_id,category_id,name,description,value,stock} = request.body;
  const {id} = request.params;
  if (!user_id || !name || !description || !id)
    return response.status(500).send();

  const sql = `update product set name = '${name}', description = '${description}',
  category_id = '${category_id}', value = '${value}',stock = '${stock}' 
  where id = ${id}
  returning *`;
  pool.query(sql, (error, result) => {
    if (error) return response.status(401).send();
    else response.status(201).json(result.rows);
  })
});

app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
