import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
        📷 Photography Manager
      </Link>
      <div>
        {user ? (
          <>
            <span className={styles.username}>👤 {user.username}</span>
            <Link to="/admin" className={styles.link}>
              Admin
            </Link>
            <button onClick={handleLogout} className={styles.button}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.link}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
