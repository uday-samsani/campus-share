import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BackButton = ({ to, className = "" }) => {
  return (
    <div className="mb-6">
      <Link
        to={to}
        className={`p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200 ${className}`}
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
    </div>
  );
};

export default BackButton;
