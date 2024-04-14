
import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import Signup from "./components/Singup";
import Login from "./components/Login";
import EmailVerify from "./components/EmailVerify";
import ResetPassword from "./components/ResetPassword";
import RegisterUser from "./components/registeredUser/registerUser";
import MyProfile from "./components/myProfile/myProfile";



function App() {
	const user = localStorage.getItem("token");

	return (
		<Routes>
			{user && <Route path="/" exact element={<Main />} />}
			<Route path="/signup" exact element={<Signup />} />
			<Route path="/login" exact element={<Login />} />
			<Route path="/" element={<Navigate replace to="/login" />} />
			<Route path="/users/:id/verify/:token" element={<EmailVerify />} />
			<Route path ="/reset" element ={<ResetPassword />} />
			<Route path="/user" element ={ <RegisterUser />} />
			<Route path="profile" element ={<MyProfile />} />
			
		</Routes>
	);
}

export default App;
