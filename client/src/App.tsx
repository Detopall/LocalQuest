import Hero, { AuthProvider } from "@/components/Hero";
import Profile from "@/pages/Profile";
import { Route, Routes } from "react-router-dom";

function App() {
	return (
		<>
			<Routes>
				<Route
					path="/"
					element={
						<AuthProvider>
							<Hero />
						</AuthProvider>
					}
				/>
				<Route path="/profile" element={<Profile />} />
			</Routes>
		</>
	);
}

export default App;
