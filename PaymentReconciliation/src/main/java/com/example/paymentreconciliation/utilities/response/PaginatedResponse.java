package com.example.paymentreconciliation.utilities.response;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Utility class for creating standardized paginated responses
 * Eliminates duplicate pagination metadata creation across controllers
 */
public class PaginatedResponse<T> {
    
    private List<T> data;
    private Map<String, Object> pagination;
    
    private PaginatedResponse() {
    }
    
    /**
     * Create a paginated response
     * 
     * @param data The list of data items
     * @param page Current page number (0-indexed)
     * @param size Page size
     * @param totalElements Total number of elements
     * @return PaginatedResponse with data and pagination metadata
     */
    public static <T> PaginatedResponse<T> of(List<T> data, int page, int size, long totalElements) {
        PaginatedResponse<T> response = new PaginatedResponse<>();
        response.data = data;
        response.pagination = createPaginationMetadata(page, size, totalElements);
        return response;
    }
    
    /**
     * Create pagination metadata map
     */
    private static Map<String, Object> createPaginationMetadata(int page, int size, long totalElements) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("page", page);
        metadata.put("size", size);
        metadata.put("totalElements", totalElements);
        metadata.put("totalPages", (int) Math.ceil((double) totalElements / size));
        return metadata;
    }
    
    /**
     * Convert to a Map suitable for ResponseEntity
     */
    public Map<String, Object> toMap() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", data);
        response.put("pagination", pagination);
        return response;
    }
    
    /**
     * Convert to a Map with custom data key
     */
    public Map<String, Object> toMap(String dataKey) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put(dataKey, data);
        response.put("pagination", pagination);
        return response;
    }
    
    // Getters
    public List<T> getData() {
        return data;
    }
    
    public Map<String, Object> getPagination() {
        return pagination;
    }
}
