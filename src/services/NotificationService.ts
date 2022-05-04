import { sendMail } from '../utils/helpers';
import emailTemplate from '../utils/templates/email-template';
import emailTemplateNoButton from '../utils/templates/email-template-no-button';
import logger from '../utils/logger';

export interface INotificationService {
  sendMail(
    to: string,
    subject: string,
    header: string,
    message: string,
    button: boolean,
    buttonText?: string,
    redirectLink?: string
  ): void;
}

//singleton class for notifications.
class NotificationService implements INotificationService {
  private static instance: INotificationService | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) NotificationService.instance = new NotificationService();
    return NotificationService.instance;
  }

  sendMail(
    to: string,
    subject: string,
    header: string,
    message: string,
    button: boolean = true,
    buttonText: string = '',
    redirectLink: string = ''
  ) {
    let html = emailTemplate(header, message, redirectLink, buttonText);
    if (!button) html = emailTemplateNoButton(header, message);

    try {
      sendMail({ to, subject, html });
    } catch (err) {
      logger.error(err);
    }
  }
}

export const notificationService = NotificationService.getInstance();
