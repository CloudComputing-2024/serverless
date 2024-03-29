# Email Verification Cloud Function

This cloud function is designed to automate the email verification process for new user accounts. It's triggered by a Pub/Sub event when a new account is created and sends a verification email with a link that expires in 2 minutes. The function also store verification status, verification token and verification token expiration time in the CloudSQL database of webapp.  This function is subscribed to `verify_email`  topic and will be triggered whenever a message is published to it.

## Features

- **Mailchimp Email Delivery**: Use Mailchimp's transactional email service to deliver verification emails.
- **Email Verification Link**: Generate a unique verification token for each new user. Sends a verification email with a unique link for the user to verify their email address.
- **Link Expiration**: The verification link will expire after 2 minutes after they're sent to ensure security.
- **Verification Tracking**: Store verification status, verification token and verification token expiration timestamp to track email status.
## Prerequisites

Before setting up this cloud function, ensure you have:

- Node.js 20 installed.
- Google Cloud Platform access with Cloud Functions and Cloud SQL APIs enabled.
- A Mailchimp account with transactional emails (Mandrill) set up.
- A MySQL database configured in Google Cloud SQL.

## Using Mailchimp for Email Delivery

This function uses the Mailchimp transactional email API for sending out verification emails.

## Environment Variables

Configure the cloud function with these environment variables:

- `DB_HOST` - Your CloudSQL instance's hostname.
- `DB_USER` - Your database user.
- `DB_PASSWORD` - Your database password.
- `DB_NAME` - Your database name.

These variables are set in the Google Cloud Function settings under "Environment variables".
