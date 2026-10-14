package com.example.projectecommerce.controllers;

import com.example.projectecommerce.dto.CourseDetailResponse;
import com.example.projectecommerce.dto.RatingRequest;
import com.example.projectecommerce.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/{id}")
    public CourseDetailResponse getCourseById(@PathVariable Long id, Authentication authentication) {
        return courseService.getCourseDetail(id, authentication.getName());
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<Map<String, String>> rateCourse(@PathVariable Long id,
                                                          @RequestBody RatingRequest request,
                                                          Authentication authentication) {
        courseService.rateCourse(id, authentication.getName(), request.rating(), request.comment());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Map<String, String>> completeCourse(@PathVariable Long id,
                                                              Authentication authentication) {
        courseService.completeCourse(id, authentication.getName());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
