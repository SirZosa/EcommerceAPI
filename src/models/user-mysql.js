import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const config ={
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DABASE
}

const connection = await mysql.createConnection(config)
await connection.query(`use userdb`)
export class UserModel{
    static async logIn({input}){
        const [user] = await connection.query(
          'SELECT BIN_TO_UUID(id) id, name, lastname, email, password FROM users WHERE email = ?',
          [input.email]
        )
        if(user.length === 0){
            return false
        }
        const passwordValid = await bcrypt.compare(input.password, user[0].password)
        if (!passwordValid) {
            return false;
          }
        const token = jwt.sign(
            { userId: user[0].id, userEmail: user[0].email },
            process.env.JWT_SECRET,
            {
              expiresIn:"12h",
            }
          )
          return token
    }
    
    static async register({input}){
      const {name, lastname, country, state, city, zipcode, street, apartment, phone, email, password} = input
      const [userAlreadyExists] = await connection.query(
        'SELECT BIN_TO_UUID(id) id, name, lastname, email, password FROM users WHERE email = ?',
        [email]
      )
      
      if(userAlreadyExists.length !== 0){
        return {error:'user already exists'}
      }
      
      const hashedPassword = await bcrypt.hash(password, 10)
      try{
        await connection.query(
          'insert into users (name,lastname, country, state, city, zipcode, street, apartment, phone, email,password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
          [name, lastname, country, state, city, zipcode, street, apartment, phone, email, hashedPassword]
        )
        return {message:'user created'}
      }catch(e){
        throw new Error(`Could not create user: ${e.message}`)
      }
  }

  static async profile({input}){
    const {userId} = input
    const [userData] = await connection.query(
      `select name, lastname, country, state, city, zipcode, street, phone, email, BIN_TO_UUID(id) id from users where BIN_TO_UUID(id) = ?`,
      [userId]
    )
    if(userData[0]) return JSON.parse(JSON.stringify(userData[0]))
    return {error:'error'}
  }

  static async editUser({input, id}){
    let userChanges = input
    if(userChanges.password){
      const hashedPassword = await bcrypt.hash(userChanges.password, 10)
      userChanges.password = hashedPassword
    }
    const [userData] = await connection.query(
      `select name, lastname, country, state, city, zipcode, street, phone, email, password from users where BIN_TO_UUID(id) = ?`,
      [id]
    )
    if(!userData[0]) return false
    const updatedUser = {
      name:userData[0].name,
      lastname:userData[0].lastname,
      country:userData[0].country,
      state:userData[0].state,
      city:userData[0].city,
      zipcode:userData[0].zipcode,
      street:userData[0].street,
      phone:userData[0].phone,
      email:userData[0].email,
      password:userData[0].password,
      ...userChanges
    }
    const {name, lastname, country, state, city, zipcode, street, phone, email, password} = updatedUser
    try{
      await connection.query(
        `UPDATE users
        SET name = ?, lastname=?, country=?, state=?, city = ?, zipcode = ?, street = ?, phone = ?, email = ?, password = ?
        WHERE BIN_TO_UUID(id) = ?`,
        [name, lastname, country, state, city, zipcode, street, phone, email, password, id]
      )
      return {message: "Chages saved"}
    }
    catch(e){
      return e
    }
  }

  static async addProduct({input, id}){
    const {productId, name, color, size, price, quantity, subtotal, img} = input
    try{
      await connection.query(
        `insert into cart (user_id, product_id, name, color, size, price, quantity, subtotal, img) 
        values
        (UUID_TO_BIN(?),?,?,?,?,?,?,?,?)`,
        [id, productId, name, color, size, price, quantity, subtotal, img]
      )
      return {message:'product added'}
    }catch(e){
      return e
    }
  }

  static async getCart({id}){
    try{
      const [cart] = await connection.query(
        `select BIN_TO_UUID(id) AS orderId, product_id as productId, name, color, size, price, quantity, subtotal, img from cart where BIN_TO_UUID(user_id) = ?`,
        [id]
      )
      return JSON.parse(JSON.stringify(cart))
    }catch(e){
      return e
    }
  }

  static async deleteProduct({id}){
    try{
      const [deletedProduct] = await connection.query(
        `DELETE FROM cart where BIN_TO_UUID(id) = ?`,
        [id]
      )
      return {message:"product deleted"}
    }
    catch(e){
      return e
    }
  }

  static async createOrder({input, user}){
    const [order_id] = await connection.query(
      'select uuid() as id'
    )
    for(let item of input){
      try{
        const {productId, name, color, size, quantity, subtotal} = item
        await connection.query(
          `insert into orders (order_id, user_id, product_id, name, color, size, quantity, total) values
          (UUID_TO_BIN(?), UUID_TO_BIN(?),?,?,?,?,?,?)`,
          [order_id[0].id ,user, productId, name, color, size, quantity, subtotal]
        )
        await connection.query(
          `DELETE from cart where BIN_TO_UUID(user_id) = ?`,
          [user]
        )
      }catch(e){
        console.log(e)
        return e
      }
    }
    return {message:"order created"}
  }

  static async getOrder({user}){
    try{
      const [userOrder] = await connection.query(
        `SELECT BIN_TO_UUID(order_id) as order_id, name, color, size, quantity, total, created_at from orders where BIN_TO_UUID(user_id) = ?`,
        [user]
      )
      return JSON.parse(JSON.stringify(userOrder))
    }
    catch(e){
      return e
    }
  }
}