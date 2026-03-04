export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  href,
}) {
  const variants = {
    primary: "bg-brand-primary text-black hover:bg-brand-highlight",
    secondary:
      "bg-card-bg text-white hover:bg-ui-border border border-ui-border",
  };

  const baseClasses =
    "px-8 py-4 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-center inline-block";
  const variantClasses = variants[variant] || variants.primary;

  if (href) {
    return (
      <a
        href={href}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
