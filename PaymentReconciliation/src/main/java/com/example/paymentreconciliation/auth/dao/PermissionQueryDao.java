package com.example.paymentreconciliation.auth.dao;

import com.example.paymentreconciliation.auth.entity.Permission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class PermissionQueryDao {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private static final String BASE_SELECT = """
        SELECT p.id, p.name, p.description, p.module, p.created_at, p.updated_at
        FROM permissions p
        """;
    
    public List<Permission> findAll() {
        String sql = BASE_SELECT + " ORDER BY p.module, p.name";
        return jdbcTemplate.query(sql, new PermissionRowMapper());
    }
    
    public Optional<Permission> findById(Long id) {
        String sql = BASE_SELECT + " WHERE p.id = ?";
        List<Permission> results = jdbcTemplate.query(sql, new PermissionRowMapper(), id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
    
    public Optional<Permission> findByName(String name) {
        String sql = BASE_SELECT + " WHERE p.name = ?";
        List<Permission> results = jdbcTemplate.query(sql, new PermissionRowMapper(), name);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
    
    public List<Permission> findByModule(String module) {
        String sql = BASE_SELECT + " WHERE p.module = ? ORDER BY p.name";
        return jdbcTemplate.query(sql, new PermissionRowMapper(), module);
    }
    
    public List<String> findAllModules() {
        String sql = "SELECT DISTINCT p.module FROM permissions p ORDER BY p.module";
        return jdbcTemplate.queryForList(sql, String.class);
    }
    
    public boolean existsByName(String name) {
        String sql = "SELECT COUNT(*) FROM permissions WHERE name = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, name);
        return count != null && count > 0;
    }
    
    public List<Permission> findByRoleName(String roleName) {
        String sql = """
            SELECT p.id, p.name, p.description, p.module, p.created_at, p.updated_at
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            INNER JOIN roles r ON rp.role_id = r.id
            WHERE r.name = ?
            ORDER BY p.module, p.name
            """;
        return jdbcTemplate.query(sql, new PermissionRowMapper(), roleName);
    }
    
    public List<Permission> findByUserId(Long userId) {
        String sql = """
            SELECT DISTINCT p.id, p.name, p.description, p.module, p.created_at, p.updated_at
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            INNER JOIN roles r ON rp.role_id = r.id
            INNER JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
            ORDER BY p.module, p.name
            """;
        return jdbcTemplate.query(sql, new PermissionRowMapper(), userId);
    }
    
    public List<Permission> findByUsername(String username) {
        String sql = """
            SELECT DISTINCT p.id, p.name, p.description, p.module, p.created_at, p.updated_at
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            INNER JOIN roles r ON rp.role_id = r.id
            INNER JOIN user_roles ur ON r.id = ur.role_id
            INNER JOIN users u ON ur.user_id = u.id
            WHERE u.username = ?
            ORDER BY p.module, p.name
            """;
        return jdbcTemplate.query(sql, new PermissionRowMapper(), username);
    }
    
    private static class PermissionRowMapper implements RowMapper<Permission> {
        @Override
        public Permission mapRow(ResultSet rs, int rowNum) throws SQLException {
            Permission permission = new Permission();
            permission.setId(rs.getLong("id"));
            permission.setName(rs.getString("name"));
            permission.setDescription(rs.getString("description"));
            permission.setModule(rs.getString("module"));
            
            // Handle timestamps
            java.sql.Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                permission.setCreatedAt(createdAt.toLocalDateTime());
            }
            
            java.sql.Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                permission.setUpdatedAt(updatedAt.toLocalDateTime());
            }
            
            return permission;
        }
    }
}
