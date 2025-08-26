package com.ticketing.dto;

import com.ticketing.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TicketRequest {
    @NotBlank
    @Size(max = 200)
    private String subject;

    @NotBlank
    private String description;

    private Priority priority = Priority.MEDIUM;

    private Long assigneeId;

    // Constructors
    public TicketRequest() {}

    public TicketRequest(String subject, String description, Priority priority, Long assigneeId) {
        this.subject = subject;
        this.description = description;
        this.priority = priority;
        this.assigneeId = assigneeId;
    }

    // Getters and Setters
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
}