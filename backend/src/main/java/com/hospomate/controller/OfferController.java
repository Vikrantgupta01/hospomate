package com.hospomate.controller;

import com.hospomate.model.Offer;
import com.hospomate.model.Store;
import com.hospomate.repository.OfferRepository;
import com.hospomate.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private StoreRepository storeRepository;

    @GetMapping("/store/{storeId}")
    public List<Offer> getStoreOffers(@PathVariable long storeId) {
        return offerRepository.findByStoreId(storeId);
    }

    @PostMapping("/store/{storeId}")
    public Offer createOffer(@PathVariable long storeId, @RequestBody Offer offer) {
        Store store = storeRepository.findById(storeId).orElseThrow();
        offer.setStore(store);
        return offerRepository.save(offer);
    }

    @PutMapping("/{id}")
    public Offer updateOffer(@PathVariable long id, @RequestBody Offer offerDetails) {
        Offer offer = offerRepository.findById(id).orElseThrow();
        offer.setCode(offerDetails.getCode());
        offer.setDescription(offerDetails.getDescription());
        offer.setDiscountPercentage(offerDetails.getDiscountPercentage());
        offer.setActive(offerDetails.isActive());
        return offerRepository.save(offer);
    }

    @DeleteMapping("/{id}")
    public void deleteOffer(@PathVariable long id) {
        offerRepository.deleteById(id);
    }
}
