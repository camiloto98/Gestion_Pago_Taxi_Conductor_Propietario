export default function Input({ className = '', ...props }) {
  return <input {...props} className={`ui-input ${className}`.trim()} />;
}

