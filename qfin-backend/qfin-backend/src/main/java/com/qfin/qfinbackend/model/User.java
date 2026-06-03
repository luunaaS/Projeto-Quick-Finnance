package com.qfin.qfinbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

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

    @Column(columnDefinition = "TEXT")
    private String profileImageBase64;

    // Sem NOT NULL no schema para não quebrar atualização de bancos já existentes
    // com registros antigos; o valor padrão é garantido pela aplicação e pelo
    // ColumnDefault para novos registros.
    @Enumerated(EnumType.STRING)
    @ColumnDefault("'USER'")
    private UserRole role = UserRole.USER;
}
