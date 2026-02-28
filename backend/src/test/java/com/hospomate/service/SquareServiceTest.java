package com.hospomate.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

@SpringBootTest
public class SquareServiceTest {

    @Autowired
    private SquareService squareService;

    @Test
    public void testFetchVariationToCategoryMap() {
        System.out.println("--- TESTING CATEGORIES ---");
        Map<String, String> map = squareService.fetchVariationToCategoryMap();
        System.out.println("VariationToCategory Map size: " + map.size());
        map.forEach((k, v) -> System.out.println(k + " -> " + v));

        System.out.println("--- TESTING TEAM MEMBERS ---");
        Map<String, String> teamMap = squareService.fetchTeamMemberNames();
        System.out.println("Team Members count: " + teamMap.size());
        teamMap.forEach((k, v) -> System.out.println(k + " -> " + v));
    }
}
