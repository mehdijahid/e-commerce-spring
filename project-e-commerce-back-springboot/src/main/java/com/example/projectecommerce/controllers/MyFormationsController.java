package com.example.projectecommerce.controllers;

import com.example.projectecommerce.dto.MyFormationResponse;
import com.example.projectecommerce.services.FormationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/my-formations")
@RequiredArgsConstructor
public class MyFormationsController {

    private final FormationService formationService;

    @GetMapping
    public List<MyFormationResponse> getMyFormations(Authentication authentication) {
        return formationService.getMyFormations(authentication.getName());
    }
}
