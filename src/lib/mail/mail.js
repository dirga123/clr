import debug from 'debug';
import Config from '../../config';
import nodemailer from 'nodemailer';

export default class Mail {
  constructor() {
    const config = new Config();
    this.smtpServer = config.smtpServer;
    this.smtpPort = config.smtpPort;
    this.smtpAgent = config.smtpAgent;
    this.smtpSuffix = config.smtpSuffix;

    const { NODE_ENV } = process.env;
    this.isDebug = (NODE_ENV === 'development');

    if (this.isDebug) {
      debug.enable('mail');
    }
  }

  async sendGSCAccess(subjectVal, bodyVal, context) {
    try {
      debug('mail')(`sendGSCAccess(${this.smtpServer}:${this.smtpPort})`);

      const transporter = await nodemailer.createTransport({
        port: this.smtpPort,
        host: this.smtpServer,
        ignoreTLS: true,
        logger: this.isDebug,
        debug: this.isDebug,
        connectionTimeout: 1000 * 60
      });

      let toVal = context.login;
      const addSuffix = !/^(.*@.*)$/.test(toVal);
      if (addSuffix) {
        toVal += this.smtpSuffix;
      }

      const templateSender = transporter.templateSender({
        subject: subjectVal,
        text: bodyVal
      }, {
        from: this.smtpAgent
      });

      return await templateSender({
        to: toVal
      }, context);
    } catch (e) {
      debug('mail')(`sendGSCAccess error: ${e.message}`);
      throw e.message;
    }
  }
}
