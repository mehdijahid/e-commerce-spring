package com.example.projectecommerce.controllers;

import com.example.projectecommerce.services.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/{formationId}")
    public ResponseEntity<Map<String, String>> enroll(
            @PathVariable Long formationId,
            Authentication authentication) {
        enrollmentService.enroll(authentication.getName(), formationId);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/{formationId}/status")
    public ResponseEntity<Map<String, Boolean>> getStatus(
            @PathVariable Long formationId,
            Authentication authentication) {
        boolean enrolled = enrollmentService.isEnrolled(authentication.getName(), formationId);
        return ResponseEntity.ok(Map.of("enrolled", enrolled));
    }
}
