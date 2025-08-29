import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import logo_light from "../assets/logo-light.svg";
import logo_dark from "../assets/logo-dark.svg";
import api from "../api";
import { showSuccessToast, showErrorToast } from "../utils/toast.jsx";

const fields = [
  { name: "first_name", type: "text", label: "First Name", required: true },
  { name: "last_name", type: "text", label: "Last Name", required: true },
  { name: "username", type: "text", label: "Username", required: true },
  { name: "email", type: "email", label: "Email", required: true },
  { name: "password", type: "password", label: "Password", required: true },
];

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});
  const navigate = useNavigate();

  // Set document title for register page
  useEffect(() => {
    document.title = 'Create Account - Streamify';
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (name) => {
    setFocused({ ...focused, [name]: true });
  };

  const handleBlur = (name) => {
    setFocused({ ...focused, [name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    api
      .post("accounts/user/", form)
      .then(() => {
        showSuccessToast("🎉 Account created successfully");
        setForm({
          username: "",
          first_name: "",
          last_name: "",
          email: "",
          password: "",
        });
        // Quick redirect to login page
        setTimeout(() => {
          navigate("/login");
        }, 0);
      })
      .catch((err) => {
        const data = err?.response?.data;
        let errorMsg = "An unexpected error occurred.";

        if (data && typeof data === "object") {
          if (data.error) {
            if (typeof data.error === "string") {
              errorMsg = data.error;
            } else if (typeof data.error === "object") {
              const firstErrorArr = Object.values(data.error).flat();
              errorMsg = firstErrorArr.length ? firstErrorArr[0] : errorMsg;
            }
          } else {
            const firstErrorArr = Object.values(data).flat();
            errorMsg = firstErrorArr.length ? firstErrorArr[0] : errorMsg;
          }
        } else if (typeof data === "string") {
          errorMsg = data;
        }

        if (
          errorMsg
            .toLowerCase()
            .includes("users with this username already exists") ||
          errorMsg.toLowerCase().includes("username already taken") ||
          errorMsg.toLowerCase().includes("this field must be unique")
        ) {
          errorMsg = "Username is already in use";
        }
        if (
          errorMsg
            .toLowerCase()
            .includes("users with this email already exists") ||
          errorMsg.toLowerCase().includes("email already registered")
        ) {
          errorMsg = "Email is already in use";
        }
        showErrorToast(`❌ ${errorMsg}`);
      })

      .finally(() => {
        setLoading(false);
      });
    <Navigate to="/login" replace={true} />;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-[#181818]">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#232323] shadow-lg rounded-xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
          Create Account
        </h2>
        <div className="flex justify-center mb-2">
          <img src={logo_light} alt="Logo" className="h-16 dark:hidden" />
          <img src={logo_dark} alt="Logo" className="h-16 hidden dark:block" />
        </div>
        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.name} className="relative pt-2">
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                value={form[field.name]}
                onChange={handleChange}
                onFocus={() => handleFocus(field.name)}
                onBlur={() => handleBlur(field.name)}
                required={field.required}
                autoComplete="off"
                className={`peer w-full border border-[#c6c6c6] dark:border-[hsl(0,0%,18.82%)] rounded-lg px-5 py-2 bg-transparent text-gray-900 dark:text-white focus:outline-none 
        ${focused[field.name] || form[field.name] ? "border-t-2" : ""}
      `}
              />
              <label
                htmlFor={field.name}
                className={`absolute left-4 pt-1 px-1 bg-white dark:bg-[#232323] text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none focus:outline-none
        ${
          focused[field.name] || form[field.name]
            ? "text-sm -top-1 font-medium"
            : "text-base top-3"
        }
      `}
                style={{
                  zIndex: 1,
                }}
              >
                {field.label}
              </label>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-semibold py-2 rounded-lg transition"
          style={{
            background: "linear-gradient(90deg, #4d8bfe 0%, #38daca 100%)",
          }}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full mt-2 text-blue-600 dark:text-blue-400 font-semibold py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900 transition"
        >
          Go Back
        </button>
        
        <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors underline"
            >
              Login here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
