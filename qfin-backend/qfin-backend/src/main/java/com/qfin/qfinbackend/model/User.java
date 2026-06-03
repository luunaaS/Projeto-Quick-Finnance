package com.qfin.qfinbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome não pode ser vazio")
    private String name;

    @NotBlank(message = "Email não pode ser vazio")
    @Email(message = "Email deve ser válido")
    @Column(unique = true)
    private String email;

    @JsonIgnore
    @NotBlank(message = "Senha não pode ser vazia")
    private String password;

    @Column(unique = true, length = 14)
    private String cpf;

    private String phone;

    @Column(length = 1000)
    private String bio;

    private LocalDate birthDate;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String profileImageBase64;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;
}
