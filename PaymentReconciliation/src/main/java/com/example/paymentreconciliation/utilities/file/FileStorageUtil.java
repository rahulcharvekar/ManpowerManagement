
package com.example.paymentreconciliation.utilities.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.MessageDigest;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

@Component
public class FileStorageUtil {
    private static final Logger log = LoggerFactoryProvider.getLogger(FileStorageUtil.class);
    @Value("${file.upload.base-dir:uploads}")
    private String baseUploadDir;
    private final UploadedFileRepository uploadedFileRepository;

    public FileStorageUtil(UploadedFileRepository uploadedFileRepository) {
        this.uploadedFileRepository = uploadedFileRepository;
    }

    /**
     * Store a file in a category-specific subfolder under the base upload directory.
     * @param file the file to store
     * @param category the subfolder/category (e.g. "workerpayments", "employerdata", "masterdata")
     * @param fileName the file name to use
     * @return the absolute path to the stored file
     */
    public String storeFile(MultipartFile file, String category, String fileName) throws IOException {
        String uploadDir = baseUploadDir + File.separator + category;
        log.info("Resolved baseUploadDir property: {}", baseUploadDir);
        log.info("Resolved uploadDir for category '{}': {}", category, uploadDir);
        File dest = new File(uploadDir, fileName);
        log.info("Resolved destination file path: {}", dest.getAbsolutePath());
        File parentDir = dest.getParentFile();
        if (!parentDir.exists()) {
            boolean created = parentDir.mkdirs();
            log.info("Parent directory {} created: {}", parentDir.getAbsolutePath(), created);
            if (!created && !parentDir.exists()) {
                log.error("Failed to create parent directory: {}", parentDir.getAbsolutePath());
                throw new IOException("Failed to create parent directory: " + parentDir.getAbsolutePath());
            }
        }

        // Check for duplicate filename
        if (uploadedFileRepository.findByFilename(file.getOriginalFilename()).isPresent()) {
            throw new IOException("Duplicate file: a file with the same name already exists.");
        }

        // Save file temporarily to calculate hash
        file.transferTo(dest);
        log.info("File successfully saved to {} (for hash calculation)", dest.getAbsolutePath());

        // Calculate file hash (SHA-256)
        String fileHash;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] fileBytes = Files.readAllBytes(dest.toPath());
            byte[] hashBytes = digest.digest(fileBytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) sb.append(String.format("%02x", b));
            fileHash = sb.toString();
        } catch (Exception e) {
            log.error("Failed to calculate file hash", e);
            fileHash = "";
        }

        // Check for duplicate file hash
        if (!fileHash.isEmpty() && uploadedFileRepository.findByFileHash(fileHash).isPresent()) {
            // Clean up the just-uploaded duplicate file
            dest.delete();
            throw new IOException("Duplicate file: a file with the same content already exists.");
        }

        // Save file metadata to DB
        UploadedFile uploadedFile = new UploadedFile();
        uploadedFile.setFilename(file.getOriginalFilename());
        uploadedFile.setStoredPath(dest.getAbsolutePath());
        uploadedFile.setFileHash(fileHash);
        uploadedFile.setFileType(category);
        uploadedFile.setUploadDate(java.time.LocalDateTime.now());
        uploadedFile.setUploadedBy(null); // Set user if available
        uploadedFile.setTotalRecords(0); // Set after validation if needed
        uploadedFile.setSuccessCount(0);
        uploadedFile.setFailureCount(0);
        uploadedFile.setStatus("UPLOADED");
        uploadedFile.setRequestReferenceNumber(generateRequestReferenceNumber());
        UploadedFile savedFile = uploadedFileRepository.save(uploadedFile);
        log.info("Saved UploadedFile with ID: {}", savedFile.getId());

        return dest.getAbsolutePath();
    }

    /**
     * Store a file and return the UploadedFile entity directly
     * This avoids the need to look up the file record after storing
     */
    public UploadedFile storeFileAndReturnEntity(MultipartFile file, String category, String fileName) throws IOException {
        String uploadDir = baseUploadDir + File.separator + category;
        log.info("Resolved baseUploadDir property: {}", baseUploadDir);
        log.info("Resolved uploadDir for category '{}': {}", category, uploadDir);
        File dest = new File(uploadDir, fileName);
        log.info("Resolved destination file path: {}", dest.getAbsolutePath());
        File parentDir = dest.getParentFile();
        if (!parentDir.exists()) {
            boolean created = parentDir.mkdirs();
            log.info("Parent directory {} created: {}", parentDir.getAbsolutePath(), created);
            if (!created && !parentDir.exists()) {
                log.error("Failed to create parent directory: {}", parentDir.getAbsolutePath());
                throw new IOException("Failed to create parent directory: " + parentDir.getAbsolutePath());
            }
        }

        // Check for duplicate filename
        if (uploadedFileRepository.findByFilename(file.getOriginalFilename()).isPresent()) {
            throw new IOException("Duplicate file: a file with the same name already exists.");
        }

        // Save file temporarily to calculate hash
        file.transferTo(dest);
        log.info("File successfully saved to {} (for hash calculation)", dest.getAbsolutePath());

        // Calculate file hash (SHA-256)
        String fileHash;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] fileBytes = Files.readAllBytes(dest.toPath());
            byte[] hashBytes = digest.digest(fileBytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) sb.append(String.format("%02x", b));
            fileHash = sb.toString();
        } catch (Exception e) {
            log.error("Failed to calculate file hash", e);
            fileHash = "";
        }

        // Check for duplicate file hash
        if (!fileHash.isEmpty() && uploadedFileRepository.findByFileHash(fileHash).isPresent()) {
            // Clean up the just-uploaded duplicate file
            dest.delete();
            throw new IOException("Duplicate file: a file with the same content already exists.");
        }

        // Save file metadata to DB
        UploadedFile uploadedFile = new UploadedFile();
        uploadedFile.setFilename(file.getOriginalFilename());
        uploadedFile.setStoredPath(dest.getAbsolutePath());
        uploadedFile.setFileHash(fileHash);
        uploadedFile.setFileType(category);
        uploadedFile.setUploadDate(java.time.LocalDateTime.now());
        uploadedFile.setUploadedBy(null); // Set user if available
        uploadedFile.setTotalRecords(0); // Set after validation if needed
        uploadedFile.setSuccessCount(0);
        uploadedFile.setFailureCount(0);
        uploadedFile.setStatus("UPLOADED");
        uploadedFile.setRequestReferenceNumber(generateRequestReferenceNumber());
        UploadedFile savedFile = uploadedFileRepository.save(uploadedFile);
        log.info("Saved UploadedFile with ID: {}", savedFile.getId());

        return savedFile;
    }
    
    private String generateRequestReferenceNumber() {
        // Generate request reference number in format: REQ-YYYYMMDD-HHMMSS-XXX
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        String dateTime = now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String sequence = String.format("%03d", (System.currentTimeMillis() % 1000));
        return "REQ-" + dateTime + "-" + sequence;
    }
}