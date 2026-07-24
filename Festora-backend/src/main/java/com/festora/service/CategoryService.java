package com.festora.service;

import com.festora.entity.Category;
import com.festora.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public List<Category> getAll() {
        return repository.findAll();
    }

    public Category create(Category category) {
        return repository.save(category);
    }

    public Category update(Long id, Category category) {

        Category db = repository.findById(id).orElseThrow();

        db.setCategoryName(category.getCategoryName());

        return repository.save(db);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

}