package com.qfin.qfinbackend.controller;

import com.qfin.qfinbackend.model.Category;
import com.qfin.qfinbackend.model.Category.CategoryType;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.UserRepository;
import com.qfin.qfinbackend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    // Get all categories for the authenticated user
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        User user = getCurrentUser();
        List<Category> categories = categoryService.getAllCategoriesByUser(user.getId());
        return ResponseEntity.ok(categories);
    }

    // Get categories by type (INCOME or EXPENSE)
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getCategoriesByType(@PathVariable String type) {
        try {
            User user = getCurrentUser();
            CategoryType categoryType = CategoryType.valueOf(type.toUpperCase());
            List<Category> categories = categoryService.getCategoriesByUserAndType(user.getId(), categoryType);
            return ResponseEntity.ok(categories);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tipo inválido. Use INCOME ou EXPENSE."));
        }
    }

    // Get main categories (no parent)
    @GetMapping("/main")
    public ResponseEntity<List<Category>> getMainCategories() {
        User user = getCurrentUser();
        return ResponseEntity.ok(categoryService.getMainCategories(user.getId()));
    }

    // Get subcategories of a parent category
    @GetMapping("/{parentId}/subcategories")
    public ResponseEntity<List<Category>> getSubcategories(@PathVariable Long parentId) {
        User user = getCurrentUser();
        return ResponseEntity.ok(categoryService.getSubcategories(user.getId(), parentId));
    }

    // Get a specific category
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            return ResponseEntity.ok(categoryService.getCategoryById(user.getId(), id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // Create a new category
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> categoryData) {
        try {
            User user = getCurrentUser();
            String name = (String) categoryData.get("name");
            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "O nome da categoria é obrigatório"));
            }
            String typeStr = (String) categoryData.get("type");
            if (typeStr == null || typeStr.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "O tipo da categoria é obrigatório"));
            }
            CategoryType type = CategoryType.valueOf(typeStr.toUpperCase());
            Long parentId = categoryData.get("parentId") != null ?
                    Long.valueOf(categoryData.get("parentId").toString()) : null;

            Category category = categoryService.createCategory(user.getId(), name.trim(), type, parentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(category);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Tipo inválido. Use INCOME ou EXPENSE."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // Update a category
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> categoryData) {
        try {
            User user = getCurrentUser();
            String name = (String) categoryData.get("name");
            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "O nome da categoria é obrigatório"));
            }
            Long parentId = categoryData.get("parentId") != null ?
                    Long.valueOf(categoryData.get("parentId").toString()) : null;

            Category category = categoryService.updateCategory(user.getId(), id, name.trim(), parentId);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // Delete a category
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            categoryService.deleteCategory(user.getId(), id);
            return ResponseEntity.ok(Map.of("message", "Categoria excluída com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // Initialize default categories for a user
    @PostMapping("/initialize")
    public ResponseEntity<?> initializeDefaultCategories() {
        try {
            User user = getCurrentUser();
            categoryService.initializeDefaultCategories(user.getId());
            return ResponseEntity.ok(Map.of("message", "Categorias padrão inicializadas com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
