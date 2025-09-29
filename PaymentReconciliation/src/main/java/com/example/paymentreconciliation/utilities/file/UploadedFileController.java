package com.example.paymentreconciliation.utilities.file;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/uploaded-files")
@Tag(name = "Uploaded Files", description = "API for managing and retrieving uploaded files")
public class UploadedFileController {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(UploadedFileController.class);
    
    private final UploadedFileService uploadedFileService;

    public UploadedFileController(UploadedFileService uploadedFileService) {
        this.uploadedFileService = uploadedFileService;
    }

    @Operation(summary = "Get all uploaded files", description = "Retrieve a list of all uploaded files with metadata")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved uploaded files")
    @GetMapping
    public ResponseEntity<List<UploadedFile>> getAllUploadedFiles() {
        log.info("Request to get all uploaded files");
        List<UploadedFile> files = uploadedFileService.getAllUploadedFiles();
        return ResponseEntity.ok(files);
    }

    @Operation(summary = "Get uploaded file by ID", description = "Retrieve metadata for a specific uploaded file")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File metadata retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "File not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UploadedFile> getUploadedFileById(
            @Parameter(description = "ID of the uploaded file", required = true)
            @PathVariable Long id) {
        log.info("Request to get uploaded file by id: {}", id);
        UploadedFile file = uploadedFileService.getUploadedFileById(id);
        return ResponseEntity.ok(file);
    }

    @Operation(summary = "Get uploaded files by type", description = "Retrieve files filtered by file type (e.g., 'workerpayments', 'employerdata')")
    @ApiResponse(responseCode = "200", description = "Files retrieved successfully")
    @GetMapping("/by-type/{fileType}")
    public ResponseEntity<List<UploadedFile>> getUploadedFilesByType(
            @Parameter(description = "Type/category of files to retrieve", required = true)
            @PathVariable String fileType) {
        log.info("Request to get uploaded files by type: {}", fileType);
        List<UploadedFile> files = uploadedFileService.getUploadedFilesByType(fileType);
        return ResponseEntity.ok(files);
    }

    @Operation(summary = "Get uploaded files by status", description = "Retrieve files filtered by processing status (e.g., 'UPLOADED', 'PROCESSED', 'VALIDATED')")
    @ApiResponse(responseCode = "200", description = "Files retrieved successfully")
    @GetMapping("/by-status/{status}")
    public ResponseEntity<List<UploadedFile>> getUploadedFilesByStatus(
            @Parameter(description = "Processing status to filter by", required = true)
            @PathVariable String status) {
        log.info("Request to get uploaded files by status: {}", status);
        List<UploadedFile> files = uploadedFileService.getUploadedFilesByStatus(status);
        return ResponseEntity.ok(files);
    }

    @Operation(summary = "Download uploaded file", description = "Download the actual file content")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File downloaded successfully", 
                    content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE)),
        @ApiResponse(responseCode = "404", description = "File not found"),
        @ApiResponse(responseCode = "500", description = "Error reading file")
    })
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @Parameter(description = "ID of the file to download", required = true)
            @PathVariable Long id) {
        log.info("Request to download file with id: {}", id);
        
        try {
            Resource resource = uploadedFileService.downloadFile(id);
            String contentType = uploadedFileService.getContentType(id);
            UploadedFile fileMetadata = uploadedFileService.getUploadedFileById(id);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename=\"" + fileMetadata.getFilename() + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(resource.contentLength()))
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("Error downloading file with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Preview file content", description = "View file content inline in browser")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File content retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "File not found"),
        @ApiResponse(responseCode = "500", description = "Error reading file")
    })
    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewFile(
            @Parameter(description = "ID of the file to preview", required = true)
            @PathVariable Long id) {
        log.info("Request to preview file with id: {}", id);
        
        try {
            Resource resource = uploadedFileService.downloadFile(id);
            String contentType = uploadedFileService.getContentType(id);
            UploadedFile fileMetadata = uploadedFileService.getUploadedFileById(id);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "inline; filename=\"" + fileMetadata.getFilename() + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("Error previewing file with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Check if file exists", description = "Check if both database record and physical file exist")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File existence check completed"),
        @ApiResponse(responseCode = "404", description = "File not found in database")
    })
    @GetMapping("/{id}/exists")
    public ResponseEntity<Map<String, Object>> checkFileExists(
            @Parameter(description = "ID of the file to check", required = true)
            @PathVariable Long id) {
        log.info("Request to check if file exists with id: {}", id);
        
        try {
            boolean exists = uploadedFileService.fileExists(id);
            UploadedFile fileMetadata = uploadedFileService.getUploadedFileById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", id);
            response.put("filename", fileMetadata.getFilename());
            response.put("exists", exists);
            response.put("status", fileMetadata.getStatus());
            response.put("storedPath", fileMetadata.getStoredPath());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking file existence for id: {}", id, e);
            Map<String, Object> response = new HashMap<>();
            response.put("id", id);
            response.put("exists", false);
            response.put("error", "File not found in database");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @Operation(summary = "Get file metadata", description = "Get detailed metadata about the uploaded file")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Metadata retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "File not found")
    })
    @GetMapping("/{id}/metadata")
    public ResponseEntity<Map<String, Object>> getFileMetadata(
            @Parameter(description = "ID of the file", required = true)
            @PathVariable Long id) {
        log.info("Request to get metadata for file id: {}", id);
        
        try {
            UploadedFile fileMetadata = uploadedFileService.getUploadedFileById(id);
            String contentType = uploadedFileService.getContentType(id);
            boolean physicalExists = uploadedFileService.fileExists(id);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("id", fileMetadata.getId());
            metadata.put("filename", fileMetadata.getFilename());
            metadata.put("fileType", fileMetadata.getFileType());
            metadata.put("fileHash", fileMetadata.getFileHash());
            metadata.put("uploadDate", fileMetadata.getUploadDate());
            metadata.put("uploadedBy", fileMetadata.getUploadedBy() != null ? fileMetadata.getUploadedBy() : "Unknown");
            metadata.put("status", fileMetadata.getStatus());
            metadata.put("totalRecords", fileMetadata.getTotalRecords());
            metadata.put("successCount", fileMetadata.getSuccessCount());
            metadata.put("failureCount", fileMetadata.getFailureCount());
            metadata.put("storedPath", fileMetadata.getStoredPath());
            metadata.put("contentType", contentType);
            metadata.put("physicalFileExists", physicalExists);
            
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            log.error("Error retrieving metadata for file id: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Delete uploaded file", description = "Delete both database record and physical file")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "File deleted successfully"),
        @ApiResponse(responseCode = "404", description = "File not found"),
        @ApiResponse(responseCode = "500", description = "Error deleting file")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUploadedFile(
            @Parameter(description = "ID of the file to delete", required = true)
            @PathVariable Long id) {
        log.info("Request to delete file with id: {}", id);
        
        try {
            uploadedFileService.deleteUploadedFile(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting file with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
