package com.ticketing.controller;

import com.ticketing.dto.TicketRequest;
import com.ticketing.model.*;
import com.ticketing.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketRequest ticketRequest, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Ticket ticket = ticketService.createTicket(ticketRequest, currentUser);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping
    public ResponseEntity<Page<Ticket>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Ticket> tickets;
        
        if (currentUser.getRole() == Role.USER) {
            // Regular users can only see their own tickets
            if (search != null && !search.isEmpty()) {
                tickets = ticketService.filterTicketsForUser(currentUser, status, priority, search, pageable);
            } else {
                tickets = ticketService.filterTicketsForUser(currentUser, status, priority, "", pageable);
            }
        } else {
            // Support agents and admins can see all tickets
            if (search != null && !search.isEmpty()) {
                tickets = ticketService.filterTickets(status, priority, assigneeId, search, pageable);
            } else {
                tickets = ticketService.filterTickets(status, priority, assigneeId, "", pageable);
            }
        }
        
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Ticket ticket = ticketService.getTicketById(id);
        
        if (!ticketService.canViewTicket(ticket, currentUser)) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @Valid @RequestBody TicketRequest ticketRequest, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Ticket ticket = ticketService.updateTicket(id, ticketRequest, currentUser);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('SUPPORT_AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTicket(@PathVariable Long id, @RequestBody Map<String, Long> request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long assigneeId = request.get("assigneeId");
        Ticket ticket = ticketService.assignTicket(id, assigneeId, currentUser);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPPORT_AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable Long id, @RequestBody Map<String, TicketStatus> request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        TicketStatus status = request.get("status");
        Ticket ticket = ticketService.updateTicketStatus(id, status, currentUser);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/rate")
    public ResponseEntity<Ticket> rateTicket(@PathVariable Long id, @RequestBody Map<String, Object> request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Integer rating = (Integer) request.get("rating");
        String feedback = (String) request.get("feedback");
        Ticket ticket = ticketService.rateTicket(id, rating, feedback, currentUser);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/my")
    public ResponseEntity<Page<Ticket>> getMyTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Ticket> tickets = ticketService.getTicketsForUser(currentUser, pageable);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('SUPPORT_AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<Ticket>> getAssignedTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Ticket> tickets = ticketService.getTicketsByAssignee(currentUser, pageable);
        return ResponseEntity.ok(tickets);
    }
}