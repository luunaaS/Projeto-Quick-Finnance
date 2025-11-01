package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.Category;
import com.qfin.qfinbackend.model.Category.CategoryType;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Get all categories for the authenticated user
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        List<Category> categories = categoryService.getAllCategoriesByUser(user.getId());
        return ResponseEntity.ok(categories);
    }

    // Get categories by type (INCOME or EXPENSE)
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Category>> getCategoriesByType(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String type) {
        User user = (User) userDetails;
        CategoryType categoryType = CategoryType.valueOf(type.toUpperCase());
        List<Category> categories = categoryService.getCategoriesByUserAndType(user.getId(), categoryType);
        return ResponseEntity.ok(categories);
    }

    // Get main categories (no parent)
    @GetMapping("/main")
    public ResponseEntity<List<Category>> getMainCategories(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        List<Category> categories = categoryService.getMainCategories(user.getId());
        return ResponseEntity.ok(categories);
    }

    // Get subcategories of a parent category
    @GetMapping("/{parentId}/subcategories")
    public ResponseEntity<List<Category>> getSubcategories(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long parentId) {
        User user = (User) userDetails;
        List<Category> subcategories = categoryService.getSubcategories(user.getId(), parentId);
        return ResponseEntity.ok(subcategories);
    }

    // Get a specific category
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = (User) userDetails;
        Category category = categoryService.getCategoryById(user.getId(), id);
        return ResponseEntity.ok(category);
    }

    // Create a new category
    @PostMapping
    public ResponseEntity<?> createCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> categoryData) {
        try {
            User user = (User) userDetails;
            String name = (String) categoryData.get("name");
            String typeStr = (String) categoryData.get("type");
            CategoryType type = CategoryType.valueOf(typeStr.toUpperCase());
            Long parentId = categoryData.get("parentId") != null ? 
                    Long.valueOf(categoryData.get("parentId").toString()) : null;

            Category category = categoryService.createCategory(user.getId(), name, type, parentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(category);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Update a category
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, Object> categoryData) {
        try {
            User user = (User) userDetails;
            String name = (String) categoryData.get("name");
            Long parentId = categoryData.get("parentId") != null ? 
                    Long.valueOf(categoryData.get("parentId").toString()) : null;

            Category category = categoryService.updateCategory(user.getId(), id, name, parentId);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Delete a category
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            User user = (User) userDetails;
            categoryService.deleteCategory(user.getId(), id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Initialize default categories for a user
    @PostMapping("/initialize")
    public ResponseEntity<?> initializeDefaultCategories(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            categoryService.initializeDefaultCategories(user.getId());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Default categories initialized successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
