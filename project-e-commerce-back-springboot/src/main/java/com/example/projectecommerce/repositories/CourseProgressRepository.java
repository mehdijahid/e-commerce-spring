package com.example.projectecommerce.repositories;

import com.example.projectecommerce.models.CourseProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseProgressRepository extends JpaRepository<CourseProgressEntity, Long> {

    Optional<CourseProgressEntity> findByUserIdAndCourseId(Long userId, Long courseId);

    List<CourseProgressEntity> findAllByUserIdAndCourseIdInAndCompletedTrue(Long userId, List<Long> courseIds);

    List<CourseProgressEntity> findAllByUserIdAndCompletedTrue(Long userId);
}
