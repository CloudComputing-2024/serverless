'use strict';
const functions = require('@google-cloud/functions-framework');
const mailchimp = require("@mailchimp/mailchimp_transactional")(
    "md-_p3Ix7gIxMxLW2VQ6Shf-A"
);

const Logger = require('node-json-logger');
const logger = new Logger();

const mysql = require('mysql2/promise');
const {v4: uuidv4} = require('uuid');

const fs = require('fs').promises;

// Configure cloudsql
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function run(firstname, email, verificationLink) {
    const htmlTemplate = await fs.readFile('verification-email.html', 'utf-8');
    const html = htmlTemplate
        .replace('${firstname}', firstname)
        .replace('${verificationLink}', verificationLink);

    const message = {
        from_email: "info@jiapanwei.me",
        subject: "Verify Your Email Address",
        html: html,
        to: [
            {
                email: email,
                type: "to"
            }
        ]
    };

    const response = await mailchimp.messages.send({message});
    logger.info(response);
}

functions.cloudEvent('sendVerificationEmail', async (cloudEvent) => {
    try {
        const eventData = JSON.parse(Buffer.from(cloudEvent.data.message.data, 'base64').toString());
        logger.info({message: "event Data:", eventData});

        const {username, firstName} = eventData;

        // Generate a verification token
        const verificationToken = uuidv4();
        // Token Expired in 2 minutes
        const expirationTimestamp = new Date(Date.now() + 2 * 60 * 1000);
        // Create a verification link
        const verificationLink = `http://jiapanwei.me:8080/verify?token=${verificationToken}`;

        await run(firstName, username, verificationLink);

        // Store verification status and token into cloudsql database
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE webapp.users SET verification_status = ?, verification_token = ?, verification_token_expiration = ? WHERE username = ?',
            ["pending", verificationToken, expirationTimestamp, username]
        );
        await connection.end();

        logger.info(`Verification email sent to ${username}`);
    } catch (error) {
        logger.error("Error sending verification email:", username);
    }
});