package com.example.projectecommerce.dto;

import java.util.List;

public record CourseRequest(
        String title,
        String content,
        String details,
        String image,
        List<String> images
) {
}
