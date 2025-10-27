import {config} from "../config.js";
import webPush from 'web-push'
import express from 'express'
import {pool} from '../db.js'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url';

const __filepath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filepath);

export const router = express.Router()
const vapidKeys = {
    publicKey: config.VAPID_PUBLIC_KEY,
    privateKey: config.VAPID_PRIVATE_KEY
}

// setting the VAPID keys
webPush.setVapidDetails(
    'mailto: linahmuhonjaimbari@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
)
const filepath =
    router.get('/send-notifications', async (req, res) => {
        try {
            // console.log('This is directory:', fs.__dirname)
            const result = await pool.query("SELECT * FROM subscriptions");
            const rows = result.rows
            await Promise.all(rows.map(async row => {
                // sendNotification(row)
                const subscriptionBody = {
                    endpoint: row.endpoint,
                    keys: {
                        p256dh: row.p256dh,
                        auth: row.auth
                    }
                }
                const dataToSend = JSON.stringify({
                        title: 'Chat Clean up Notice',
                        body: 'Please be notified that chats at least 30days old will be deleted in less than 24 hours'
                    }
                )
                try {
                    await webPush.sendNotification(subscriptionBody, dataToSend)

                } catch (err) {
                    if (err.statusCode === 401 || err.statusCode === 410) {
                        pool.query('DELETE FROM subscriptions WHERE endpoint = $1', [row.endpoint])
                        // fs.appendFileSync(path.resolve(__dirname, `../log.txt`), `\n Subscription removed for endpoint: ${row.endpoint} at ${new Date().toISOString()}`, 'utf8');
                    }

                }


            }))
            // res.status(200).json({message: 'Notifications sent successfully'})
        } catch (err) {
            fs.appendFileSync(path.resolve(__dirname, `../log.txt`), `\n Error in sending notifications at ${new Date().toISOString()}: ${err.message}`, 'utf8');
            res.status(500).json({ message: 'Failed to send notifications' });
        }
    })

// unsubscribe the user from push notifications
router.delete('/unsubscribe', async (req, res) => {
    try {
        const {endpoint} = req.body
        if (!endpoint) {
            return res.status(400).json({message: 'Missing request body'})
        }
        await pool.query('DELETE FROM subscriptions WHERE endpoint = $1', [endpoint])
        console.log('Unsubscribed successfully for endpoint:', endpoint)
        res.status(200).json({message: 'Unsubscribed successfully'})
    } catch (err) {
        console.log('Error in unsubscribing', err)
        res.status(500).json({message: 'Failed to unsubscribe'})
    }
})


router.post('/subscriptions', async (req, res) => {
    console.log(req.body)
    try {
        const subscription = req.body;

        const {endpoint, keys, username} = subscription


        await pool.query(
            "INSERT INTO subscriptions (username, endpoint, p256dh, auth) VALUES ($1, $2, $3, $4)",
            [username, endpoint, keys.p256dh, keys.auth]);
        res.status(201).json({message: "Subscription saved successfully"})
    } catch (err) {
        console.log("Failed to save subscription", err)
        res.status(500).json({error: "Failed to save subscription"})
    }
})

router.get('/test', async (req, res) => {
    try {
        // res.end('Hello there testing is working...')
        res.status(200).json({message: 'API is working'})

    } catch (err) {
        res.status(500).json({message: 'Server error'})
    }
})

