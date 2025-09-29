package com.example.paymentreconciliation.utilities.file;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import com.example.paymentreconciliation.exception.ResourceNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UploadedFileService {
    private static final Logger log = LoggerFactoryProvider.getLogger(UploadedFileService.class);
    
    private final UploadedFileRepository uploadedFileRepository;
    
    public UploadedFileService(UploadedFileRepository uploadedFileRepository) {
        this.uploadedFileRepository = uploadedFileRepository;
    }
    
    @Transactional(readOnly = true)
    public List<UploadedFile> getAllUploadedFiles() {
        log.info("Retrieving all uploaded files");
        return uploadedFileRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public UploadedFile getUploadedFileById(Long id) {
        log.info("Retrieving uploaded file with id: {}", id);
        return uploadedFileRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Uploaded file with id {} not found", id);
                    return new ResourceNotFoundException("Uploaded file not found with id: " + id);
                });
    }
    
    @Transactional(readOnly = true)
    public List<UploadedFile> getUploadedFilesByType(String fileType) {
        log.info("Retrieving uploaded files by type: {}", fileType);
        // Note: You'll need to add this method to the repository
        return uploadedFileRepository.findByFileType(fileType);
    }
    
    @Transactional(readOnly = true)
    public List<UploadedFile> getUploadedFilesByStatus(String status) {
        log.info("Retrieving uploaded files by status: {}", status);
        // Note: You'll need to add this method to the repository
        return uploadedFileRepository.findByStatus(status);
    }
    
    public Resource downloadFile(Long fileId) {
        log.info("Attempting to download file with id: {}", fileId);
        
        UploadedFile uploadedFile = getUploadedFileById(fileId);
        
        try {
            Path filePath = Paths.get(uploadedFile.getStoredPath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                log.info("File download successful for id: {}", fileId);
                return resource;
            } else {
                log.error("File not found or not readable at path: {}", uploadedFile.getStoredPath());
                throw new ResourceNotFoundException("File not found or not readable: " + uploadedFile.getFilename());
            }
        } catch (Exception e) {
            log.error("Error downloading file with id: {}", fileId, e);
            throw new RuntimeException("Error downloading file: " + e.getMessage(), e);
        }
    }
    
    public String getContentType(Long fileId) {
        UploadedFile uploadedFile = getUploadedFileById(fileId);
        
        try {
            Path filePath = Paths.get(uploadedFile.getStoredPath());
            String contentType = Files.probeContentType(filePath);
            String filename = uploadedFile.getFilename();
            
            if (contentType == null) {
                // Fallback based on file extension
                if (filename.endsWith(".csv")) {
                    contentType = "text/csv";
                } else if (filename.endsWith(".xlsx")) {
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                } else if (filename.endsWith(".xls")) {
                    contentType = "application/vnd.ms-excel";
                } else {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }
            }
            
            log.info("Content type for file {}: {}", filename, contentType);
            return contentType;
        } catch (IOException e) {
            log.warn("Could not determine content type for file id: {}, using default", fileId);
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
    }
    
    @Transactional
    public void deleteUploadedFile(Long fileId) {
        log.info("Deleting uploaded file with id: {}", fileId);
        
        UploadedFile uploadedFile = getUploadedFileById(fileId);
        
        try {
            // Delete physical file
            Path filePath = Paths.get(uploadedFile.getStoredPath());
            Files.deleteIfExists(filePath);
            log.info("Physical file deleted: {}", uploadedFile.getStoredPath());
            
            // Delete database record
            uploadedFileRepository.deleteById(fileId);
            log.info("Database record deleted for file id: {}", fileId);
            
        } catch (IOException e) {
            log.error("Error deleting physical file for id: {}", fileId, e);
            // Still delete from database even if physical file deletion fails
            uploadedFileRepository.deleteById(fileId);
            throw new RuntimeException("File deleted from database but physical file deletion failed: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public boolean fileExists(Long fileId) {
        log.info("Checking if file exists for id: {}", fileId);
        
        Optional<UploadedFile> uploadedFileOpt = uploadedFileRepository.findById(fileId);
        if (uploadedFileOpt.isEmpty()) {
            return false;
        }
        
        UploadedFile uploadedFile = uploadedFileOpt.get();
        Path filePath = Paths.get(uploadedFile.getStoredPath());
        boolean exists = Files.exists(filePath) && Files.isReadable(filePath);
        
        log.info("File exists check for id {}: database={}, physical={}", 
                fileId, true, exists);
        
        return exists;
    }
}
