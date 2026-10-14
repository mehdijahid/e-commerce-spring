package com.example.projectecommerce.repositories;

import com.example.projectecommerce.models.CourseEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<CourseEntity, Long> {

    List<CourseEntity> findAllByFormationIdOrderByIdAsc(Long formationId);

    @EntityGraph(attributePaths = "images")
    Optional<CourseEntity> findByTitleAndFormationId(String title, Long formationId);

    long countByFormationId(Long formationId);
}
