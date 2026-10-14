package com.example.projectecommerce.dto;

public record MyFormationResponse(
        Long id,
        String title,
        String description,
        String category,
        String image,
        long completedCount,
        long totalCount
) {
}
