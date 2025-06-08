import Form from "../components/Form";
import { Link } from "react-router-dom"; // Import Link
import "../styles/Login.css";



function Register() {
    localStorage.clear(); // Clear local storage on register page load, if needed
    return (
        <div className="login-container"> {/* Optional: Add a container for styling */}
            <Form route="/api/user/register/" method="register" />
            <p className="login-link-container"> {/* Optional: For styling the link */}
                Have an account? <Link to="/login">login here</Link>
            </p>
        </div>
    );
}
export default Register