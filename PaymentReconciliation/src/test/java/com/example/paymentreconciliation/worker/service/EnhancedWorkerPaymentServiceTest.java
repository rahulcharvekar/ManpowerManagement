package com.example.paymentreconciliation.worker.service;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.repository.WorkerPaymentRepository;
import com.example.paymentreconciliation.worker.dao.WorkerPaymentQueryDao;
import com.example.paymentreconciliation.common.dao.BaseQueryDao.PageResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test class demonstrating how to test the enhanced service with separate read/write operations
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class EnhancedWorkerPaymentServiceTest {

    @Mock
    private WorkerPaymentRepository writeRepository;
    
    @Mock
    private WorkerPaymentQueryDao readDao;
    
    private EnhancedWorkerPaymentService service;
    
    private WorkerPayment samplePayment;
    
    @BeforeEach
    void setUp() {
        service = new EnhancedWorkerPaymentService(writeRepository, readDao);
        
        // Create sample payment for testing
        samplePayment = new WorkerPayment();
        samplePayment.setWorkerRef("WRK001");
        samplePayment.setRegId("REG001");
        samplePayment.setName("John Doe");
        samplePayment.setEmployerId("EMP001");
        samplePayment.setToliId("TOLI001");
        samplePayment.setToli("Sample Toli");
        samplePayment.setAadhar("123456789012");
        samplePayment.setPan("ABCDE1234F");
        samplePayment.setBankAccount("1234567890");
        samplePayment.setPaymentAmount(BigDecimal.valueOf(1000.00));
        samplePayment.setRequestReferenceNumber("WRK-REF-001");
        samplePayment.setReceiptNumber("RCPT-001");
        samplePayment.setStatus("UPLOADED");
        samplePayment.setFileId("FILE001");
        samplePayment.setCreatedAt(LocalDateTime.now());
    }
    
    // ===========================================
    // WRITE OPERATION TESTS - JPA Repository
    // ===========================================
    
    @Test
    void testCreateWorkerPayment() {
        // Arrange
        WorkerPayment savedPayment = new WorkerPayment();
        // Copy properties from sample payment
        savedPayment.setWorkerRef(samplePayment.getWorkerRef());
        savedPayment.setPaymentAmount(samplePayment.getPaymentAmount());
        // Set ID to simulate saved entity
        // savedPayment.setId(1L); // Assuming entity has setId method
        
        when(writeRepository.save(any(WorkerPayment.class))).thenReturn(savedPayment);
        
        // Act
        WorkerPayment result = service.create(samplePayment);
        
        // Assert
        assertNotNull(result);
        assertEquals(samplePayment.getWorkerRef(), result.getWorkerRef());
        assertEquals(samplePayment.getPaymentAmount(), result.getPaymentAmount());
        
        verify(writeRepository, times(1)).save(samplePayment);
    }
    
    @Test
    void testCreateBulkWorkerPayments() {
        // Arrange
        List<WorkerPayment> paymentsToCreate = List.of(samplePayment);
        List<WorkerPayment> savedPayments = List.of(samplePayment);
        
        when(writeRepository.saveAll(anyList())).thenReturn(savedPayments);
        
        // Act
        List<WorkerPayment> result = service.createBulk(paymentsToCreate);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(samplePayment.getWorkerRef(), result.get(0).getWorkerRef());
        
        verify(writeRepository, times(1)).saveAll(paymentsToCreate);
    }
    
    @Test
    void testUpdateWorkerPayment() {
        // Arrange
        Long paymentId = 1L;
        WorkerPayment existingPayment = new WorkerPayment();
        existingPayment.setCreatedAt(LocalDateTime.now().minusDays(1));
        
        WorkerPayment updatedPayment = new WorkerPayment();
        updatedPayment.setWorkerRef("WRK002");
        updatedPayment.setPaymentAmount(BigDecimal.valueOf(1500.00));
        
        when(readDao.findById(paymentId)).thenReturn(Optional.of(existingPayment));
        when(writeRepository.save(any(WorkerPayment.class))).thenReturn(updatedPayment);
        
        // Act
        WorkerPayment result = service.update(paymentId, updatedPayment);
        
        // Assert
        assertNotNull(result);
        assertEquals("WRK002", result.getWorkerRef());
        assertEquals(BigDecimal.valueOf(1500.00), result.getPaymentAmount());
        
        verify(readDao, times(1)).findById(paymentId);
        verify(writeRepository, times(1)).save(any(WorkerPayment.class));
    }
    
    @Test
    void testUpdateStatus() {
        // Arrange
        Long paymentId = 1L;
        String newStatus = "PROCESSED";
        
        when(readDao.findById(paymentId)).thenReturn(Optional.of(samplePayment));
        when(writeRepository.save(any(WorkerPayment.class))).thenReturn(samplePayment);
        
        // Act
        WorkerPayment result = service.updateStatus(paymentId, newStatus);
        
        // Assert
        assertNotNull(result);
        verify(readDao, times(1)).findById(paymentId);
        verify(writeRepository, times(1)).save(any(WorkerPayment.class));
    }
    
    // ===========================================
    // READ OPERATION TESTS - Query DAO
    // ===========================================
    
    @Test
    void testFindById() {
        // Arrange
        Long paymentId = 1L;
        when(readDao.findById(paymentId)).thenReturn(Optional.of(samplePayment));
        
        // Act
        Optional<WorkerPayment> result = service.findById(paymentId);
        
        // Assert
        assertTrue(result.isPresent());
        assertEquals(samplePayment.getWorkerRef(), result.get().getWorkerRef());
        
        verify(readDao, times(1)).findById(paymentId);
        verifyNoInteractions(writeRepository); // Ensure no write operations called
    }
    
    @Test
    void testFindWithFilters() {
        // Arrange
        String status = "UPLOADED";
        String receiptNumber = "RCPT-001";
        String fileId = "FILE001";
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        LocalDateTime endDate = LocalDateTime.now();
        int page = 0;
        int size = 20;
        
        PageResult<WorkerPayment> mockPageResult = new PageResult<>(
            List.of(samplePayment), page, size, 1L
        );
        
        when(readDao.findWithFilters(status, receiptNumber, fileId, startDate, endDate, page, size))
            .thenReturn(mockPageResult);
        
        // Act
        PageResult<WorkerPayment> result = service.findWithFilters(
            status, receiptNumber, fileId, startDate, endDate, page, size);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(1L, result.getTotalElements());
        assertEquals(0, result.getPage());
        assertEquals(20, result.getSize());
        
        verify(readDao, times(1)).findWithFilters(status, receiptNumber, fileId, startDate, endDate, page, size);
        verifyNoInteractions(writeRepository);
    }
    
    @Test
    void testFindByStatus() {
        // Arrange
        String status = "UPLOADED";
        int page = 0;
        int size = 10;
        
        PageResult<WorkerPayment> mockPageResult = new PageResult<>(
            List.of(samplePayment), page, size, 1L
        );
        
        when(readDao.findByStatus(status, page, size)).thenReturn(mockPageResult);
        
        // Act
        PageResult<WorkerPayment> result = service.findByStatus(status, page, size);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(samplePayment.getStatus(), result.getContent().get(0).getStatus());
        
        verify(readDao, times(1)).findByStatus(status, page, size);
        verifyNoInteractions(writeRepository);
    }
    
    @Test
    void testFindByReceiptNumber() {
        // Arrange
        String receiptNumber = "RCPT-001";
        when(readDao.findByReceiptNumber(receiptNumber)).thenReturn(List.of(samplePayment));
        
        // Act
        List<WorkerPayment> result = service.findByReceiptNumber(receiptNumber);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(receiptNumber, result.get(0).getReceiptNumber());
        
        verify(readDao, times(1)).findByReceiptNumber(receiptNumber);
        verifyNoInteractions(writeRepository);
    }
    
    @Test
    void testGetStatusCountsByFileId() {
        // Arrange
        String fileId = "FILE001";
        Map<String, Long> mockStatusCounts = Map.of(
            "UPLOADED", 10L,
            "PROCESSED", 5L,
            "REJECTED", 2L
        );
        
        when(readDao.getStatusCountsByFileId(fileId)).thenReturn(mockStatusCounts);
        
        // Act
        Map<String, Long> result = service.getStatusCountsByFileId(fileId);
        
        // Assert
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals(10L, result.get("UPLOADED"));
        assertEquals(5L, result.get("PROCESSED"));
        assertEquals(2L, result.get("REJECTED"));
        
        verify(readDao, times(1)).getStatusCountsByFileId(fileId);
        verifyNoInteractions(writeRepository);
    }
    
    @Test
    void testExistsById() {
        // Arrange
        Long paymentId = 1L;
        when(readDao.findById(paymentId)).thenReturn(Optional.of(samplePayment));
        
        // Act
        boolean result = service.existsById(paymentId);
        
        // Assert
        assertTrue(result);
        
        verify(readDao, times(1)).findById(paymentId);
        verifyNoInteractions(writeRepository);
    }
    
    @Test
    void testExistsByIdNotFound() {
        // Arrange
        Long paymentId = 999L;
        when(readDao.findById(paymentId)).thenReturn(Optional.empty());
        
        // Act
        boolean result = service.existsById(paymentId);
        
        // Assert
        assertFalse(result);
        
        verify(readDao, times(1)).findById(paymentId);
        verifyNoInteractions(writeRepository);
    }
}
