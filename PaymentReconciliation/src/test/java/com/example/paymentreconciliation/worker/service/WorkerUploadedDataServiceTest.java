package com.example.paymentreconciliation.worker.service;

import com.example.paymentreconciliation.worker.entity.WorkerUploadedData;
import com.example.paymentreconciliation.worker.repository.WorkerUploadedDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class WorkerUploadedDataServiceTest {

    @Mock
    private WorkerUploadedDataRepository repository;

    @InjectMocks
    private WorkerUploadedDataService service;

    private String testFileId;

    @BeforeEach
    void setUp() {
        testFileId = "test-file-123";
    }

    @Test
    void testValidateUploadedData_ValidRecord() {
        // Arrange
        WorkerUploadedData validRecord = createValidRecord();
        List<WorkerUploadedData> records = Arrays.asList(validRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("VALIDATED", validRecord.getStatus());
        assertNull(validRecord.getRejectionReason());
        assertNotNull(validRecord.getValidatedAt());
        verify(repository).saveAll(records);
    }

    @Test
    void testValidateUploadedData_MissingWorkerName() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setWorkerName(null); // Missing worker name
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        assertTrue(invalidRecord.getRejectionReason().contains("Worker name is required"));
    }

    @Test
    void testValidateUploadedData_InvalidEmail() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setEmail("invalid-email"); // Invalid email format
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        assertTrue(invalidRecord.getRejectionReason().contains("Invalid email format"));
    }

    @Test
    void testValidateUploadedData_NegativeHours() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setHoursWorked(new BigDecimal("-2.00")); // Negative hours
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        assertTrue(invalidRecord.getRejectionReason().contains("Hours worked must be greater than 0"));
    }

    @Test
    void testValidateUploadedData_ZeroPayment() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setPaymentAmount(BigDecimal.ZERO); // Zero payment
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        assertTrue(invalidRecord.getRejectionReason().contains("Valid payment amount greater than 0 is required"));
    }

    @Test
    void testValidateUploadedData_FutureWorkDate() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setWorkDate(LocalDate.now().plusDays(1)); // Future date
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        assertTrue(invalidRecord.getRejectionReason().contains("Work date cannot be in the future"));
    }

    @Test
    void testValidateUploadedData_LongWorkerName() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setWorkerName("A".repeat(101)); // Name too long (>100 chars)
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        assertTrue(invalidRecord.getRejectionReason().contains("Worker name must not exceed 100 characters"));
    }

    @Test
    void testValidateUploadedData_ShortBankAccount() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setBankAccount("123"); // Bank account too short
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        assertTrue(invalidRecord.getRejectionReason().contains("Bank account must be between 10-20 characters"));
    }

    @Test
    void testValidateUploadedData_InvalidPhoneNumber() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setPhoneNumber("invalid-phone"); // Invalid phone format
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        assertTrue(invalidRecord.getRejectionReason().contains("Invalid phone number format"));
    }

    @Test
    void testValidateUploadedData_PaymentAmountMismatch() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setHoursWorked(new BigDecimal("8.00"));
        invalidRecord.setHourlyRate(new BigDecimal("100.00"));
        invalidRecord.setPaymentAmount(new BigDecimal("900.00")); // Should be 800.00
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        assertTrue(invalidRecord.getRejectionReason().contains("Payment amount doesn't match hours worked × hourly rate"));
    }

    @Test
    void testValidateUploadedData_MultipleErrors() {
        // Arrange
        WorkerUploadedData invalidRecord = createValidRecord();
        invalidRecord.setWorkerName(null); // Missing name
        invalidRecord.setEmail("invalid-email"); // Invalid email
        invalidRecord.setHoursWorked(new BigDecimal("-1")); // Negative hours
        List<WorkerUploadedData> records = Arrays.asList(invalidRecord);
        
        when(repository.findByFileIdAndStatus(testFileId, "UPLOADED")).thenReturn(records);
        when(repository.saveAll(anyList())).thenReturn(records);

        // Act
        service.validateUploadedData(testFileId);

        // Assert
        assertEquals("REJECTED", invalidRecord.getStatus());
        String rejectionReason = invalidRecord.getRejectionReason();
        assertTrue(rejectionReason.contains("Worker name is required"));
        assertTrue(rejectionReason.contains("Invalid email format"));
        assertTrue(rejectionReason.contains("Hours worked must be greater than 0"));
    }

    @Test
    void testGenerateRequestForValidatedData() {
        // Arrange
        WorkerUploadedData validatedRecord1 = createValidRecord();
        validatedRecord1.setStatus("VALIDATED");
        WorkerUploadedData validatedRecord2 = createValidRecord();
        validatedRecord2.setStatus("VALIDATED");
        
        List<WorkerUploadedData> validatedRecords = Arrays.asList(validatedRecord1, validatedRecord2);
        
        when(repository.findByFileIdAndStatus(testFileId, "VALIDATED")).thenReturn(validatedRecords);
        when(repository.save(any(WorkerUploadedData.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        int processedCount = service.generateRequestForValidatedData(testFileId, "UPLOAD123");

        // Assert
        assertEquals(2, processedCount);
        assertEquals("REQUEST_GENERATED", validatedRecord1.getStatus());
        assertEquals("REQUEST_GENERATED", validatedRecord2.getStatus());
        assertNotNull(validatedRecord1.getReceiptNumber());
        assertNotNull(validatedRecord2.getReceiptNumber());
        assertNotNull(validatedRecord1.getProcessedAt());
        assertNotNull(validatedRecord2.getProcessedAt());
        // Both records should have the same receipt number
        assertEquals(validatedRecord1.getReceiptNumber(), validatedRecord2.getReceiptNumber());
    }

    private WorkerUploadedData createValidRecord() {
        WorkerUploadedData record = new WorkerUploadedData();
        record.setFileId(testFileId);
        record.setRowNumber(1);
        record.setWorkerId("WRK001");
        record.setWorkerName("John Doe");
        record.setCompanyName("TechCorp");
        record.setDepartment("IT");
        record.setPosition("Developer");
        record.setWorkDate(LocalDate.now().minusDays(1)); // Yesterday
        record.setHoursWorked(new BigDecimal("8.00"));
        record.setHourlyRate(new BigDecimal("100.00"));
        record.setPaymentAmount(new BigDecimal("800.00"));
        record.setBankAccount("1234567890123456");
        record.setPhoneNumber("+91-9876543210");
        record.setEmail("john.doe@techcorp.com");
        record.setAddress("123 Tech Street, Mumbai");
        record.setStatus("UPLOADED");
        record.setUploadedAt(LocalDateTime.now());
        return record;
    }
}
