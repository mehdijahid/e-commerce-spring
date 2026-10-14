package com.example.projectecommerce.dto;

import java.util.List;

public record FormationDetailResponse(
        Long id,
        String title,
        String description,
        String category,
        String image,
        List<CourseResponse> courses,
        int completedCount,
        int totalCount,
        Double averageRating,
        long ratingCount,
        Integer userRating,
        List<RatingResponse> reviews
) {
}
