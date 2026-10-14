package com.example.projectecommerce.services;

import com.example.projectecommerce.dto.AdminReviewResponse;
import com.example.projectecommerce.dto.AdminStatsResponse;
import com.example.projectecommerce.dto.AdminUserResponse;
import com.example.projectecommerce.dto.CourseRequest;
import com.example.projectecommerce.dto.CourseResponse;
import com.example.projectecommerce.dto.FormationRequest;
import com.example.projectecommerce.dto.FormationResponse;
import com.example.projectecommerce.dto.UpdateUserRequest;
import com.example.projectecommerce.models.CourseEntity;
import com.example.projectecommerce.models.CourseImageEntity;
import com.example.projectecommerce.models.EnrollmentEntity;
import com.example.projectecommerce.models.FormationEntity;
import com.example.projectecommerce.models.FormationReviewEntity;
import com.example.projectecommerce.models.ReviewEntity;
import com.example.projectecommerce.models.UserEntity;
import com.example.projectecommerce.repositories.CourseRepository;
import com.example.projectecommerce.repositories.EnrollmentRepository;
import com.example.projectecommerce.repositories.FormationRepository;
import com.example.projectecommerce.repositories.FormationReviewRepository;
import com.example.projectecommerce.repositories.ReviewRepository;
import com.example.projectecommerce.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final FormationRepository formationRepository;
    private final CourseRepository courseRepository;
    private final FormationReviewRepository formationReviewRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public FormationResponse createFormation(FormationRequest request) {
        FormationEntity formation = FormationEntity.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .image(request.image())
                .build();
        return toFormationResponse(formationRepository.save(formation));
    }

    @Transactional
    public FormationResponse updateFormation(Long id, FormationRequest request) {
        FormationEntity formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));
        formation.setTitle(request.title());
        formation.setDescription(request.description());
        formation.setCategory(request.category());
        formation.setImage(request.image());
        return toFormationResponse(formationRepository.save(formation));
    }

    @Transactional
    public void deleteFormation(Long id) {
        FormationEntity formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));
        formationRepository.delete(formation);
    }

    @Transactional
    public CourseResponse createCourse(Long formationId, CourseRequest request) {
        FormationEntity formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        CourseEntity course = CourseEntity.builder()
                .title(request.title())
                .content(request.content())
                .details(request.details())
                .image(request.image())
                .formation(formation)
                .build();
        applyImages(course, request.images());
        return toCourseResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));
        course.setTitle(request.title());
        course.setContent(request.content());
        course.setDetails(request.details());
        course.setImage(request.image());
        course.getImages().clear();
        applyImages(course, request.images());
        return toCourseResponse(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));
        courseRepository.delete(course);
    }

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new AdminUserResponse(u.getId(), u.getName(), u.getEmail(),
                        u.getRole().name(), u.isActive()))
                .toList();
    }

    public List<AdminReviewResponse> getAllReviews() {
        List<AdminReviewResponse> reviews = new java.util.ArrayList<>();
        for (ReviewEntity r : reviewRepository.findAll()) {
            reviews.add(new AdminReviewResponse(
                    r.getId(),
                    r.getUser().getName(),
                    "Cours",
                    r.getCourse().getTitle(),
                    r.getRating(),
                    r.getComment()
            ));
        }
        for (FormationReviewEntity r : formationReviewRepository.findAll()) {
            reviews.add(new AdminReviewResponse(
                    r.getId(),
                    r.getUser().getName(),
                    "Formation",
                    r.getFormation().getTitle(),
                    r.getRating(),
                    r.getComment()
            ));
        }
        return reviews;
    }

    @Transactional
    public AdminUserResponse updateUser(Long id, UpdateUserRequest request) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        if (request.role() != null) {
            user.setRole(UserEntity.Role.valueOf(request.role()));
        }
        if (request.active() != null) {
            user.setActive(request.active());
        }
        UserEntity saved = userRepository.save(user);
        return new AdminUserResponse(saved.getId(), saved.getName(), saved.getEmail(),
                saved.getRole().name(), saved.isActive());
    }

    @Transactional
    public void deleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        userRepository.delete(user);
    }

    private void applyImages(CourseEntity course, List<String> images) {
        if (images == null) {
            return;
        }
        for (int i = 0; i < images.size(); i++) {
            String url = images.get(i);
            if (url == null || url.isBlank()) {
                continue;
            }
            course.getImages().add(CourseImageEntity.builder()
                    .course(course)
                    .image(url)
                    .position(i)
                    .build());
        }
    }

    private FormationResponse toFormationResponse(FormationEntity entity) {
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

    private CourseResponse toCourseResponse(CourseEntity entity) {
        return new CourseResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getContent(),
                entity.getImage(),
                false,
                reviewRepository.findAverageRatingByCourseId(entity.getId()),
                reviewRepository.countByCourseId(entity.getId())
        );
    }

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalAdminUsers = userRepository.countByRole(UserEntity.Role.ADMIN);
        long totalRegularUsers = totalUsers - totalAdminUsers;
        long totalFormations = formationRepository.count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = safeCount(() -> enrollmentRepository.count());
        long totalReviews = formationReviewRepository.count() + reviewRepository.count();

        double avgFormationRating = formationRepository.findAll().stream()
                .mapToDouble(f -> formationReviewRepository.findAverageRatingByFormationId(f.getId()))
                .average()
                .orElse(0.0);

        Map<String, Long> formationsByCategory = formationRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        f -> f.getCategory() != null ? f.getCategory() : "Général",
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        List<FormationEntity> allFormations = formationRepository.findAll();

        Map<String, Long> coursesPerFormation = allFormations.stream()
                .collect(Collectors.toMap(
                        FormationEntity::getTitle,
                        f -> courseRepository.countByFormationId(f.getId()),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        Map<String, Long> reviewsPerFormation = allFormations.stream()
                .collect(Collectors.toMap(
                        FormationEntity::getTitle,
                        f -> formationReviewRepository.countByFormationId(f.getId()),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        Map<String, Long> enrollmentsPerFormation = allFormations.stream()
                .collect(Collectors.toMap(
                        FormationEntity::getTitle,
                        f -> safeCount(() -> enrollmentRepository.countByFormationId(f.getId())),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        List<FormationResponse> recentFormations = allFormations.stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .limit(5)
                .map(this::toFormationResponse)
                .toList();

        Map<String, Long> enrollmentsByDate = safeFindAllEnrollments().stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCreatedAt() != null
                                ? e.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM"))
                                : "N/A",
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        return new AdminStatsResponse(
                totalUsers,
                totalAdminUsers,
                totalRegularUsers,
                totalFormations,
                totalCourses,
                totalEnrollments,
                totalReviews,
                avgFormationRating,
                formationsByCategory,
                coursesPerFormation,
                reviewsPerFormation,
                enrollmentsPerFormation,
                enrollmentsByDate,
                recentFormations
        );
    }

    private long safeCount(java.util.function.LongSupplier supplier) {
        try {
            return supplier.getAsLong();
        } catch (Exception e) {
            return 0L;
        }
    }

    private List<EnrollmentEntity> safeFindAllEnrollments() {
        try {
            return enrollmentRepository.findAll();
        } catch (Exception e) {
            return java.util.List.of();
        }
    }
}
