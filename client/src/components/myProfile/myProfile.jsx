import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./styles.module.css";
import { Link,  useNavigate } from "react-router-dom";

function MyProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const userEmail = localStorage.getItem("email");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const filteredUser = response.data.find(user => user.email === userEmail);
        setUser(filteredUser);
        setFormData({
          firstName: filteredUser.firstName,
          lastName: filteredUser.lastName,
          email: filteredUser.email,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, [userEmail]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`http://localhost:8080/api/users/${user._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <div className={styles.profile_container}>
      {user ? (
        <div className={styles.profile_info}>
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  className={styles.profile_input}
                  onChange={handleInputChange}
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="lastName"
                  className={styles.profile_input}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  className={styles.profile_input}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </div>
              <div>
                <button className={styles.profile_btn} type="submit">Save</button>
                <button className={styles.profile_btn} type="button" onClick={handleCancelClick}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              {user.profileImage && <img className={styles.profile_image} src={user.profileImage} alt="Profile" />}
              <h2>{user.firstName} {user.lastName}</h2>
              <p>Email: {user.email}</p>
              <button className={styles.profile_btn} onClick={handleEditClick}>Edit</button>
              <button className={styles.profile_btn} onClick={() => { navigate('/') }}>Back to Home</button>
            </>
          )}
        </div>
      ) : (
        <p className={styles.loading}>Loading...</p>
      )}
    </div>
  );
}

export default MyProfile;
