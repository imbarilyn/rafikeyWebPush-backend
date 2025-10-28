import { config } from "./config.js"
// import mysql from "mysql2/promise";
import pg from 'pg'


const { Pool } = pg


export const  pool = await  new Pool({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DATABASE,
    port: config.DB_PORT,
    max:10,
    min: 4,
    idleTimeoutMillis: 600000,

})

// export const pool = ()=>{
//     return new Pool ({
//         connectionString: config.DATABASE_URL_RENDER,
//         ssl: {
//             rejectUnauthorized: false
//         },
//     })
// }