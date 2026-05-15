export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={`ui-btn ui-btn--${variant} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

