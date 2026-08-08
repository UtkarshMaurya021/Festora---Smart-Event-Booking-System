package com.festora.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.festora.entity.Category;
import com.festora.service.CategoryService;

@RestController
@CrossOrigin("*")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }
    @GetMapping("/api/admin/categories")
    public List<Category> getAllForAdmin() {
        return service.getAll();
    }

    @GetMapping("/api/categories")
    public List<Category> getAll() {
        return service.getAll();
    }

    @PostMapping("/api/admin/categories")
    public Category save(@Valid @RequestBody Category category) {
        return service.save(category);
    }

    @PutMapping("/api/admin/categories/{id}")
    public Category update(@PathVariable Long id, @Valid @RequestBody Category category) {
        return service.update(id, category);
    }

    @DeleteMapping("/api/admin/categories/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}