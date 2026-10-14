package com.example.projectecommerce.dto;

public record CourseResponse(
        Long id,
        String title,
        String content,
        String image,
        boolean completed,
        Double averageRating,
        long ratingCount
) {
}
