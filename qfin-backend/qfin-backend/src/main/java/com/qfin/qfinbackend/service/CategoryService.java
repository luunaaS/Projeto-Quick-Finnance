package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Category;
import com.qfin.qfinbackend.model.Category.CategoryType;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.CategoryRepository;
import com.qfin.qfinbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all categories for a user
    public List<Category> getAllCategoriesByUser(Long userId) {
        return categoryRepository.findAllByUserIdOrdered(userId);
    }

    // Get categories by type (INCOME or EXPENSE)
    public List<Category> getCategoriesByUserAndType(Long userId, CategoryType type) {
        return categoryRepository.findByUserIdAndType(userId, type);
    }

    // Get main categories (no parent)
    public List<Category> getMainCategories(Long userId) {
        return categoryRepository.findByUserIdAndParentIdIsNull(userId);
    }

    // Get subcategories of a parent category
    public List<Category> getSubcategories(Long userId, Long parentId) {
        return categoryRepository.findByUserIdAndParentId(userId, parentId);
    }

    // Create a new category
    @Transactional
    public Category createCategory(Long userId, String name, CategoryType type, Long parentId) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if category already exists
        if (categoryRepository.existsByUserIdAndNameAndType(userId, name, type)) {
            throw new RuntimeException("Category with this name already exists");
        }

        // If parentId is provided, validate it exists and belongs to the same user
        if (parentId != null) {
            Category parentCategory = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            
            if (!parentCategory.getUser().getId().equals(userId)) {
                throw new RuntimeException("Parent category does not belong to this user");
            }
            
            if (!parentCategory.getType().equals(type)) {
                throw new RuntimeException("Parent category must be of the same type");
            }
        }

        Category category = new Category(name, type, parentId, false, user);
        return categoryRepository.save(category);
    }

    // Update a category
    @Transactional
    public Category updateCategory(Long userId, Long categoryId, String name, Long parentId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Verify ownership
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this category");
        }

        // Don't allow updating default categories
        if (category.getIsDefault()) {
            throw new RuntimeException("Cannot update default categories");
        }

        // Check if new name already exists (excluding current category)
        Optional<Category> existingCategory = categoryRepository
                .findByUserIdAndNameAndType(userId, name, category.getType());
        if (existingCategory.isPresent() && !existingCategory.get().getId().equals(categoryId)) {
            throw new RuntimeException("Category with this name already exists");
        }

        // Validate parent if provided
        if (parentId != null) {
            // Prevent circular reference
            if (parentId.equals(categoryId)) {
                throw new RuntimeException("Category cannot be its own parent");
            }

            Category parentCategory = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            
            if (!parentCategory.getUser().getId().equals(userId)) {
                throw new RuntimeException("Parent category does not belong to this user");
            }
            
            if (!parentCategory.getType().equals(category.getType())) {
                throw new RuntimeException("Parent category must be of the same type");
            }
        }

        category.setName(name);
        category.setParentId(parentId);
        return categoryRepository.save(category);
    }

    // Delete a category
    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Verify ownership
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this category");
        }

        // Don't allow deleting default categories
        if (category.getIsDefault()) {
            throw new RuntimeException("Cannot delete default categories");
        }

        // Check if category has subcategories
        List<Category> subcategories = categoryRepository.findByUserIdAndParentId(userId, categoryId);
        if (!subcategories.isEmpty()) {
            throw new RuntimeException("Cannot delete category with subcategories. Delete subcategories first.");
        }

        categoryRepository.delete(category);
    }

    // Initialize default categories for a new user
    @Transactional
    public void initializeDefaultCategories(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has categories
        List<Category> existingCategories = categoryRepository.findByUserId(userId);
        if (!existingCategories.isEmpty()) {
            return; // User already has categories
        }

        // Create default income categories
        createDefaultCategory(user, "Salário", CategoryType.INCOME);
        createDefaultCategory(user, "Freelance", CategoryType.INCOME);
        createDefaultCategory(user, "Investimentos", CategoryType.INCOME);
        createDefaultCategory(user, "Aluguel", CategoryType.INCOME);
        createDefaultCategory(user, "Outros", CategoryType.INCOME);

        // Create default expense categories
        createDefaultCategory(user, "Alimentação", CategoryType.EXPENSE);
        createDefaultCategory(user, "Transporte", CategoryType.EXPENSE);
        createDefaultCategory(user, "Moradia", CategoryType.EXPENSE);
        createDefaultCategory(user, "Saúde", CategoryType.EXPENSE);
        createDefaultCategory(user, "Educação", CategoryType.EXPENSE);
        createDefaultCategory(user, "Lazer", CategoryType.EXPENSE);
        createDefaultCategory(user, "Compras", CategoryType.EXPENSE);
        createDefaultCategory(user, "Outros", CategoryType.EXPENSE);
    }

    private void createDefaultCategory(User user, String name, CategoryType type) {
        Category category = new Category(name, type, null, true, user);
        categoryRepository.save(category);
    }

    // Get a specific category
    public Category getCategoryById(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Verify ownership
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to view this category");
        }

        return category;
    }
}
