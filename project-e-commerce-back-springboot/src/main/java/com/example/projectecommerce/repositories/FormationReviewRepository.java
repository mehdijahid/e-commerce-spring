package com.example.projectecommerce.repositories;

import com.example.projectecommerce.models.FormationReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FormationReviewRepository extends JpaRepository<FormationReviewEntity, Long> {

    Optional<FormationReviewEntity> findByUserIdAndFormationId(Long userId, Long formationId);

    List<FormationReviewEntity> findAllByFormationIdOrderByIdAsc(Long formationId);

    @Query("select coalesce(avg(r.rating), 0) from FormationReviewEntity r where r.formation.id = :formationId")
    Double findAverageRatingByFormationId(Long formationId);

    long countByFormationId(Long formationId);
}
