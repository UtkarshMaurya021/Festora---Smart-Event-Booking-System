import { useRef, useState } from "react";
import api from "../services/api";

/**
 * Drag-and-drop (or click-to-browse) image uploader.
 *
 * Uploads the file to POST /api/organizer/upload-image and, on success,
 * calls onUploaded(url) with the full URL the backend hands back. The
 * parent page is expected to push that URL into its existing imageUrls
 * list, so the rest of the save flow is untouched.
 */
function ImageDropzone({ onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/organizer/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.url) {
        onUploaded(res.data.url);
      }
    } catch (err) {
      console.error("Image upload failed:", err.response?.data || err);
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    uploadFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    uploadFile(file);
    // reset so selecting the same file again still fires onChange
    e.target.value = "";
  };

  return (
    <div className="mb-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? "#0d6efd" : "#ced4da"}`,
          borderRadius: 8,
          padding: "1.5rem",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragging ? "#e7f1ff" : "#f8f9fa",
          transition: "background-color 0.15s ease, border-color 0.15s ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        {uploading ? (
          <span className="text-muted">Uploading...</span>
        ) : (
          <span className="text-muted">
            Drag & drop an image here, or <strong>click to browse</strong>
          </span>
        )}
      </div>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}

export default ImageDropzone;
