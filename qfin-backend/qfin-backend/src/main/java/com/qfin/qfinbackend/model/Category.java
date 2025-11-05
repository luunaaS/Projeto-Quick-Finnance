package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "categories")
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name cannot be empty")
    private String name;
    
    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    private CategoryType type; // INCOME or EXPENSE
    
    @Column(name = "parent_id")
    private Long parentId; // null for main categories, id of parent for subcategories
    
    @Column(name = "is_default")
    private Boolean isDefault = false; // true for system default categories
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    public enum CategoryType {
        INCOME,
        EXPENSE
    }
    
    public Category(String name, CategoryType type, Long parentId, Boolean isDefault, User user) {
        this.name = name;
        this.type = type;
        this.parentId = parentId;
        this.isDefault = isDefault;
        this.user = user;
    }
}
