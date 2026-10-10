type FormProps = {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    children: React.ReactNode;
    className?: string;
  };
  
  export default function Form({ onSubmit, children, className }: FormProps) {
    return (
      <form onSubmit={onSubmit} className={`bg-white p-6 rounded shadow space-y-4 ${className || ""}`}>
        {children}
      </form>
    );
  }
  