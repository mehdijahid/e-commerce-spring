package com.example.projectecommerce.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.util.Set;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "jfif"
    );

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucun fichier reçu");
        }
        String filename = sanitize(file.getOriginalFilename());
        if (!isAllowed(filename)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Format non supporté : " + (file.getOriginalFilename() != null ? file.getOriginalFilename() : "(sans extension)")
                            + " (formats autorisés : jpg, jpeg, png, gif, webp, svg, avif, jfif)");
        }

        int dot = filename.lastIndexOf('.');
        String ext = filename.substring(dot + 1).toLowerCase();
        String base = filename.substring(0, dot);
        String uniqueName = base + "_" + System.currentTimeMillis() + "." + ext;

        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(uniqueName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Impossible d'enregistrer le fichier : " + e.getMessage());
        }

        return "/" + uniqueName;
    }

    private String sanitize(String original) {
        String name = original != null ? original : "image";
        name = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}", "")
                .replaceAll("[^a-zA-Z0-9._-]", "_");
        if (name.isBlank()) {
            name = "image";
        }
        return name;
    }

    private boolean isAllowed(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0) {
            return false;
        }
        String ext = filename.substring(dot + 1).toLowerCase();
        return ALLOWED_EXTENSIONS.contains(ext);
    }
}
