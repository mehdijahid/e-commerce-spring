package com.example.projectecommerce.config;

import com.example.projectecommerce.models.CourseEntity;
import com.example.projectecommerce.models.CourseImageEntity;
import com.example.projectecommerce.models.FormationEntity;
import com.example.projectecommerce.models.UserEntity;
import com.example.projectecommerce.repositories.CourseRepository;
import com.example.projectecommerce.repositories.FormationRepository;
import com.example.projectecommerce.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final FormationRepository formationRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedFormations();
        seedCourses();
    }

    private void seedAdmin() {
        if (userRepository.findByEmail("admin@edufrom.com").isPresent()) {
            return;
        }
        userRepository.save(UserEntity.builder()
                .name("Administrateur")
                .email("admin@edufrom.com")
                .password(passwordEncoder.encode("admin123"))
                .role(UserEntity.Role.ADMIN)
                .build());
    }

    private void seedFormations() {
        if (formationRepository.count() > 0) {
            return;
        }

        formationRepository.save(FormationEntity.builder()
                .title("Développement Web Full Stack")
                .description("Apprenez à construire des applications web complètes avec Spring Boot et React.")
                .category("Informatique")
                .image("/dev_full_stack.jpg")
                .build());

        formationRepository.save(FormationEntity.builder()
                .title("Marketing Digital")
                .description("Maîtrisez le SEO, les réseaux sociaux et le e-commerce.")
                .category("Marketing")
                .image("/images/marketing.png")
                .build());

        formationRepository.save(FormationEntity.builder()
                .title("Design UI/UX")
                .description("Créez des interfaces modernes et une expérience utilisateur optimale.")
                .category("Design")
                .image("/images/uiux.png")
                .build());
    }

    private void seedCourses() {
        formationRepository.updateImageByTitle("Développement Web Full Stack", "/dev_full_stack.jpg");

        FormationEntity fullstack = formationRepository.findByTitle("Développement Web Full Stack")
                .orElseThrow(() -> new IllegalStateException("Formation 'Développement Web Full Stack' introuvable"));

        saveCourse(fullstack, "Introduction à HTML & CSS",
                "Découvrez les bases du web : structure d'une page HTML, balises, sélecteurs CSS, flexbox et mise en page responsive.",
                "/html_css.jpg",
                """
                HTML (HyperText Markup Language) est le langage qui structure chaque page web. Une page est composée de balises qui décrivent le contenu : titres, paragraphes, liens, images et listes.

                Chaque balise s'ouvre et se ferme, comme un conteneur qui entoure son contenu. C'est cette structure hiérarchique, appelée DOM, qui permet aux navigateurs d'interpréter et d'afficher correctement vos pages.

                Le CSS (Cascading Style Sheets) vient ensuite donner du style à cette structure. Les sélecteurs ciblent les éléments, les propriétés définissent leur apparence, et le modèle de boîte organise l'espace entre chaque bloc.
                """,
                "/javascript.png", "/react.png");

        saveCourse(fullstack, "JavaScript moderne",
                "Maîtrisez ES6+, les fonctions fléchées, la programmation asynchrone avec async/await et la manipulation du DOM.",
                "/javascript.png",
                """
                JavaScript est le langage qui rend les pages web interactives. Autrefois limité à des animations simples, il est aujourd'hui utilisé pour construire des applications entières.

                Les fonctions fléchées et la déstructuration apportent une syntaxe plus concise. La programmation asynchrone, avec les promesses puis async/await, permet de charger des données sans bloquer l'interface utilisateur.

                La manipulation du DOM reste au cœur du langage : sélectionner un élément, modifier son contenu, écouter un clic. Tout ce que vous voyez réagir dans une page repose sur ces mécanismes.

                Enfin, les modules ES6 organisent le code en fichiers réutilisables, une étape indispensable avant de se tourner vers des frameworks comme React.
                """,
                "/html_css.jpg", "/php.jfif");

        saveCourse(fullstack, "React & les composants",
                "Créez des interfaces interactives avec React : composants, props, state, hooks et gestion de formulaires.",
                "/react.png",
                """
                React découpe l'interface en composants réutilisables. Chaque composant est une fonction qui reçoit des props et retourne une portion d'interface.

                Le state permet à un composant de mémoriser des données qui évoluent dans le temps : la saisie d'un formulaire, une liste chargée, un état d'affichage. Quand le state change, React met à jour automatiquement l'interface.

                Les hooks, comme useState et useEffect, simplifient la gestion des effets de bord et remplacent les anciennes classes. Ils rendent le code plus lisible et plus facile à tester.

                La gestion des formulaires s'appuie sur les states contrôlés : l'input et le state restent toujours synchronisés, ce qui garantit une expérience fluide et prévisible.
                """,
                "/javascript.png", "/dev_full_stack.jpg");

        saveCourse(fullstack, "PHP & le backend",
                "Construisez des API côté serveur : routage, bases de données, sessions et sécurisation des endpoints.",
                "/php.jfif",
                """
                Le backend est la partie invisible d'une application : il traite les requêtes, accède aux données et renvoie des réponses formatées, généralement en JSON.

                Le routage associe chaque URL à une action du serveur. Un framework comme Spring Boot structure ces routes et facilite la gestion des paramètres et des corps de requêtes.

                La persistance s'appuie sur les bases de données relationnelles. Les sessions permettent de mémoriser l'état d'un utilisateur entre deux requêtes.

                La sécurisation des endpoints est un point crucial : authentification par token JWT, contrôle des rôles, validation des entrées et protection contre les attaques courantes.
                """,
                "/react.png", "/html_css.jpg");
    }

    private void saveCourse(FormationEntity formation, String title, String content, String image,
                            String details, String... embeddedImages) {
        CourseEntity course = courseRepository.findByTitleAndFormationId(title, formation.getId())
                .orElseGet(() -> CourseEntity.builder()
                        .title(title)
                        .formation(formation)
                        .build());

        course.setContent(content);
        course.setDetails(details);
        course.setImage(image);
        course.getImages().clear();

        for (int i = 0; i < embeddedImages.length; i++) {
            course.getImages().add(CourseImageEntity.builder()
                    .course(course)
                    .image(embeddedImages[i])
                    .position(i)
                    .build());
        }

        courseRepository.save(course);
    }
}
