package com.example.projectecommerce.services;

import com.example.projectecommerce.dto.CourseDetailResponse;
import com.example.projectecommerce.dto.CourseImageResponse;
import com.example.projectecommerce.dto.RatingResponse;
import com.example.projectecommerce.models.CourseEntity;
import com.example.projectecommerce.models.CourseImageEntity;
import com.example.projectecommerce.models.CourseProgressEntity;
import com.example.projectecommerce.models.ReviewEntity;
import com.example.projectecommerce.models.UserEntity;
import com.example.projectecommerce.repositories.CourseProgressRepository;
import com.example.projectecommerce.repositories.CourseRepository;
import com.example.projectecommerce.repositories.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ReviewRepository reviewRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public CourseDetailResponse getCourseDetail(Long courseId, String email) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        UserEntity user = userService.getUserFromEmail(email);
        Integer userRating = null;
        boolean completed = false;
        if (user != null) {
            ReviewEntity review = reviewRepository.findByUserIdAndCourseId(user.getId(), courseId).orElse(null);
            if (review != null) {
                userRating = review.getRating();
            }
            completed = courseProgressRepository.findByUserIdAndCourseId(user.getId(), courseId)
                    .map(CourseProgressEntity::isCompleted)
                    .orElse(false);
        }

        List<CourseImageResponse> images = course.getImages().stream()
                .sorted(Comparator.comparing(CourseImageEntity::getPosition))
                .map(img -> new CourseImageResponse(img.getPosition(), img.getImage()))
                .toList();

        Double average = reviewRepository.findAverageRatingByCourseId(courseId);
        long count = reviewRepository.countByCourseId(courseId);

        List<RatingResponse> reviews = reviewRepository.findAllByCourseIdOrderByIdAsc(courseId).stream()
                .map(r -> new RatingResponse(
                        r.getId(),
                        r.getUser().getName(),
                        r.getRating(),
                        r.getComment()))
                .toList();

        return new CourseDetailResponse(
                course.getId(),
                course.getTitle(),
                course.getContent(),
                course.getDetails(),
                course.getImage(),
                images,
                userRating,
                average,
                count,
                completed,
                reviews
        );
    }

    @Transactional
    public void rateCourse(Long courseId, String email, Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("La note doit être comprise entre 1 et 5");
        }

        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));
        UserEntity user = userService.getUserFromEmail(email);
        if (user == null) {
            throw new RuntimeException("Utilisateur introuvable");
        }

        ReviewEntity review = reviewRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseGet(() -> ReviewEntity.builder()
                        .user(user)
                        .course(course)
                        .build());
        review.setRating(rating);
        review.setComment(comment);
        reviewRepository.save(review);
    }

    @Transactional
    public void completeCourse(Long courseId, String email) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));
        UserEntity user = userService.getUserFromEmail(email);
        if (user == null) {
            throw new RuntimeException("Utilisateur introuvable");
        }

        CourseProgressEntity progress = courseProgressRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseGet(() -> CourseProgressEntity.builder()
                        .user(user)
                        .course(course)
                        .build());
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        courseProgressRepository.save(progress);
    }
}
