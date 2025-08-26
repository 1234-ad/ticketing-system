package com.ticketing.service;

import com.ticketing.dto.TicketRequest;
import com.ticketing.exception.AccessDeniedException;
import com.ticketing.exception.ResourceNotFoundException;
import com.ticketing.model.*;
import com.ticketing.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TicketService {
    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    public Ticket createTicket(TicketRequest ticketRequest, User creator) {
        Ticket ticket = new Ticket(
                ticketRequest.getSubject(),
                ticketRequest.getDescription(),
                ticketRequest.getPriority(),
                creator
        );

        if (ticketRequest.getAssigneeId() != null) {
            User assignee = userService.getUserById(ticketRequest.getAssigneeId());
            if (assignee.getRole() == Role.SUPPORT_AGENT || assignee.getRole() == Role.ADMIN) {
                ticket.setAssignee(assignee);
            }
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Send notification emails
        emailService.sendTicketCreatedEmail(savedTicket);
        if (savedTicket.getAssignee() != null) {
            emailService.sendTicketAssignedEmail(savedTicket);
        }
        
        return savedTicket;
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    public Page<Ticket> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable);
    }

    public Page<Ticket> getTicketsByCreator(User creator, Pageable pageable) {
        return ticketRepository.findByCreator(creator, pageable);
    }

    public Page<Ticket> getTicketsByAssignee(User assignee, Pageable pageable) {
        return ticketRepository.findByAssignee(assignee, pageable);
    }

    public Page<Ticket> getTicketsForUser(User user, Pageable pageable) {
        if (user.getRole() == Role.USER) {
            return ticketRepository.findByCreator(user, pageable);
        } else {
            return ticketRepository.findByCreatorOrAssignee(user, pageable);
        }
    }

    public Page<Ticket> searchTickets(String search, Pageable pageable) {
        return ticketRepository.findBySearchTerm(search, pageable);
    }

    public Page<Ticket> filterTickets(TicketStatus status, Priority priority, Long assigneeId, String search, Pageable pageable) {
        return ticketRepository.findByFilters(status, priority, assigneeId, search, pageable);
    }

    public Page<Ticket> filterTicketsForUser(User creator, TicketStatus status, Priority priority, String search, Pageable pageable) {
        return ticketRepository.findByCreatorAndFilters(creator, status, priority, search, pageable);
    }

    public Ticket updateTicket(Long id, TicketRequest ticketRequest, User currentUser) {
        Ticket ticket = getTicketById(id);
        
        // Check permissions
        if (!canModifyTicket(ticket, currentUser)) {
            throw new AccessDeniedException("You don't have permission to modify this ticket");
        }

        ticket.setSubject(ticketRequest.getSubject());
        ticket.setDescription(ticketRequest.getDescription());
        ticket.setPriority(ticketRequest.getPriority());

        return ticketRepository.save(ticket);
    }

    public Ticket assignTicket(Long id, Long assigneeId, User currentUser) {
        Ticket ticket = getTicketById(id);
        
        // Check permissions
        if (!canAssignTicket(ticket, currentUser)) {
            throw new AccessDeniedException("You don't have permission to assign this ticket");
        }

        User oldAssignee = ticket.getAssignee();
        User newAssignee = null;
        
        if (assigneeId != null) {
            newAssignee = userService.getUserById(assigneeId);
            if (newAssignee.getRole() != Role.SUPPORT_AGENT && newAssignee.getRole() != Role.ADMIN) {
                throw new IllegalArgumentException("Can only assign tickets to support agents or admins");
            }
        }

        ticket.setAssignee(newAssignee);
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Send notification emails
        if (newAssignee != null && !newAssignee.equals(oldAssignee)) {
            emailService.sendTicketAssignedEmail(savedTicket);
        }
        
        return savedTicket;
    }

    public Ticket updateTicketStatus(Long id, TicketStatus status, User currentUser) {
        Ticket ticket = getTicketById(id);
        
        // Check permissions
        if (!canUpdateTicketStatus(ticket, currentUser)) {
            throw new AccessDeniedException("You don't have permission to update this ticket status");
        }

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(status);
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Send notification emails
        if (!status.equals(oldStatus)) {
            emailService.sendTicketStatusChangedEmail(savedTicket, oldStatus);
        }
        
        return savedTicket;
    }

    public Ticket rateTicket(Long id, Integer rating, String feedback, User currentUser) {
        Ticket ticket = getTicketById(id);
        
        // Only ticket creator can rate
        if (!ticket.getCreator().equals(currentUser)) {
            throw new AccessDeniedException("Only ticket creator can rate the resolution");
        }
        
        // Can only rate resolved or closed tickets
        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new IllegalArgumentException("Can only rate resolved or closed tickets");
        }

        ticket.setRating(rating);
        ticket.setFeedback(feedback);
        
        return ticketRepository.save(ticket);
    }

    private boolean canModifyTicket(Ticket ticket, User user) {
        return user.getRole() == Role.ADMIN || 
               ticket.getCreator().equals(user) ||
               (user.getRole() == Role.SUPPORT_AGENT && ticket.getAssignee() != null && ticket.getAssignee().equals(user));
    }

    private boolean canAssignTicket(Ticket ticket, User user) {
        return user.getRole() == Role.ADMIN || 
               (user.getRole() == Role.SUPPORT_AGENT && (ticket.getAssignee() == null || ticket.getAssignee().equals(user)));
    }

    private boolean canUpdateTicketStatus(Ticket ticket, User user) {
        return user.getRole() == Role.ADMIN || 
               (user.getRole() == Role.SUPPORT_AGENT && ticket.getAssignee() != null && ticket.getAssignee().equals(user));
    }

    public boolean canViewTicket(Ticket ticket, User user) {
        return user.getRole() == Role.ADMIN || 
               ticket.getCreator().equals(user) ||
               (ticket.getAssignee() != null && ticket.getAssignee().equals(user));
    }
}