package com.example.projectecommerce.repositories;

import com.example.projectecommerce.models.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, Long> {

    long countByFormationId(Long formationId);

    Optional<EnrollmentEntity> findByUserIdAndFormationId(Long userId, Long formationId);

    boolean existsByUserIdAndFormationId(Long userId, Long formationId);
}
