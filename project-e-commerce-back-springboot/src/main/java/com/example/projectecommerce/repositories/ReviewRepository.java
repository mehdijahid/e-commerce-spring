package com.example.projectecommerce.repositories;

import com.example.projectecommerce.models.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    Optional<ReviewEntity> findByUserIdAndCourseId(Long userId, Long courseId);

    List<ReviewEntity> findAllByCourseIdOrderByIdAsc(Long courseId);

    @Query("select coalesce(avg(r.rating), 0) from ReviewEntity r where r.course.id = :courseId")
    Double findAverageRatingByCourseId(Long courseId);

    long countByCourseId(Long courseId);
}
