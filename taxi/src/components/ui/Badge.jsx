export default function Badge({ color = 'taxi', className = '', children }) {
  return (
    <span className={`ui-badge ui-badge--${color} ${className}`.trim()}>
      {children}
    </span>
  );
}

