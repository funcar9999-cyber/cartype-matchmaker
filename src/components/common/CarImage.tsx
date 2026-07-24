import type { CSSProperties } from "react";

import { CarSilhouette, segmentToSilhouette } from "@/components/common/CarSilhouette";
import type { Car } from "@/lib/car-db";

/**
 * Car image area. Renders car.image_url when present, otherwise a
 * segment-based silhouette on a navy card. Optional radial glow
 * (used only on result matching cards).
 */
export function CarImage({
  car,
  height = 96,
  glowColor,
  className,
  style,
  rounded = 12,
}: {
  car: Pick<Car, "image_url" | "name" | "segment">;
  height?: number;
  glowColor?: string;
  className?: string;
  style?: CSSProperties;
  rounded?: number;
}) {
  const bgStyle: CSSProperties = glowColor
    ? {
        backgroundColor: "#0D1B2E",
        backgroundImage: `radial-gradient(circle at 50% 55%, ${glowColor} 0%, rgba(13,27,46,0) 62%)`,
      }
    : { backgroundColor: "#0D1B2E" };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: rounded,
        overflow: "hidden",
        ...bgStyle,
        ...style,
      }}
    >
      {car.image_url ? (
        <img
          src={car.image_url}
          alt={car.name}
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <CarSilhouette
          segment={segmentToSilhouette(car.segment)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}
    </div>
  );
}