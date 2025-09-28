package com.example.paymentreconciliation.utilities.file;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

/**
 * Utility helpers for persisting uploaded files to the local filesystem.
 */
public final class FileUploadUtility {

    private static final String DEFAULT_FILENAME = "uploaded-file";

    private FileUploadUtility() {
    }

    public static Path store(MultipartFile multipartFile, Path destinationDirectory) throws IOException {
        Objects.requireNonNull(multipartFile, "multipartFile must not be null");
        String originalFilename = Objects.requireNonNullElse(multipartFile.getOriginalFilename(), DEFAULT_FILENAME);
        try (InputStream inputStream = multipartFile.getInputStream()) {
            return store(inputStream, originalFilename, destinationDirectory);
        }
    }

    public static Path store(InputStream inputStream, String filename, Path destinationDirectory) throws IOException {
        Objects.requireNonNull(inputStream, "inputStream must not be null");
        Objects.requireNonNull(destinationDirectory, "destinationDirectory must not be null");
        Files.createDirectories(destinationDirectory);

        String sanitizedFilename = sanitizeFilename(filename);
        String uniqueFilename = makeUniqueFilename(destinationDirectory, sanitizedFilename);
        Path target = destinationDirectory.resolve(uniqueFilename);
        Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        return target;
    }

    private static String sanitizeFilename(String filename) {
        String value = Objects.requireNonNullElse(filename, DEFAULT_FILENAME);
        value = value.replace('\\', '/');
        int lastSlash = value.lastIndexOf('/');
        if (lastSlash >= 0) {
            value = value.substring(lastSlash + 1);
        }
        value = value.replaceAll("[^A-Za-z0-9._-]", "-");
        if (value.isBlank()) {
            value = DEFAULT_FILENAME;
        }
        return value;
    }

    private static String makeUniqueFilename(Path directory, String filename) throws IOException {
        Path candidate = directory.resolve(filename);
        if (!Files.exists(candidate)) {
            return filename;
        }

        String base = filename;
        String extension = "";
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0) {
            base = filename.substring(0, dotIndex);
            extension = filename.substring(dotIndex);
        }

        String unique;
        do {
            unique = base + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;
            candidate = directory.resolve(unique);
        } while (Files.exists(candidate));

        return unique;
    }
}
