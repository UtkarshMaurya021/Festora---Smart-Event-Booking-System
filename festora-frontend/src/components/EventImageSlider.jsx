import { useEffect, useState } from "react";

/**
 * Shows an event's image. If there is more than one image, auto-slides
 * through them on an interval. Falls back to a placeholder block when the
 * event has no images.
 */
function EventImageSlider({ images = [], height = 180, interval = 3000 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images || images.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light text-muted"
        style={{ height, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        No Image
      </div>
    );
  }

  return (
    <div
      className="position-relative overflow-hidden"
      style={{
        height,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    >
      {images.map((img, index) => (
        <img
          key={img.imageId || index}
          src={img.imageUrl}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: index === activeIndex ? 1 : 0,
            transition: "opacity 0.6s ease-in-out",
          }}
        />
      ))}

      {images.length > 1 && (
        <div
          className="position-absolute d-flex justify-content-center gap-1"
          style={{ bottom: 8, left: 0, right: 0 }}
        >
          {images.map((_, index) => (
            <span
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor:
                  index === activeIndex
                    ? "#ffffff"
                    : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventImageSlider;
