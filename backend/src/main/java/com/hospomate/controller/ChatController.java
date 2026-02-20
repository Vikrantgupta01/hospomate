package com.hospomate.controller;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final VectorStore vectorStore;
    private final ChatModel chatModel;

    @Autowired
    public ChatController(VectorStore vectorStore, ChatModel chatModel) {
        this.vectorStore = vectorStore;
        this.chatModel = chatModel;
        System.out.println("ChatController initialized with vectorStore: " + vectorStore.getClass().getName());
    }

    @GetMapping
    public Map<String, String> chat(@RequestParam String message, @RequestParam(required = false) Long storeId) {
        System.out.println("Chat request received: " + message + ", storeId: " + storeId);
        try {
            // 1. Retrieve similar documents
            // Note: In 1.0.0-M1, check if filter expression is supported directly or use
            // post-filter
            List<Document> similarDocuments = vectorStore.similaritySearch(message);
            System.out.println("Found " + similarDocuments.size() + " similar documents");

            String context = similarDocuments.stream()
                    .filter(doc -> {
                        if (storeId == null)
                            return true;
                        // Basic in-memory filtering if metadata is present
                        Object docStoreId = doc.getMetadata().get("storeId");
                        // Handle potential type mismatch (String vs Long)
                        String docStoreIdStr = String.valueOf(docStoreId);
                        boolean match = docStoreId != null && docStoreIdStr.equals(storeId.toString());
                        if (!match) {
                            System.out.println("Skipping doc with storeId: " + docStoreIdStr);
                        }
                        return match;
                    })
                    .map(Document::getContent)
                    .collect(Collectors.joining("\n\n"));

            System.out.println("Constructed context length: " + context.length());

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
            String response = chatModel.call(prompt);
            System.out.println("AI Response: " + response);

            return Map.of("response", response);
        } catch (Exception e) {
            System.out.println("Error processing chat request:");
            e.printStackTrace();
            throw new RuntimeException("Chat processing failed", e);
        }
    }
}
