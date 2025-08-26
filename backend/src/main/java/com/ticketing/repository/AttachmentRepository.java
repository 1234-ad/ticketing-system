package com.ticketing.repository;

import com.ticketing.model.Attachment;
import com.ticketing.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTicket(Ticket ticket);
    List<Attachment> findByTicketId(Long ticketId);
}