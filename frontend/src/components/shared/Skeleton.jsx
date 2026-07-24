
import './Skeleton.css';

export default function Skeleton({
  variant = 'text',
  width,
  height,
  borderRadius,
  style = {},
  className = ''
}) {
  const customStyles = {
    width: width,
    height: height,
    borderRadius: borderRadius,
    ...style
  };

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={customStyles}
    />
  );
}
