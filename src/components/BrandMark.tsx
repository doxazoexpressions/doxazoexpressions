import appIcon from "/app-icon-512.png";

interface BrandMarkProps {
  size?: number;
  className?: string;
  rounded?: string;
}

/**
 * BrandMark — the single source of truth for the Doxazo Expressions logo mark.
 * Uses the same artwork as the iOS Home Screen / TestFlight app icon
 * (navy tile with gold open book + sunrise) for full brand consistency across
 * web, mobile, favicon, and native surfaces.
 */
const BrandMark = ({ size = 40, className = "", rounded = "rounded-lg" }: BrandMarkProps) => {
  return (
    <img
      src={appIcon}
      alt="Doxazo Expressions"
      width={size}
      height={size}
      className={`${rounded} object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default BrandMark;
