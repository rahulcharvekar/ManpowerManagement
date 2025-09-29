package com.example.paymentreconciliation.utilities.file;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    Optional<UploadedFile> findByFileHash(String fileHash);
    Optional<UploadedFile> findByFilename(String filename);
    Optional<UploadedFile> findByStoredPath(String storedPath);
    List<UploadedFile> findByFileType(String fileType);
    List<UploadedFile> findByStatus(String status);
    List<UploadedFile> findByFileTypeOrderByUploadDateDesc(String fileType);
    List<UploadedFile> findByStatusOrderByUploadDateDesc(String status);
}
