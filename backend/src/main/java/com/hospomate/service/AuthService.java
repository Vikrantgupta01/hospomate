package com.hospomate.service;

import com.hospomate.dto.AuthResponse;
import com.hospomate.dto.LoginRequest;
import com.hospomate.dto.RegisterRequest;
import com.hospomate.model.Store;
import com.hospomate.model.User;
import com.hospomate.repository.StoreRepository;
import com.hospomate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In real app, hash this!
        user.setRole(request.getRole());
        user = userRepository.save(user);

        Long storeId = null;
        if (request.getRole() == User.Role.STORE_OWNER && request.getStoreName() != null) {
            Store store = new Store();
            store.setName(request.getStoreName());
            store.setOwner(user);
            store = storeRepository.save(store);
            storeId = store.getId();
        }

        return mapToAuthResponse(user, storeId);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) { // Simple check
            throw new RuntimeException("Invalid password");
        }

        Long storeId = null;
        if (user.getRole() == User.Role.STORE_OWNER) {
            Optional<Store> store = storeRepository.findByOwnerId(user.getId()).stream().findFirst();
            if (store.isPresent()) {
                storeId = store.get().getId();
            }
        }

        return mapToAuthResponse(user, storeId);
    }

    private AuthResponse mapToAuthResponse(User user, Long storeId) {
        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setStoreId(storeId);
        response.setToken("mock-token-" + user.getId());
        return response;
    }
}
