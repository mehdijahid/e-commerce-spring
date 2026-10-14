package com.example.projectecommerce.services;

import com.example.projectecommerce.dto.CourseResponse;
import com.example.projectecommerce.dto.FormationDetailResponse;
import com.example.projectecommerce.dto.FormationResponse;
import com.example.projectecommerce.dto.MyFormationResponse;
import com.example.projectecommerce.dto.RatingResponse;
import com.example.projectecommerce.models.CourseEntity;
import com.example.projectecommerce.models.CourseProgressEntity;
import com.example.projectecommerce.models.FormationEntity;
import com.example.projectecommerce.models.FormationReviewEntity;
import com.example.projectecommerce.models.UserEntity;
import com.example.projectecommerce.repositories.CourseProgressRepository;
import com.example.projectecommerce.repositories.CourseRepository;
import com.example.projectecommerce.repositories.FormationRepository;
import com.example.projectecommerce.repositories.FormationReviewRepository;
import com.example.projectecommerce.repositories.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final CourseRepository courseRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final FormationReviewRepository formationReviewRepository;
    private final ReviewRepository reviewRepository;
    private final UserService userService;

    public List<FormationResponse> getAllFormations() {
        return formationRepository.findAllByOrderByTitleAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FormationDetailResponse getFormationById(Long id, String email) {
        FormationEntity entity = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        List<CourseEntity> courseEntities = courseRepository.findAllByFormationIdOrderByIdAsc(id);

        Set<Long> completedCourseIds = new HashSet<>();
        UserEntity user = userService.getUserFromEmail(email);
        if (user != null && !courseEntities.isEmpty()) {
            List<Long> courseIds = courseEntities.stream().map(CourseEntity::getId).toList();
            courseProgressRepository.findAllByUserIdAndCourseIdInAndCompletedTrue(user.getId(), courseIds)
                    .stream()
                    .map(CourseProgressEntity::getCourse)
                    .map(CourseEntity::getId)
                    .forEach(completedCourseIds::add);
        }

        List<CourseResponse> courses = courseEntities.stream()
                .map(c -> toCourseResponse(c, completedCourseIds.contains(c.getId())))
                .toList();

        Double average = formationReviewRepository.findAverageRatingByFormationId(id);
        long count = formationReviewRepository.countByFormationId(id);
        Integer userRating = null;
        if (user != null) {
            FormationReviewEntity userReview = formationReviewRepository
                    .findByUserIdAndFormationId(user.getId(), id).orElse(null);
            if (userReview != null) {
                userRating = userReview.getRating();
            }
        }

        List<RatingResponse> reviews = formationReviewRepository.findAllByFormationIdOrderByIdAsc(id).stream()
                .map(r -> new RatingResponse(
                        r.getId(),
                        r.getUser().getName(),
                        r.getRating(),
                        r.getComment()))
                .toList();

        return new FormationDetailResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getImage(),
                courses,
                completedCourseIds.size(),
                courses.size(),
                average,
                count,
                userRating,
                reviews
        );
    }

    @Transactional
    public void rateFormation(Long formationId, String email, Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("La note doit être comprise entre 1 et 5");
        }

        FormationEntity formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));
        UserEntity user = userService.getUserFromEmail(email);
        if (user == null) {
            throw new RuntimeException("Utilisateur introuvable");
        }

        FormationReviewEntity review = formationReviewRepository
                .findByUserIdAndFormationId(user.getId(), formationId)
                .orElseGet(() -> FormationReviewEntity.builder()
                        .user(user)
                        .formation(formation)
                        .build());
        review.setRating(rating);
        review.setComment(comment);
        formationReviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public List<MyFormationResponse> getMyFormations(String email) {
        UserEntity user = userService.getUserFromEmail(email);
        if (user == null) {
            return List.of();
        }
        List<CourseProgressEntity> progress = courseProgressRepository.findAllByUserIdAndCompletedTrue(user.getId());
        if (progress.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> completedByFormation = new HashMap<>();
        for (CourseProgressEntity p : progress) {
            CourseEntity course = p.getCourse();
            if (course != null && course.getFormation() != null) {
                completedByFormation.merge(course.getFormation().getId(), 1L, Long::sum);
            }
        }
        if (completedByFormation.isEmpty()) {
            return List.of();
        }

        return formationRepository.findAllByOrderByTitleAsc().stream()
                .filter(f -> completedByFormation.containsKey(f.getId()))
                .map(f -> new MyFormationResponse(
                        f.getId(),
                        f.getTitle(),
                        f.getDescription(),
                        f.getCategory(),
                        f.getImage(),
                        completedByFormation.get(f.getId()),
                        f.getCourses().size()))
                .toList();
    }

    private FormationResponse toResponse(FormationEntity entity) {
        return new FormationResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getImage(),
                formationReviewRepository.findAverageRatingByFormationId(entity.getId()),
                formationReviewRepository.countByFormationId(entity.getId())
        );
    }

    private CourseResponse toCourseResponse(CourseEntity entity, boolean completed) {
        return new CourseResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getContent(),
                entity.getImage(),
                completed,
                reviewRepository.findAverageRatingByCourseId(entity.getId()),
                reviewRepository.countByCourseId(entity.getId())
        );
    }
}
