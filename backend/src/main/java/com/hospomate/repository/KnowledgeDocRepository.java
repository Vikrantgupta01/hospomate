package com.hospomate.repository;

import com.hospomate.model.KnowledgeDoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeDocRepository extends JpaRepository<KnowledgeDoc, Long> {
    List<KnowledgeDoc> findByStoreId(Long storeId);
}
