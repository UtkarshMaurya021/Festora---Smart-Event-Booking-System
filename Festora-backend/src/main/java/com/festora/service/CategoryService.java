package com.festora.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.festora.entity.Category;
import com.festora.repository.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public List<Category> getAll() {
        return repository.findAll();
    }

    public Category save(Category category) {
        return repository.save(category);
    }

    public Category update(Long id, Category category) {

        Category c = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        c.setCategoryName(category.getCategoryName());

        return repository.save(c);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}