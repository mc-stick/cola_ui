import { Star, StarIcon } from "lucide-react";
import { useState } from "react";

export default function StarRating({
  max = 5,
  value = 0,
  onChange,
  size = 24,
  readOnly = false,
}) {
  const [hover, setHover] = useState(null);

  const displayedValue = hover ?? value;

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }, (_, i) => {
        const ratingValue = i + 1;
        const filled = ratingValue <= displayedValue;

        return (
          <span
            key={ratingValue}
            role={readOnly ? "img" : "button"}
            aria-label={`${ratingValue} estrella`}
            onClick={() => !readOnly && onChange?.(ratingValue)}
            onMouseEnter={() => !readOnly && setHover(ratingValue)}
            onMouseLeave={() => !readOnly && setHover(null)}
            style={{
              cursor: readOnly ? "default" : "pointer",
              fontSize: size,
              color: filled ? "orange" : "#E0E0E0",
              transition: "color 0.2s",
            }}
          >
            <StarIcon/>
          </span>
        );
      })}
    </div>
  );
}
