import * as nodemailer from "nodemailer"
import type { EmailService } from "../domain/services/EmailService"
import { config } from "../config"
import { logger } from "../utils/logger"

export class EmailServiceImpl implements EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass,
      },
    })
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    try {
      // Skip sending emails in development mode if no email credentials are provided
      if (config.environment === "development" && !config.email.auth.user) {
        logger.info("Email sending skipped in development mode", {
          to,
          subject,
        })
        return true
      }

      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        text,
        html: html || text,
      }

      await this.transporter.sendMail(mailOptions)

      logger.info("Email sent successfully", {
        to,
        subject,
      })

      return true
    } catch (error) {
      logger.error("Error sending email", {
        error: error instanceof Error ? error.message : "Unknown error",
        to,
        subject,
      })
      return false
    }
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<boolean> {
    const subject = "Reset Your Password"
    const resetUrl = `${config.services.auth}/reset-password?token=${resetToken}`
    const text = `You requested a password reset. Please click the following link to reset your password: ${resetUrl}. If you did not request this, please ignore this email.`
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Please click the following link to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `

    return this.sendEmail(to, subject, text, html)
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = "Welcome to Supply Stream"
    const text = `Welcome to Supply Stream, ${name}! We're excited to have you on board. You can now log in to your account and start using our platform.`
    const html = `
      <h1>Welcome to Supply Stream!</h1>
      <p>Hello ${name},</p>
      <p>We're excited to have you on board. You can now log in to your account and start using our platform.</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    `

    return this.sendEmail(to, subject, text, html)
  }

  async sendPasswordChanged(to: string): Promise<boolean> {
    const subject = "Your Password Has Been Changed"
    const text = `Your password has been successfully changed. If you did not make this change, please contact our support team immediately.`
    const html = `
      <h1>Password Changed</h1>
      <p>Your password has been successfully changed.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
    `

    return this.sendEmail(to, subject, text, html)
  }

  async sendRequestPublished(to: string, requestTitle: string, requestId: string): Promise<boolean> {
    const subject = "New Procurement Request Published"
    const requestUrl = `${config.services.procurement}/requests/${requestId}`
    const text = `A new procurement request "${requestTitle}" has been published. You can view the details here: ${requestUrl}`
    const html = `
      <h1>New Procurement Request</h1>
      <p>A new procurement request has been published:</p>
      <p><strong>${requestTitle}</strong></p>
      <p>You can view the details <a href="${requestUrl}">here</a>.</p>
    `

    return this.sendEmail(to, subject, text, html)
  }

  async sendBidSubmitted(to: string, requestTitle: string, bidId: string): Promise<boolean> {
    const subject = "New Bid Submitted"
    const bidUrl = `${config.services.bidding}/bids/${bidId}`
    const text = `A new bid has been submitted for your request "${requestTitle}". You can view the details here: ${bidUrl}`
    const html = `
      <h1>New Bid Submitted</h1>
      <p>A new bid has been submitted for your request:</p>
      <p><strong>${requestTitle}</strong></p>
      <p>You can view the details <a href="${bidUrl}">here</a>.</p>
    `

    return this.sendEmail(to, subject, text, html)
  }

  async sendBidStatusChanged(to: string, requestTitle: string, bidId: string, status: string): Promise<boolean> {
    const subject = `Bid Status Changed: ${status}`
    const bidUrl = `${config.services.bidding}/bids/${bidId}`
    const text = `The status of your bid for "${requestTitle}" has been changed to ${status}. You can view the details here: ${bidUrl}`
    const html = `
      <h1>Bid Status Changed</h1>
      <p>The status of your bid for "${requestTitle}" has been changed to <strong>${status}</strong>.</p>
      <p>You can view the details <a href="${bidUrl}">here</a>.</p>
    `

    return this.sendEmail(to, subject, text, html)
  }
}
