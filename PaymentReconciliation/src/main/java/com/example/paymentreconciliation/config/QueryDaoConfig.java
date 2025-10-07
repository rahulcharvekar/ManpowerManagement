package com.example.paymentreconciliation.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.sql.DataSource;

/**
 * Configuration for JDBC templates used in query-based DAOs
 */
@Configuration
public class QueryDaoConfig {
    
    /**
     * Configure JdbcTemplate with the existing DataSource
     */
    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        
        // Configure for better performance
        jdbcTemplate.setFetchSize(1000); // Reasonable fetch size for large result sets
        jdbcTemplate.setMaxRows(0); // No limit on max rows
        jdbcTemplate.setQueryTimeout(60); // 60 second timeout for queries
        
        return jdbcTemplate;
    }
    
    /**
     * Configure NamedParameterJdbcTemplate for parameterized queries
     */
    @Bean
    public NamedParameterJdbcTemplate namedParameterJdbcTemplate(JdbcTemplate jdbcTemplate) {
        return new NamedParameterJdbcTemplate(jdbcTemplate);
    }
}
