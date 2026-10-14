package com.example.projectecommerce.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "formation_reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "formation_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormationReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formation_id", nullable = false)
    private FormationEntity formation;

    @Column(nullable = false)
    private Integer rating; // ex: 1 à 5

    @Column(columnDefinition = "TEXT")
    private String comment;
}
