package com.ticketing.repository;

import com.ticketing.model.Priority;
import com.ticketing.model.Ticket;
import com.ticketing.model.TicketStatus;
import com.ticketing.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByCreator(User creator, Pageable pageable);
    Page<Ticket> findByAssignee(User assignee, Pageable pageable);
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
    Page<Ticket> findByPriority(Priority priority, Pageable pageable);
    
    @Query("SELECT t FROM Ticket t WHERE t.creator = :user OR t.assignee = :user")
    Page<Ticket> findByCreatorOrAssignee(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT t FROM Ticket t WHERE " +
           "LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Ticket> findBySearchTerm(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:assigneeId IS NULL OR t.assignee.id = :assigneeId) AND " +
           "(LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> findByFilters(@Param("status") TicketStatus status,
                              @Param("priority") Priority priority,
                              @Param("assigneeId") Long assigneeId,
                              @Param("search") String search,
                              Pageable pageable);
    
    @Query("SELECT t FROM Ticket t WHERE t.creator = :creator AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> findByCreatorAndFilters(@Param("creator") User creator,
                                        @Param("status") TicketStatus status,
                                        @Param("priority") Priority priority,
                                        @Param("search") String search,
                                        Pageable pageable);
    
    List<Ticket> findByStatusOrderByPriorityDescCreatedAtAsc(TicketStatus status);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = :status")
    long countByStatus(@Param("status") TicketStatus status);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignee = :assignee AND t.status = :status")
    long countByAssigneeAndStatus(@Param("assignee") User assignee, @Param("status") TicketStatus status);
}