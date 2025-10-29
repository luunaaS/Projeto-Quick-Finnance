package com.qfin.qfinbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be valid")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password cannot be empty")
    private String password;

    public String getUsername() {
        return email;
    }
}
