package com.example.projectecommerce.dto;

public record FormationResponse(
        Long id,
        String title,
        String description,
        String category,
        String image,
        Double averageRating,
        long ratingCount
) {
}
