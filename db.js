import { config } from "./config.js"
import mysql from "mysql2/promise";


export const db = await  mysql.createPool({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DATABASE,
    port: config.DB_PORT,
    connectionLimit: 10,
    waitForConnections: true
})