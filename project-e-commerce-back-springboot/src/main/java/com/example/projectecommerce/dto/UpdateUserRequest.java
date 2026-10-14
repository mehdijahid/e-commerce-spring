package com.example.projectecommerce.dto;

public record UpdateUserRequest(
        String role,
        Boolean active
) {}
