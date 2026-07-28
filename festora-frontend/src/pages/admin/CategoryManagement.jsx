import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../services/adminService";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const loadCategories = () => {
    getCategories()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        
        if (Array.isArray(rawData)) {
          // Sort categories numerically by their active database ID key
          const sortedData = [...rawData].sort((a, b) => {
            const idA = a.id || a._id || a.categoryId || a.category_id || 0;
            const idB = b.id || b._id || b.categoryId || b.category_id || 0;
            return idA - idB;
          });

          setCategories(sortedData);
        } else {
          console.error("API did not return an array. Received:", rawData);
        }
      })
      .catch((err) => console.error("Failed to load categories", err));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Category name is required");

    createCategory(name)
      .then(() => {
        setName("");
        loadCategories();
      })
      .catch((err) => {
        console.error("Error creating category:", err);
        alert("Error creating category");
      });
  };

  const handleDelete = (id) => {
    if (!id) {
      alert("Error: Cannot delete category without a valid ID.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategory(id)
        .then(() => loadCategories())
        .catch((err) => {
          console.error("Error deleting category:", err);
          alert("Error deleting category");
        });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h2 className="mb-4">Category Management</h2>

        {/* Create Category Form */}
        <div className="card p-4 mb-5 shadow-sm">
          <h4>Add New Category</h4>
          <form onSubmit={handleCreate} className="row g-3 mt-2">
            <div className="col-md-9">
              <input
                type="text"
                className="form-control"
                placeholder="Category Name (e.g., Concerts, Standup, Tech)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100">
                Save Category
              </button>
            </div>
          </form>
        </div>

        {/* Categories Table View */}
        <div className="card p-4 shadow-sm">
          <h4>Existing Categories</h4>
          <div className="table-responsive mt-3">
            <table className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>ID</th>
                  <th style={{ width: "60%" }}>Category Name</th>
                  <th style={{ width: "20%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-3">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, idx) => {
                    const backendId = cat.id || cat._id || cat.categoryId || cat.category_id;
                    const displayId = backendId || (idx + 1);
                    const currentName = cat.categoryName || cat.name;

                    return (
                      <tr key={backendId || idx}>
                        <td>{displayId}</td>
                        <td>
                          <strong>{currentName}</strong>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(backendId)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
