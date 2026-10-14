package com.example.projectecommerce.dto;

public record AdminReviewResponse(
        Long id,
        String userName,
        String targetType,
        String targetTitle,
        Integer rating,
        String comment
) {}
