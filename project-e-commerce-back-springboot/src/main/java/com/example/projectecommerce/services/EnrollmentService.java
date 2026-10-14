package com.example.projectecommerce.services;

import com.example.projectecommerce.models.EnrollmentEntity;
import com.example.projectecommerce.models.FormationEntity;
import com.example.projectecommerce.models.UserEntity;
import com.example.projectecommerce.repositories.EnrollmentRepository;
import com.example.projectecommerce.repositories.FormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final FormationRepository formationRepository;
    private final UserService userService;

    @Transactional
    public void enroll(String email, Long formationId) {
        UserEntity user = userService.getUserFromEmail(email);
        if (user == null) throw new RuntimeException("Utilisateur introuvable");

        FormationEntity formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable"));

        if (enrollmentRepository.existsByUserIdAndFormationId(user.getId(), formationId)) {
            throw new RuntimeException("Déjà inscrit à cette formation");
        }

        EnrollmentEntity enrollment = EnrollmentEntity.builder()
                .user(user)
                .formation(formation)
                .progress(0)
                .build();
        enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(String email, Long formationId) {
        UserEntity user = userService.getUserFromEmail(email);
        if (user == null) return false;
        return enrollmentRepository.existsByUserIdAndFormationId(user.getId(), formationId);
    }
}
