package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qfin.qfinbackend.model.UserRole;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByCpf(String cpf);
    List<User> findByRole(UserRole role);
}
