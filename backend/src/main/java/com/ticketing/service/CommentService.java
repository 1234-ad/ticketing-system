package com.ticketing.service;

import com.ticketing.dto.CommentRequest;
import com.ticketing.exception.AccessDeniedException;
import com.ticketing.exception.ResourceNotFoundException;
import com.ticketing.model.Comment;
import com.ticketing.model.Ticket;
import com.ticketing.model.User;
import com.ticketing.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private EmailService emailService;

    public Comment addComment(Long ticketId, CommentRequest commentRequest, User author) {
        Ticket ticket = ticketService.getTicketById(ticketId);
        
        // Check if user can view/comment on this ticket
        if (!ticketService.canViewTicket(ticket, author)) {
            throw new AccessDeniedException("You don't have permission to comment on this ticket");
        }

        Comment comment = new Comment(commentRequest.getContent(), ticket, author);
        Comment savedComment = commentRepository.save(comment);
        
        // Send notification emails
        emailService.sendCommentAddedEmail(savedComment);
        
        return savedComment;
    }

    public List<Comment> getCommentsByTicket(Long ticketId, User currentUser) {
        Ticket ticket = ticketService.getTicketById(ticketId);
        
        // Check if user can view this ticket
        if (!ticketService.canViewTicket(ticket, currentUser)) {
            throw new AccessDeniedException("You don't have permission to view comments on this ticket");
        }

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
    }

    public Comment updateComment(Long id, CommentRequest commentRequest, User currentUser) {
        Comment comment = getCommentById(id);
        
        // Only comment author can update
        if (!comment.getAuthor().equals(currentUser)) {
            throw new AccessDeniedException("You can only update your own comments");
        }

        comment.setContent(commentRequest.getContent());
        return commentRepository.save(comment);
    }

    public void deleteComment(Long id, User currentUser) {
        Comment comment = getCommentById(id);
        
        // Only comment author or admin can delete
        if (!comment.getAuthor().equals(currentUser) && currentUser.getRole() != com.ticketing.model.Role.ADMIN) {
            throw new AccessDeniedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
}