import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import DashboardNavbar from "../../components/DashboardNavbar";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../services/adminService";
import { FiGrid, FiPlusCircle, FiTrash2, FiSearch } from "react-icons/fi";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    getCategories()
      .then((res) => {
        const rawData = res && res.data ? res.data : res;
        if (Array.isArray(rawData)) {
          const sortedData = [...rawData].sort((a, b) => {
            const idA = a.id || a._id || a.categoryId || a.category_id || 0;
            const idB = b.id || b._id || b.categoryId || b.category_id || 0;
            return idA - idB;
          });
          setCategories(sortedData);
          setFilteredCategories(sortedData);
          setError("");
        }
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
        setError("Could not load categories. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredCategories(
        categories.filter((cat) => {
          const catName = cat.categoryName || cat.name || "";
          return catName.toLowerCase().includes(q);
        })
      );
    }
  }, [searchQuery, categories]);

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSubmitting(true);
    createCategory(name)
      .then(() => {
        setName("");
        setSuccessMsg("Category created successfully!");
        loadCategories();
      })
      .catch((err) => {
        console.error("Error creating category:", err);
        setError(err.response?.data?.message || "Failed to create category.");
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (!id) return;
    setError("");
    setSuccessMsg("");

    deleteCategory(id)
      .then(() => {
        setSuccessMsg(`Category #${id} deleted successfully.`);
        loadCategories();
      })
      .catch((err) => {
        console.error("Error deleting category:", err);
        setError(err.response?.data?.message || "Failed to delete category.");
      });
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-main bg-light min-vh-100">
        <DashboardNavbar />

        <div
          className="rounded-4 p-4 text-white shadow-sm mb-4 mx-3"
          style={{
            background: "linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="badge bg-white text-dark px-3 py-2 fw-bold mb-2">
                📂 Taxonomy & Event Types
              </span>
              <h2 className="fw-bold mb-1">Event Category Taxonomy</h2>
              <p className="mb-0 text-white-50 small">
                Define and manage event classifications (Concerts, Tech Conferences, Sports, Workshops).
              </p>
            </div>
          </div>
        </div>

        <div className="mx-3 mb-5">
          {error && <div className="alert alert-danger rounded-4">{error}</div>}
          {successMsg && <div className="alert alert-success rounded-4">{successMsg}</div>}

          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiPlusCircle className="text-success" /> Add New Category
            </h5>
            <form onSubmit={handleCreate} className="row g-3">
              <div className="col-md-9">
                <input
                  type="text"
                  className="form-control form-control-lg bg-light"
                  placeholder="Enter Category Name (e.g., Music Concerts, Hackathons, Esports)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100 rounded-3 fw-bold"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
              <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FiGrid className="text-primary" /> Registered Categories ({filteredCategories.length})
              </h4>

              <div className="input-group" style={{ maxWidth: 280 }}>
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search category name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "20%" }}>Category ID</th>
                    <th style={{ width: "60%" }}>Category Title</th>
                    <th style={{ width: "20%" }} className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">Loading categories...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((cat, idx) => {
                      const backendId = cat.id || cat._id || cat.categoryId || cat.category_id;
                      const displayId = backendId || idx + 1;
                      const currentName = cat.categoryName || cat.name;

                      return (
                        <tr key={backendId || idx}>
                          <td className="fw-bold text-success">#{displayId}</td>
                          <td>
                            <strong className="fs-6">{currentName}</strong>
                          </td>
                          <td className="text-end">
                            <button
                              onClick={() => handleDelete(backendId)}
                              className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            >
                              <FiTrash2 className="me-1" /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
