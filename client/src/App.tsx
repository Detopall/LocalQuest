import Hero from "@/components/Hero";
import Home from "@/pages/Home";
import { AuthProvider } from "@/components/AuthContext";
import Profile from "@/pages/Profile";
import ProfileOther from "@/pages/ProfileOther";
import { Route, Routes } from "react-router-dom";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Hero />} />
			<Route
				path="/home"
				element={
					<AuthProvider>
						<Home />
					</AuthProvider>
				}
			/>
			<Route
				path="/profile"
				element={
					<AuthProvider>
						<Profile />
					</AuthProvider>
				}
			/>
			<Route
				path="/profile/:idOrUsername"
				element={
					<AuthProvider>
						<ProfileOther />
					</AuthProvider>
				}
			/>
		</Routes>
	);
}

export default App;
