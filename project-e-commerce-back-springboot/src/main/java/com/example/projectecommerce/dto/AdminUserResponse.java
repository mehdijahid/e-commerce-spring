package com.example.projectecommerce.dto;

public record AdminUserResponse(
        Long id,
        String name,
        String email,
        String role,
        boolean active
) {}
