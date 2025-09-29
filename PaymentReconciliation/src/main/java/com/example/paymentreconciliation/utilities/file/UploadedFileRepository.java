package com.example.paymentreconciliation.utilities.file;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;
import java.time.LocalDateTime;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    Optional<UploadedFile> findByFileHash(String fileHash);
    Optional<UploadedFile> findByFilename(String filename);
    Optional<UploadedFile> findByStoredPath(String storedPath);
    List<UploadedFile> findByFileType(String fileType);
    List<UploadedFile> findByStatus(String status);
    List<UploadedFile> findByFileTypeOrderByUploadDateDesc(String fileType);
    List<UploadedFile> findByStatusOrderByUploadDateDesc(String status);
    
    // Date-based queries
    @Query("SELECT uf FROM UploadedFile uf WHERE uf.uploadDate BETWEEN :startDate AND :endDate ORDER BY uf.uploadDate DESC")
    List<UploadedFile> findByUploadDateBetweenOrderByUploadDateDesc(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT uf FROM UploadedFile uf WHERE uf.uploadDate >= :date ORDER BY uf.uploadDate DESC")
    List<UploadedFile> findByUploadDateGreaterThanEqualOrderByUploadDateDesc(@Param("date") LocalDateTime date);
    
    @Query("SELECT uf FROM UploadedFile uf WHERE uf.uploadDate <= :date ORDER BY uf.uploadDate DESC")
    List<UploadedFile> findByUploadDateLessThanEqualOrderByUploadDateDesc(@Param("date") LocalDateTime date);
    
    @Query("SELECT uf FROM UploadedFile uf WHERE uf.uploadDate >= :startOfDay AND uf.uploadDate < :startOfNextDay ORDER BY uf.uploadDate DESC")
    List<UploadedFile> findByUploadDateOnly(@Param("startOfDay") LocalDateTime startOfDay, @Param("startOfNextDay") LocalDateTime startOfNextDay);
}
