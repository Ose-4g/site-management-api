import nodemailer from 'nodemailer';
import logger from '../logger';
import { google } from 'googleapis';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from '../../config';

const { NODEMAILER_USER, EMAIL_FROM, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, NODEMAILER_REFRESH_TOKEN } = env;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({
  refresh_token: NODEMAILER_REFRESH_TOKEN,
});

export const sendMail = async ({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> => {
  try {
    //GET ACCESS TOKEN TO USE TO SEND MAIL
    const { token } = await oAuth2Client.getAccessToken();

    //CREATE TRANSPORTER USING CORRECT CREDENTIALS
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: NODEMAILER_USER,
        refreshToken: NODEMAILER_REFRESH_TOKEN,
        accessToken: token,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
    } as SMTPTransport.Options);

    //VERIFY THE TRANSPORTER
    await transporter.verify();
    //SEND THE EMAIL

    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    logger.error('An error occured while ending email');
    logger.error(err);
  }
};
