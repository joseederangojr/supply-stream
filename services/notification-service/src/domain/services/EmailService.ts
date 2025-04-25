export interface EmailService {
  sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean>
  sendPasswordReset(to: string, resetToken: string): Promise<boolean>
  sendWelcomeEmail(to: string, name: string): Promise<boolean>
  sendPasswordChanged(to: string): Promise<boolean>
  sendRequestPublished(to: string, requestTitle: string, requestId: string): Promise<boolean>
  sendBidSubmitted(to: string, requestTitle: string, bidId: string): Promise<boolean>
  sendBidStatusChanged(to: string, requestTitle: string, bidId: string, status: string): Promise<boolean>
}
