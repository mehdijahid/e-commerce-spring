package com.example.projectecommerce.dto;

import java.util.List;

public record CourseDetailResponse(
        Long id,
        String title,
        String content,
        String details,
        String image,
        List<CourseImageResponse> images,
        Integer userRating,
        Double averageRating,
        long ratingCount,
        boolean completed,
        List<RatingResponse> reviews
) {
}
