package com.festora.controller;

import com.festora.dto.EventRequest;
import com.festora.dto.OrganizerDashboardResponse;
import com.festora.entity.Event;
import com.festora.service.EventService;
import com.festora.dto.EventSummaryResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizer")
@CrossOrigin("*")
public class OrganizerController {

    private final EventService eventService;

    public OrganizerController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/events")
    public Event createEvent(@RequestBody EventRequest request,
            Authentication authentication) {
        return eventService.create(request, authentication.getName());
    }

    @GetMapping("/events")
    public List<Event> myEvents(Authentication authentication) {
        return eventService.getMyEvents(authentication.getName());
    }

    @GetMapping("/events/{id}")
    public Event getEvent(@PathVariable Long id) {
        return eventService.getEvent(id);
    }

    @DeleteMapping("/events/{id}")
    public void deleteEvent(@PathVariable Long id,
            Authentication authentication) {
        eventService.deleteEvent(id, authentication.getName());
    }

    // NEW ENDPOINT
    @GetMapping("/events/summary")
    public List<EventSummaryResponse> myEventsSummary(Authentication authentication) {
        return eventService.getMyEventsSummary(authentication.getName());
    }

    @PutMapping("/events/{id}")
    public Event updateEvent(@PathVariable Long id,
            @RequestBody EventRequest request,
            Authentication authentication) {
        return eventService.updateEvent(id, request, authentication.getName());
    }

    @GetMapping("/dashboard")
    public OrganizerDashboardResponse dashboard(
            Authentication authentication) {

        return eventService.getDashboard(
                authentication.getName());

    }
    @GetMapping("/events/active")
    public List<Event> myActiveEvents(Authentication authentication) {
        return eventService.getMyActiveEvents(authentication.getName());
    }

    // Drag-and-drop / browse image upload for event images. Saves the file
    // under uploads/events (served statically via WebConfig -> "/uploads/**",
    // same convention as the QR code images in TicketService) and hands back
    // a full URL that the frontend can drop straight into imageUrls, exactly
    // like a pasted image URL would work today.
    @PostMapping("/upload-image")
    public Map<String, String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("No file was uploaded.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed.");
        }

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + extension;

        File folder = new File("uploads" + File.separator + "events");
        if (!folder.exists() && !folder.mkdirs()) {
            throw new IllegalStateException("Could not create events upload folder: " + folder.getAbsolutePath());
        }

        Path filePath = new File(folder, fileName).toPath();
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Same host/port convention already used throughout the frontend
        // (e.g. ticket QR codes) for turning a relative uploads path into a
        // full URL.
        String url = "http://localhost:8080/uploads/events/" + fileName;
        return Map.of("url", url);
    }
}
