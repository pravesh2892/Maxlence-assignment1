import { useState,  } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";


const Signup = () => {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    profileImage: null,
  });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [imagePreview, setImagePreview] = useState(null); 
 
  const handleChange = ({ target }) => {
    if (target.name === "profileImage") {
      setData({ ...data, profileImage: target.files[0] });

      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(target.files[0]);
    } else {
      setData({ ...data, [target.name]: target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("profileImage", data.profileImage);

      const url = "http://localhost:8080/api/users";
      const { data: res } = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMsg(res.message);
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <div className={styles.signup_container}>
      <div className={styles.signup_form_container}>
        <div className={styles.left}>
          <h1>Welcome Back</h1>
          <Link to="/login">
            <button type="button" className={styles.white_btn}>
              Sign in
            </button>
          </Link>
        </div>
        <div className={styles.right}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Create Account</h1>
            <div className={styles.circular_input_container}>
              {imagePreview ? (
                <div className={styles.circular_image_preview}>
                  <img src={imagePreview} alt="Profile Preview" />
                </div>
              ) : (
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlAU_is3KC3dMqvM79W0MgirCJ1qO5CfxX1w&usqp=CAU"
                  alt="Add Photo"
                  className={styles.default_image}
                />
              )}
              <input
                type="file"
                accept="image/*"
                name="profileImage"
                onChange={handleChange}
                className={styles.circular_input}
              />
            </div>
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              onChange={handleChange}
              value={data.firstName}
              required
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              onChange={handleChange}
              value={data.lastName}
              required
              className={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={data.email}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={data.password}
              required
              className={styles.input}
            />
          
           
            {error && <div className={styles.error_msg}>{error}</div>}
            {msg && <div className={styles.success_msg}>{msg}</div>}
            <button type="submit" className={styles.green_btn}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
