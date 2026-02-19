// src/pages/DeliveryRegister.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./DeliveryRegister.css"; // Assuming common styling with login, or create DeliveryRegister.css if preferred

function DeliveryRegister() {
  const navigate = useNavigate();
  const apiRoot = window.foodimeApiSettings?.root || ""; // Get API root from WordPress settings

  // State for form fields
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    contactNumber: "",
    vehicleModel: "",
    licensePlate: "",
    bankAccountName: "",
    bankAccountNumber: "",
    ifscCode: "",
    driverLicense: null, // For file object
    aadhaarCard: null, // For file object
  });

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({}); // To store validation errors for specific fields

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error for the field being changed
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    setError(null); // Clear general error on input change
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!formData.username || formData.username.trim().length < 4) {
      errors.username = "Username must be at least 4 characters.";
      isValid = false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format.";
      isValid = false;
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
      isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }
    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required.";
      isValid = false;
    }
    if (
      !formData.contactNumber ||
      !/^\+?[0-9\s-]{10,15}$/.test(formData.contactNumber)
    ) {
      errors.contactNumber =
        "Invalid contact number (10-15 digits, optional +).";
      isValid = false;
    }
    if (!formData.vehicleModel.trim()) {
      errors.vehicleModel = "Vehicle Model is required.";
      isValid = false;
    }
    if (
      !formData.licensePlate ||
      !/^[A-Za-z0-9]{4,15}$/.test(formData.licensePlate)
    ) {
      errors.licensePlate =
        "Invalid license plate (4-15 alphanumeric characters).";
      isValid = false;
    }
    if (!formData.bankAccountName.trim()) {
      errors.bankAccountName = "Bank Account Name is required.";
      isValid = false;
    }
    if (
      !formData.bankAccountNumber ||
      !/^[0-9]{9,18}$/.test(formData.bankAccountNumber)
    ) {
      errors.bankAccountNumber = "Invalid bank account number (9-18 digits).";
      isValid = false;
    }
    if (
      !formData.ifscCode ||
      !/^[A-Za-z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)
    ) {
      errors.ifscCode = "Invalid IFSC code (e.g., ABCD0123456).";
      isValid = false;
    }
    if (!formData.driverLicense) {
      errors.driverLicense = "Driver License file is required.";
      isValid = false;
    } else if (formData.driverLicense.size > 5 * 1024 * 1024) {
      // 5MB limit
      errors.driverLicense = "Driver License file size cannot exceed 5MB.";
      isValid = false;
    }
    if (formData.aadhaarCard && formData.aadhaarCard.size > 5 * 1024 * 1024) {
      errors.aadhaarCard = "Aadhaar Card file size cannot exceed 5MB.";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({}); // Clear all previous field errors

    if (!validateForm()) {
      setLoading(false);
      setError("Please correct the errors in the form.");
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append("username", formData.username);
      dataToSend.append("email", formData.email);
      dataToSend.append("password", formData.password);
      dataToSend.append("full_name", formData.fullName);
      dataToSend.append("contact_number", formData.contactNumber);
      dataToSend.append("vehicle_model", formData.vehicleModel);
      dataToSend.append("license_plate", formData.licensePlate);
      dataToSend.append("bank_account_name", formData.bankAccountName);
      dataToSend.append("bank_account_number", formData.bankAccountNumber);
      dataToSend.append("ifsc_code", formData.ifscCode);

      // Append files if they exist
      if (formData.driverLicense) {
        dataToSend.append("driver_license", formData.driverLicense);
      }
      if (formData.aadhaarCard) {
        dataToSend.append("aadhaar_card", formData.aadhaarCard);
      }

      const response = await fetch(
        `${apiRoot}foodime/v1/delivery-partner-register`,
        {
          method: "POST",
          // For FormData, 'Content-Type' header is usually omitted; browser sets it with boundary.
          // headers: { 'Content-Type': 'multipart/form-data' }, // DO NOT set this header manually with FormData
          body: dataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific field errors from the server if available
        if (data.errors && typeof data.errors === "object") {
          setFieldErrors(data.errors); // Server-side validation errors
        }
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      if (data.success) {
        setSuccessMessage(
          data.message ||
            "Registration successful! Please wait for admin approval."
        );
        // Optional: Clear form after successful submission
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          fullName: "",
          contactNumber: "",
          vehicleModel: "",
          licensePlate: "",
          bankAccountName: "",
          bankAccountNumber: "",
          ifscCode: "",
          driverLicense: null,
          aadhaarCard: null,
        });
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate("/delivery-login");
        }, 3000); // Redirect after 3 seconds
      } else {
        setError(
          data.message || "An unknown error occurred during registration."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.message || "Network error. Could not connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-register-container">
      <div className="register-card">
        <h2>Become a Foodime Delivery Partner</h2>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Basic Information */}
          <h3>Personal Information</h3>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.username ? "input-error" : ""}
            />
            {fieldErrors.username && (
              <p className="field-error">{fieldErrors.username}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.email ? "input-error" : ""}
            />
            {fieldErrors.email && (
              <p className="field-error">{fieldErrors.email}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.password ? "input-error" : ""}
            />
            {fieldErrors.password && (
              <p className="field-error">{fieldErrors.password}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.confirmPassword ? "input-error" : ""}
            />
            {fieldErrors.confirmPassword && (
              <p className="field-error">{fieldErrors.confirmPassword}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.fullName ? "input-error" : ""}
            />
            {fieldErrors.fullName && (
              <p className="field-error">{fieldErrors.fullName}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.contactNumber ? "input-error" : ""}
            />
            {fieldErrors.contactNumber && (
              <p className="field-error">{fieldErrors.contactNumber}</p>
            )}
          </div>

          {/* Vehicle Information */}
          <h3>Vehicle Information</h3>
          <div className="form-group">
            <label htmlFor="vehicleModel">Vehicle Model</label>
            <input
              type="text"
              id="vehicleModel"
              name="vehicleModel"
              value={formData.vehicleModel}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.vehicleModel ? "input-error" : ""}
            />
            {fieldErrors.vehicleModel && (
              <p className="field-error">{fieldErrors.vehicleModel}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="licensePlate">License Plate Number</label>
            <input
              type="text"
              id="licensePlate"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.licensePlate ? "input-error" : ""}
            />
            {fieldErrors.licensePlate && (
              <p className="field-error">{fieldErrors.licensePlate}</p>
            )}
          </div>

          {/* Banking Information */}
          <h3>Bank Details (for payouts)</h3>
          <div className="form-group">
            <label htmlFor="bankAccountName">Bank Account Holder Name</label>
            <input
              type="text"
              id="bankAccountName"
              name="bankAccountName"
              value={formData.bankAccountName}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.bankAccountName ? "input-error" : ""}
            />
            {fieldErrors.bankAccountName && (
              <p className="field-error">{fieldErrors.bankAccountName}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="bankAccountNumber">Bank Account Number</label>
            <input
              type="text"
              id="bankAccountNumber"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.bankAccountNumber ? "input-error" : ""}
            />
            {fieldErrors.bankAccountNumber && (
              <p className="field-error">{fieldErrors.bankAccountNumber}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="ifscCode">IFSC Code</label>
            <input
              type="text"
              id="ifscCode"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.ifscCode ? "input-error" : ""}
            />
            {fieldErrors.ifscCode && (
              <p className="field-error">{fieldErrors.ifscCode}</p>
            )}
          </div>

          {/* Document Uploads */}
          <h3>Document Uploads (Max 5MB per file)</h3>
          <div className="form-group file-upload-group">
            <label htmlFor="driverLicense">
              Driver's License (JPG, PNG, PDF)
            </label>
            <input
              type="file"
              id="driverLicense"
              name="driverLicense"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.driverLicense ? "input-error" : ""}
            />
            {formData.driverLicense && (
              <span className="file-name">{formData.driverLicense.name}</span>
            )}
            {fieldErrors.driverLicense && (
              <p className="field-error">{fieldErrors.driverLicense}</p>
            )}
          </div>
          <div className="form-group file-upload-group">
            <label htmlFor="aadhaarCard">
              Aadhaar Card (Optional - JPG, PNG, PDF)
            </label>
            <input
              type="file"
              id="aadhaarCard"
              name="aadhaarCard"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
              disabled={loading}
              className={fieldErrors.aadhaarCard ? "input-error" : ""}
            />
            {formData.aadhaarCard && (
              <span className="file-name">{formData.aadhaarCard.name}</span>
            )}
            {fieldErrors.aadhaarCard && (
              <p className="field-error">{fieldErrors.aadhaarCard}</p>
            )}
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="login-link">
          Already a partner? <Link to="/delivery-login">Login Here</Link>
        </p>
      </div>
    </div>
  );
}

export default DeliveryRegister;
