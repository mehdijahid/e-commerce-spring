package com.example.projectecommerce.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseImageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private CourseEntity course;

    @Column(nullable = false)
    private String image;

    @Column(nullable = false)
    private Integer position; // après quel paragraphe l'image s'affiche (0 = premier)
}
