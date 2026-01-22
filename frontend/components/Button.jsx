export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-brand-primary text-app-bg hover:bg-brand-highlight shadow-lg shadow-brand-primary/10",
    secondary: "border border-ui-border text-white hover:bg-ui-border/30",
    outline:
      "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-app-bg",
  };

  return (
    <button
      className={`px-6 py-2.5 rounded-full font-display font-bold transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
