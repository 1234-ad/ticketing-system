package com.ticketing.controller;

import com.ticketing.dto.CommentRequest;
import com.ticketing.model.Comment;
import com.ticketing.model.User;
import com.ticketing.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<Comment> addComment(@PathVariable Long ticketId, @Valid @RequestBody CommentRequest commentRequest, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Comment comment = commentService.addComment(ticketId, commentRequest, currentUser);
        return ResponseEntity.ok(comment);
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long ticketId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<Comment> comments = commentService.getCommentsByTicket(ticketId, currentUser);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long ticketId, @PathVariable Long commentId, @Valid @RequestBody CommentRequest commentRequest, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Comment comment = commentService.updateComment(commentId, commentRequest, currentUser);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long ticketId, @PathVariable Long commentId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.ok().build();
    }
}