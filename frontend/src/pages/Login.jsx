import Form from "../components/Form";
import { Link } from "react-router-dom"; // Import Link
import "../styles/Login.css"; // Create and import a CSS file for styling if needed

function Login() {
    return (
        <div className="login-container"> {/* Optional: Add a container for styling */}
            <Form route="/api/token/" method="login" />
            <p className="register-link-container"> {/* Optional: For styling the link */}
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
}

export default Login;