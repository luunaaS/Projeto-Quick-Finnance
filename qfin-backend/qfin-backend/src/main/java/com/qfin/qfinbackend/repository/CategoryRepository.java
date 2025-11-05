package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.Category;
import com.qfin.qfinbackend.model.Category.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find all categories for a specific user
    List<Category> findByUserId(Long userId);
    
    // Find categories by user and type (INCOME or EXPENSE)
    List<Category> findByUserIdAndType(Long userId, CategoryType type);
    
    // Find main categories (parentId is null) for a user
    List<Category> findByUserIdAndParentIdIsNull(Long userId);
    
    // Find subcategories of a specific parent category
    List<Category> findByUserIdAndParentId(Long userId, Long parentId);
    
    // Find a category by name, type and user (to avoid duplicates)
    Optional<Category> findByUserIdAndNameAndType(Long userId, String name, CategoryType type);
    
    // Find default categories
    List<Category> findByIsDefaultTrue();
    
    // Check if a category exists by name for a user
    boolean existsByUserIdAndNameAndType(Long userId, String name, CategoryType type);
    
    // Find all categories and subcategories for a user ordered by name
    @Query("SELECT c FROM Category c WHERE c.user.id = :userId ORDER BY c.parentId NULLS FIRST, c.name")
    List<Category> findAllByUserIdOrdered(@Param("userId") Long userId);
}
