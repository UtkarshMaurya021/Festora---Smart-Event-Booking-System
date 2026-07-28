package com.festora.controller;

import java.util.List;
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

    // Accessible to all users for dropdown lists
    @GetMapping("/api/categories")
    public List<Category> getAll() {
        return service.getAll();
    }

    // Administrative modification routes remain restricted
    @PostMapping("/api/admin/categories")
    public Category save(@RequestBody Category category) {
        return service.save(category);
    }

    @PutMapping("/api/admin/categories/{id}")
    public Category update(@PathVariable Long id, @RequestBody Category category) {
        return service.update(id, category);
    }

    @DeleteMapping("/api/admin/categories/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
