package com.festora.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.festora.entity.Booking;
import com.festora.entity.EmailLog;
import com.festora.entity.Event;
import com.festora.entity.Ticket;
import com.festora.entity.User;
import com.festora.repository.EmailLogRepository;

import jakarta.mail.internet.MimeMessage;

/**
 * Real-Time Email Notification Service
 * Dispatches styled HTML email notifications matching the Festora UI template.
 */
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:kalashsatypal4@gmail.com}")
    private String senderEmail;

    private final EmailLogRepository emailLogRepository;

    public EmailService(EmailLogRepository emailLogRepository) {
        this.emailLogRepository = emailLogRepository;
    }

    /**
     * Builds HTML template matching Festora's purple header branding.
     */
    private String buildHtmlWrapper(String contentHtml) {
        return String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='utf-8'/>" +
            "<style>" +
            "  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px; color: #1e293b; }" +
            "  .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; }" +
            "  .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 36px 20px; text-align: center; color: #ffffff; }" +
            "  .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }" +
            "  .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500; }" +
            "  .content { padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #334155; }" +
            "  .content h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }" +
            "  .btn-container { text-align: left; margin: 24px 0 16px 0; }" +
            "  .btn { display: inline-block; padding: 12px 28px; background-color: #5850ec; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; }" +
            "  .info-table { width: 100%%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }" +
            "  .info-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }" +
            "  .info-table tr:last-child td { border-bottom: none; }" +
            "  .info-label { font-weight: 600; color: #64748b; width: 40%%; }" +
            "  .info-value { font-weight: 700; color: #0f172a; }" +
            "  .footer { padding: 24px 32px 32px 32px; font-size: 13px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "  <div class='card'>" +
            "    <div class='header'>" +
            "      <h1>FESTORA</h1>" +
            "      <p>Smart Event Management</p>" +
            "    </div>" +
            "    <div class='content'>" +
            "      %s" +
            "    </div>" +
            "    <div class='footer'>" +
            "      If you didn't initiate this request, please ignore this email or contact our support team." +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>",
            contentHtml
        );
    }

    /**
     * Sends HTML email in real-time and logs the entry into the database.
     */
    @Async
    public void sendAndLogHtml(String recipient, String subject, String contentHtml, String plainBody, String notificationType) {
        String status = "SIMULATED";

        try {
            if (mailSender != null && senderEmail != null && !senderEmail.contains("your-email")) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(senderEmail);
                helper.setTo(recipient);
                helper.setSubject(subject);

                String fullHtml = buildHtmlWrapper(contentHtml);
                helper.setText(fullHtml, true);

                mailSender.send(message);
                status = "SENT";
                System.out.println("✅ REAL HTML EMAIL SENT TO: " + recipient);
            } else {
                System.out.println("ℹ️ REAL-TIME EMAIL LOGGED FOR: " + recipient + " [Type: " + notificationType + "]");
            }
        } catch (Exception e) {
            System.err.println("❌ Email dispatch error: " + e.getMessage());
            status = "FAILED";
        }

        try {
            EmailLog log = new EmailLog();
            log.setRecipient(recipient);
            log.setSubject(subject);
            log.setBody(plainBody);
            log.setNotificationType(notificationType);
            log.setStatus(status);
            log.setSentAt(LocalDateTime.now());
            emailLogRepository.save(log);
        } catch (Exception ex) {
            System.err.println("Error saving email log: " + ex.getMessage());
        }
    }

    // 1. Organizer Account Approved Email
    public void sendOrganizerApprovedEmail(User user) {
        String subject = "Welcome to Festora, " + user.getName() + " 🎉";
        String htmlContent = String.format(
            "<h2>Welcome to Festora, %s 🎉</h2>" +
            "<p>Your account has been approved and activated successfully as an <strong>ORGANIZER</strong>. You're all set to start creating events, managing bookings, and more.</p>" +
            "<div class='btn-container'>" +
            "  <a href='http://localhost:5173/login' class='btn'>Login to Festora</a>" +
            "</div>",
            user.getName()
        );
        sendAndLogHtml(user.getEmail(), subject, htmlContent, "Organizer Account Approved: " + user.getEmail(), "ORGANIZER_APPROVED");
    }

    // 2. New Event Creation Submitted to Organizer
    public void sendEventSubmittedToOrganizerEmail(User organizerUser, Event event) {
        String subject = "Event Creation Submitted - " + event.getTitle();
        String htmlContent = String.format(
            "<h2>Event Request Submitted 🎉</h2>" +
            "<p>Hello <strong>%s</strong>, your new event request for <strong>'%s'</strong> has been submitted to the Administrator for approval.</p>" +
            "<table class='info-table'>" +
            "  <tr><td class='info-label'>Event Title</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Start Date</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Venue</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Status</td><td class='info-value' style='color:#f59e0b;'>PENDING APPROVAL</td></tr>" +
            "</table>" +
            "<div class='btn-container'>" +
            "  <a href='http://localhost:5173/organizer/dashboard' class='btn'>View Dashboard</a>" +
            "</div>",
            organizerUser.getName(),
            event.getTitle(),
            event.getTitle(),
            event.getEventStartDatetime(),
            event.getVenue() != null ? event.getVenue().getVenueName() : "TBD"
        );
        sendAndLogHtml(organizerUser.getEmail(), subject, htmlContent, "Event Submitted: " + event.getTitle(), "EVENT_SUBMITTED_SUCCESS");
    }

    // 3. New Event Alert to Admin
    public void sendNewEventSubmittedToAdminEmail(User adminUser, Event event, User organizerUser) {
        String subject = "New Event Request - " + event.getTitle();
        String htmlContent = String.format(
            "<h2>New Event Approval Request ⚡</h2>" +
            "<p>Organizer <strong>%s</strong> (%s) has submitted a new event for approval.</p>" +
            "<table class='info-table'>" +
            "  <tr><td class='info-label'>Event Title</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Organizer</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Start Date</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Seats Available</td><td class='info-value'>%d</td></tr>" +
            "</table>" +
            "<div class='btn-container'>" +
            "  <a href='http://localhost:5173/admin/dashboard' class='btn'>Review in Admin Dashboard</a>" +
            "</div>",
            organizerUser.getName(),
            organizerUser.getEmail(),
            event.getTitle(),
            organizerUser.getName(),
            event.getEventStartDatetime(),
            event.getTotalSeats()
        );
        sendAndLogHtml(adminUser.getEmail(), subject, htmlContent, "Admin Alert: " + event.getTitle(), "ADMIN_NEW_EVENT_ALERT");
    }

    // 4. Event Approved (Success) -> Notify Organizer
    public void sendEventApprovedEmail(User organizerUser, Event event) {
        String subject = "Your Event is LIVE! - " + event.getTitle();
        String htmlContent = String.format(
            "<h2>Your Event is LIVE! 🚀</h2>" +
            "<p>Congratulations <strong>%s</strong>! Your event <strong>'%s'</strong> has been approved by the Administrator and is now published live on Festora.</p>" +
            "<table class='info-table'>" +
            "  <tr><td class='info-label'>Event Title</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Date & Time</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Venue</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Status</td><td class='info-value' style='color:#10b981;'>LIVE ON FESTORA</td></tr>" +
            "</table>" +
            "<div class='btn-container'>" +
            "  <a href='http://localhost:5173/events/%d' class='btn'>View Live Event Page</a>" +
            "</div>",
            organizerUser.getName(),
            event.getTitle(),
            event.getTitle(),
            event.getEventStartDatetime(),
            event.getVenue() != null ? event.getVenue().getVenueName() : "TBD",
            event.getEventId()
        );
        sendAndLogHtml(organizerUser.getEmail(), subject, htmlContent, "Event Approved: " + event.getTitle(), "EVENT_APPROVED_SUCCESS");
    }

    // 5. Event Rejected Notification -> Notify Organizer
    public void sendEventRejectedEmail(User organizerUser, Event event) {
        String subject = "Update on Event Request - " + event.getTitle();
        String htmlContent = String.format(
            "<h2>Event Request Update</h2>" +
            "<p>Hello <strong>%s</strong>, your event creation request for <strong>'%s'</strong> was not approved by the Administrator.</p>" +
            "<p>If you have any questions, please contact our support team.</p>",
            organizerUser.getName(),
            event.getTitle()
        );
        sendAndLogHtml(organizerUser.getEmail(), subject, htmlContent, "Event Rejected: " + event.getTitle(), "EVENT_REJECTED_FAILURE");
    }

    // 6. Ticket Booked Confirmation (Real-Time Booking Email)
    public void sendTicketBookedEmail(User user, Booking booking, List<Ticket> tickets) {
        StringBuilder ticketRows = new StringBuilder();
        for (Ticket t : tickets) {
            ticketRows.append(String.format(
                "<tr><td class='info-label'>Ticket #%s</td><td class='info-value'>Seat: %s</td></tr>",
                t.getTicketNumber(),
                t.getSeatNumber() != null ? t.getSeatNumber() : "General"
            ));
        }

        String subject = "Booking Confirmation - " + booking.getEvent().getTitle() + " 🎟️";
        String htmlContent = String.format(
            "<h2>Booking Confirmation 🎟️</h2>" +
            "<p>Hello <strong>%s</strong>, your ticket booking for <strong>'%s'</strong> has been confirmed successfully!</p>" +
            "<table class='info-table'>" +
            "  <tr><td class='info-label'>Booking ID</td><td class='info-value'>#%d</td></tr>" +
            "  <tr><td class='info-label'>Seats / Tier</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Total Tickets</td><td class='info-value'>%d</td></tr>" +
            "  <tr><td class='info-label'>Total Paid</td><td class='info-value' style='color:#10b981;'>₹%.2f</td></tr>" +
            "  <tr><td class='info-label'>Event Date</td><td class='info-value'>%s</td></tr>" +
            "  <tr><td class='info-label'>Venue</td><td class='info-value'>%s</td></tr>" +
            "  %s" +
            "</table>" +
            "<div class='btn-container'>" +
            "  <a href='http://localhost:5173/my-tickets' class='btn'>View My Tickets & QR Passes</a>" +
            "</div>",
            user.getName(),
            booking.getEvent().getTitle(),
            booking.getBookingId(),
            booking.getSeatNumbers() != null ? booking.getSeatNumbers() : "General",
            booking.getQuantity(),
            booking.getTotalAmount(),
            booking.getEvent().getEventStartDatetime(),
            booking.getEvent().getVenue() != null ? booking.getEvent().getVenue().getVenueName() : "TBD",
            ticketRows.toString()
        );
        sendAndLogHtml(user.getEmail(), subject, htmlContent, "Booking Confirmed: #" + booking.getBookingId(), "TICKET_BOOKED");
    }

    // 7. Event Cancelled / Deleted Notification
    public void sendEventCancelledEmail(User user, Event event) {
        String subject = "Event Cancelled Notice - " + event.getTitle();
        String htmlContent = String.format(
            "<h2>Event Cancellation Notice ⚠️</h2>" +
            "<p>Hello <strong>%s</strong>, we regret to inform you that the event <strong>'%s'</strong> scheduled for <strong>%s</strong> has been cancelled.</p>" +
            "<p>A full refund has been initiated to your original payment method.</p>",
            user.getName(),
            event.getTitle(),
            event.getEventStartDatetime()
        );
        sendAndLogHtml(user.getEmail(), subject, htmlContent, "Event Cancelled: " + event.getTitle(), "EVENT_DELETED_NOTIFICATION");
    }

    // 8. Event Started Notification
    public void sendEventStartedEmail(User user, Event event) {
        String subject = "LIVE NOW: " + event.getTitle() + " has started!";
        String htmlContent = String.format(
            "<h2>Event is LIVE NOW! 🚀</h2>" +
            "<p>Hello <strong>%s</strong>, the event <strong>'%s'</strong> is NOW LIVE at <strong>%s</strong>.</p>" +
            "<p>Please present your digital QR pass at the gate for entry.</p>" +
            "<div class='btn-container'>" +
            "  <a href='http://localhost:5173/my-tickets' class='btn'>Open QR Entry Pass</a>" +
            "</div>",
            user.getName(),
            event.getTitle(),
            event.getVenue() != null ? event.getVenue().getVenueName() : "the venue"
        );
        sendAndLogHtml(user.getEmail(), subject, htmlContent, "Event Started: " + event.getTitle(), "EVENT_STARTED");
    }

    // 9. Event Completed Notification
    public void sendEventCompletedEmail(User user, Event event) {
        String subject = "Event Completed - Thank you for attending " + event.getTitle();
        String htmlContent = String.format(
            "<h2>Event Completed 🎉</h2>" +
            "<p>Hello <strong>%s</strong>, the event <strong>'%s'</strong> has concluded.</p>" +
            "<p>Thank you for attending! We hope you had a fantastic experience on Festora.</p>",
            user.getName(),
            event.getTitle()
        );
        sendAndLogHtml(user.getEmail(), subject, htmlContent, "Event Completed: " + event.getTitle(), "EVENT_COMPLETED");
    }

    // 10. Forgot Password OTP Email
    public void sendForgotPasswordEmail(User user, String resetToken) {
        String subject = "Festora Account - Password Reset Security Code";
        String htmlContent = String.format(
            "<h2>Password Reset Request 🔐</h2>" +
            "<p>Hello <strong>%s</strong>, use the security OTP code below to reset your Festora password:</p>" +
            "<div style='text-align:center; padding: 18px; background:#f1f5f9; border-radius:12px; margin:20px 0;'>" +
            "  <span style='font-size:32px; font-weight:800; letter-spacing:6px; color:#5850ec;'>%s</span>" +
            "</div>" +
            "<p>This code is valid for 15 minutes.</p>",
            user.getName(),
            resetToken
        );
        sendAndLogHtml(user.getEmail(), subject, htmlContent, "OTP Reset Code: " + resetToken, "FORGOT_PASSWORD");
    }

    public List<EmailLog> getAllEmailLogs() {
        return emailLogRepository.findAllByOrderBySentAtDesc();
    }
}
