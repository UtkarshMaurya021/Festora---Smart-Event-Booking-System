import { useRef, useState } from "react";
import api from "../services/api";

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

      // Do NOT set explicit Content-Type header so browser/Axios sets correct multipart boundary
      const res = await api.post("/organizer/upload-image", formData);

      if (res.data?.url) {
        onUploaded(res.data.url);
      }
    } catch (err) {
      console.error("Image upload failed:", err.response?.data || err);
      setError(
        err.response?.data?.message || "Upload failed. Please try pasting an image URL below instead."
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
          border: `2px dashed ${isDragging ? "#0d6efd" : "#cbd5e1"}`,
          borderRadius: 12,
          padding: "1.5rem",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragging ? "#e0f2fe" : "#f8fafc",
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
          <span className="text-primary fw-bold">Uploading Image...</span>
        ) : (
          <span className="text-secondary">
            Drag & drop an image here, or <strong>click to browse</strong>
          </span>
        )}
      </div>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}

export default ImageDropzone;
