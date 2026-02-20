package com.hospomate.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.document.Document;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public ChatController(ChatClient.Builder chatClientBuilder, VectorStore vectorStore) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
    }

    @GetMapping
    public Map<String, String> chat(@RequestParam String message, @RequestParam Long storeId) {
        // 1. Retrieve similar documents (Hybird Search: Vector + Metadata Filter)
        // Note: Metadata filtering syntax depends on VectorStore implementation.
        // For pgvector, straightforward "storeId == 123" usually works if supported.
        // For now, we'll just search and filter in memory or rely on basic similarity.

        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.query(message).withTopK(3)
                        .withFilterExpression("storeId == " + storeId));

        String context = similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n\n"));

        // 2. Construct Prompt
        String prompt = """
                You are a helpful assistant for a hospitality business.
                Answer the user's question using ONLY the following context.
                If the answer is not in the context, say "I don't know based on the available procedures."

                CONTEXT:
                %s

                USER QUESTION:
                %s
                """.formatted(context, message);

        // 3. Call AI
        String response = chatClient.prompt(prompt).call().content();

        return Map.of("response", response);
    }
}
