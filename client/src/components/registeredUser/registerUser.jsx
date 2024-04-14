import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import { Link,  useNavigate } from "react-router-dom";

const RegisterUser = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/users");
      setUsers(response.data);
      console.log("user data" + response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div>
      <div className={styles.userlist}>
        <h2>Registered Users:</h2>
        <table className={styles.users_table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                <td>
                  <button onClick={() => deleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => { navigate('/') }} className={styles.green_btn}>Back to Home</button>
      </div>
    </div>
  );
};

export default RegisterUser;
