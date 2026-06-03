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

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be valid")
    @Column(unique = true)
    private String email;

    @JsonIgnore
    @NotBlank(message = "Password cannot be empty")
    private String password;

    private String phone;

    @Column(length = 1000)
    private String bio;

    private LocalDate birthDate;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String profileImageBase64;
}
