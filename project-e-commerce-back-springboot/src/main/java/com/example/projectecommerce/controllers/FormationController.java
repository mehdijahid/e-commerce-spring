package com.example.projectecommerce.controllers;

import com.example.projectecommerce.dto.FormationDetailResponse;
import com.example.projectecommerce.dto.FormationResponse;
import com.example.projectecommerce.dto.RatingRequest;
import com.example.projectecommerce.services.FormationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;

    @GetMapping
    public List<FormationResponse> getAllFormations() {
        return formationService.getAllFormations();
    }

    @GetMapping("/{id}")
    public FormationDetailResponse getFormationById(@PathVariable Long id, Authentication authentication) {
        return formationService.getFormationById(id, authentication.getName());
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<Map<String, String>> rateFormation(
            @PathVariable Long id,
            @RequestBody RatingRequest request,
            Authentication authentication) {
        formationService.rateFormation(id, authentication.getName(), request.rating(), request.comment());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
