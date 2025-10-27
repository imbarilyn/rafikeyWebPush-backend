import dotenv from "dotenv";
import  path from 'path';

dotenv.config({path: path.resolve(process.cwd(), '.env')})


export const config = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DATABASE,
    DB_PORT: process.env.DB_PORT,
    SERVER_PORT: process.env.SERVER_PORT,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    DATABASE_URL_RENDER: process.env.DATABASE_URL_RENDER
}

