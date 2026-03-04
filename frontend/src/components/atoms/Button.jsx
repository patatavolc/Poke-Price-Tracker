export default function Button({
  children,
  variant = "primary",
  className = " ",
  ...props
}) {
  const variants = {
    primary:
      "bg-brand-primary text-app-bg hover:bg-brand-hightlight shadow-lg shadow-brand-primary/10",
    secondary: "border border-ui-border text-white hover:bg-ui-border/30",
    action: "bg-brand-action text-white hover:opacity-90",
  };

  return (
    <button
      className={`px-6 py-2.5 rounded-xl font-display font-bold transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
