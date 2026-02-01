package com.hospomate.repository;

import com.hospomate.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByStoreId(Long storeId);

    Optional<Offer> findByCode(String code);
}
