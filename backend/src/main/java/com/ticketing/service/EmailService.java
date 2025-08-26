package com.ticketing.service;

import com.ticketing.model.Comment;
import com.ticketing.model.Ticket;
import com.ticketing.model.TicketStatus;
import com.ticketing.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendWelcomeEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Welcome to Ticketing System");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Welcome to our Ticketing System! Your account has been created successfully.\n\n" +
                "Username: %s\n" +
                "Role: %s\n\n" +
                "You can now log in and start using the system.\n\n" +
                "Best regards,\n" +
                "Ticketing System Team",
                user.getFullName(), user.getUsername(), user.getRole()
            ));

            mailSender.send(message);
            logger.info("Welcome email sent to: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendTicketCreatedEmail(Ticket ticket) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(ticket.getCreator().getEmail());
            message.setSubject("Ticket Created - #" + ticket.getId());
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Your ticket has been created successfully.\n\n" +
                "Ticket ID: #%d\n" +
                "Subject: %s\n" +
                "Priority: %s\n" +
                "Status: %s\n\n" +
                "We will review your ticket and get back to you soon.\n\n" +
                "Best regards,\n" +
                "Support Team",
                ticket.getCreator().getFullName(),
                ticket.getId(),
                ticket.getSubject(),
                ticket.getPriority(),
                ticket.getStatus()
            ));

            mailSender.send(message);
            logger.info("Ticket created email sent for ticket: {}", ticket.getId());
        } catch (Exception e) {
            logger.error("Failed to send ticket created email for ticket: {}", ticket.getId(), e);
        }
    }

    @Async
    public void sendTicketAssignedEmail(Ticket ticket) {
        if (ticket.getAssignee() == null) return;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(ticket.getAssignee().getEmail());
            message.setSubject("Ticket Assigned - #" + ticket.getId());
            message.setText(String.format(
                "Dear %s,\n\n" +
                "A ticket has been assigned to you.\n\n" +
                "Ticket ID: #%d\n" +
                "Subject: %s\n" +
                "Priority: %s\n" +
                "Status: %s\n" +
                "Created by: %s\n\n" +
                "Please review and take appropriate action.\n\n" +
                "Best regards,\n" +
                "Ticketing System",
                ticket.getAssignee().getFullName(),
                ticket.getId(),
                ticket.getSubject(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getCreator().getFullName()
            ));

            mailSender.send(message);
            logger.info("Ticket assigned email sent for ticket: {}", ticket.getId());
        } catch (Exception e) {
            logger.error("Failed to send ticket assigned email for ticket: {}", ticket.getId(), e);
        }
    }

    @Async
    public void sendTicketStatusChangedEmail(Ticket ticket, TicketStatus oldStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(ticket.getCreator().getEmail());
            message.setSubject("Ticket Status Updated - #" + ticket.getId());
            message.setText(String.format(
                "Dear %s,\n\n" +
                "The status of your ticket has been updated.\n\n" +
                "Ticket ID: #%d\n" +
                "Subject: %s\n" +
                "Previous Status: %s\n" +
                "Current Status: %s\n\n" +
                "Thank you for using our support system.\n\n" +
                "Best regards,\n" +
                "Support Team",
                ticket.getCreator().getFullName(),
                ticket.getId(),
                ticket.getSubject(),
                oldStatus,
                ticket.getStatus()
            ));

            mailSender.send(message);
            logger.info("Ticket status changed email sent for ticket: {}", ticket.getId());
        } catch (Exception e) {
            logger.error("Failed to send ticket status changed email for ticket: {}", ticket.getId(), e);
        }
    }

    @Async
    public void sendCommentAddedEmail(Comment comment) {
        try {
            Ticket ticket = comment.getTicket();
            
            // Send to ticket creator if comment is not from creator
            if (!comment.getAuthor().equals(ticket.getCreator())) {
                sendCommentNotification(ticket.getCreator(), comment);
            }
            
            // Send to assignee if comment is not from assignee and assignee exists
            if (ticket.getAssignee() != null && 
                !comment.getAuthor().equals(ticket.getAssignee()) &&
                !ticket.getAssignee().equals(ticket.getCreator())) {
                sendCommentNotification(ticket.getAssignee(), comment);
            }
            
            logger.info("Comment added email sent for ticket: {}", ticket.getId());
        } catch (Exception e) {
            logger.error("Failed to send comment added email for comment: {}", comment.getId(), e);
        }
    }

    private void sendCommentNotification(User recipient, Comment comment) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(recipient.getEmail());
        message.setSubject("New Comment on Ticket #" + comment.getTicket().getId());
        message.setText(String.format(
            "Dear %s,\n\n" +
            "A new comment has been added to ticket #%d.\n\n" +
            "Ticket Subject: %s\n" +
            "Comment by: %s\n" +
            "Comment: %s\n\n" +
            "Please log in to view the full conversation.\n\n" +
            "Best regards,\n" +
            "Ticketing System",
            recipient.getFullName(),
            comment.getTicket().getId(),
            comment.getTicket().getSubject(),
            comment.getAuthor().getFullName(),
            comment.getContent()
        ));

        mailSender.send(message);
    }
}