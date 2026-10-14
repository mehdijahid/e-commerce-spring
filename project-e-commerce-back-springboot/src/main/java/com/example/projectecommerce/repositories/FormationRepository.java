package com.example.projectecommerce.repositories;

import com.example.projectecommerce.models.FormationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface FormationRepository extends JpaRepository<FormationEntity, Long> {

    List<FormationEntity> findAllByOrderByTitleAsc();

    Optional<FormationEntity> findByTitle(String title);

    @Transactional
    @Modifying
    @Query("update FormationEntity f set f.image = :image where f.title = :title")
    int updateImageByTitle(String title, String image);
}
