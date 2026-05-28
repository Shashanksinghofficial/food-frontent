import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <motion.div
        className="not-found-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="not-found-emoji">
          <span>404</span>
        </div>
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>

        <div className="not-found-actions">
          <motion.button
            className="go-home-btn"
            onClick={() => navigate("/")}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={18} />
            Go Home
          </motion.button>
          <motion.button
            className="go-back-btn"
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
