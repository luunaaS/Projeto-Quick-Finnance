package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.Category;
import com.qfin.qfinbackend.model.Category.CategoryType;
import com.qfin.qfinbackend.model.User;
import com.qfin.qfinbackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CategoryServiceTest {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserRepository userRepository;

    private Long userId;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setName("Teste Categoria");
        user.setEmail("categoria-" + System.nanoTime() + "@teste.com");
        user.setPassword("hash");
        userId = userRepository.save(user).getId();
    }

    @Test
    void deveCriarCategoriaPersonalizada() {
        Category cat = categoryService.createCategory(userId, "Pets", CategoryType.EXPENSE, null);
        assertNotNull(cat.getId());
        assertEquals("Pets", cat.getName());
        assertEquals(CategoryType.EXPENSE, cat.getType());
        assertFalse(cat.getIsDefault());
    }

    @Test
    void naoDevePermitirCategoriaDuplicada() {
        categoryService.createCategory(userId, "Viagem", CategoryType.EXPENSE, null);
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> categoryService.createCategory(userId, "Viagem", CategoryType.EXPENSE, null));
        assertTrue(ex.getMessage().toLowerCase().contains("already exists")
                || ex.getMessage().toLowerCase().contains("já"));
    }

    @Test
    void deveAtualizarCategoriaPersonalizada() {
        Category cat = categoryService.createCategory(userId, "Bonus", CategoryType.INCOME, null);
        Category updated = categoryService.updateCategory(userId, cat.getId(), "Bônus", null);
        assertEquals("Bônus", updated.getName());
    }

    @Test
    void deveExcluirCategoriaPersonalizada() {
        Category cat = categoryService.createCategory(userId, "Temporaria", CategoryType.EXPENSE, null);
        categoryService.deleteCategory(userId, cat.getId());
        assertTrue(categoryService.getAllCategoriesByUser(userId).stream()
                .noneMatch(c -> c.getId().equals(cat.getId())));
    }

    @Test
    void naoDeveExcluirCategoriaPadrao() {
        categoryService.initializeDefaultCategories(userId);
        Category padrao = categoryService.getAllCategoriesByUser(userId).stream()
                .filter(Category::getIsDefault)
                .findFirst()
                .orElseThrow();
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> categoryService.deleteCategory(userId, padrao.getId()));
        assertTrue(ex.getMessage().toLowerCase().contains("default")
                || ex.getMessage().toLowerCase().contains("padr"));
    }
}
