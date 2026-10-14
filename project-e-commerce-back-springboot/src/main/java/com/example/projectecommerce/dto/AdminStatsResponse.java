package com.example.projectecommerce.dto;

import java.util.List;
import java.util.Map;

public record AdminStatsResponse(
        long totalUsers,
        long totalAdminUsers,
        long totalRegularUsers,
        long totalFormations,
        long totalCourses,
        long totalEnrollments,
        long totalReviews,
        double averageRating,
        Map<String, Long> formationsByCategory,
        Map<String, Long> coursesPerFormation,
        Map<String, Long> reviewsPerFormation,
        Map<String, Long> enrollmentsPerFormation,
        Map<String, Long> enrollmentsByDate,
        List<FormationResponse> recentFormations
) {
}
