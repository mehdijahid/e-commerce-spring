package com.example.projectecommerce.controllers;

import com.example.projectecommerce.dto.AdminReviewResponse;
import com.example.projectecommerce.dto.AdminStatsResponse;
import com.example.projectecommerce.dto.AdminUserResponse;
import com.example.projectecommerce.dto.CourseRequest;
import com.example.projectecommerce.dto.CourseResponse;
import com.example.projectecommerce.dto.FormationRequest;
import com.example.projectecommerce.dto.FormationResponse;
import com.example.projectecommerce.dto.UpdateUserRequest;
import com.example.projectecommerce.services.AdminService;
import com.example.projectecommerce.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final FileStorageService fileStorageService;

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/reviews")
    public List<AdminReviewResponse> getReviews() {
        return adminService.getAllReviews();
    }

    @PutMapping("/users/{id}")
    public AdminUserResponse updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return adminService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/formations")
    public FormationResponse createFormation(@RequestBody FormationRequest request) {
        return adminService.createFormation(request);
    }

    @PutMapping("/formations/{id}")
    public FormationResponse updateFormation(@PathVariable Long id, @RequestBody FormationRequest request) {
        return adminService.updateFormation(id, request);
    }

    @DeleteMapping("/formations/{id}")
    public ResponseEntity<Map<String, String>> deleteFormation(@PathVariable Long id) {
        adminService.deleteFormation(id);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/formations/{formationId}/courses")
    public CourseResponse createCourse(@PathVariable Long formationId, @RequestBody CourseRequest request) {
        return adminService.createCourse(formationId, request);
    }

    @PutMapping("/courses/{id}")
    public CourseResponse updateCourse(@PathVariable Long id, @RequestBody CourseRequest request) {
        return adminService.updateCourse(id, request);
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable Long id) {
        adminService.deleteCourse(id);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
