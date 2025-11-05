package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.Transaction;
import com.qfin.qfinbackend.model.Transaction.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    
    List<Transaction> findByUserIdAndTypeAndDateBetween(Long userId, TransactionType type, LocalDate startDate, LocalDate endDate);
    
    List<Transaction> findByUserIdAndCategoryAndDateBetween(Long userId, String category, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.date BETWEEN :startDate AND :endDate " +
           "AND (:type IS NULL OR t.type = :type) AND (:category IS NULL OR t.category = :category)")
    List<Transaction> findByFilters(@Param("userId") Long userId, 
                                    @Param("startDate") LocalDate startDate, 
                                    @Param("endDate") LocalDate endDate,
                                    @Param("type") TransactionType type,
                                    @Param("category") String category);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.date BETWEEN :startDate AND :endDate")
    Double sumByUserIdAndTypeAndDateBetween(@Param("userId") Long userId, 
                                           @Param("type") TransactionType type,
                                           @Param("startDate") LocalDate startDate, 
                                           @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t.category, SUM(t.amount), COUNT(t) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = :type AND t.date BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category")
    List<Object[]> sumByCategoryAndType(@Param("userId") Long userId,
                                       @Param("type") TransactionType type,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);
}
