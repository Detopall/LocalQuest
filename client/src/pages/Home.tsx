import { useAuth } from "@/components/AuthContext";
import { Navigate } from "react-router-dom";
import FilterComponent from "@/components/FilterComponent";
import MapComponent from "@/components/MapComponent";
import Header from "@/components/Header";

const Home = () => {
	const { user, loading } = useAuth();

	if (loading) return <p>Loading...</p>;

	if (!user) {
		alert("Please log in to access this page.");
		return <Navigate to="/" />;
	}

	return (
		<>
			<div className="flex flex-col">
				<Header user={user} />

				<div className="flex min-h-screen pt-16 px-4 gap-4 items-center">
					<FilterComponent />
					<MapComponent />
				</div>
			</div>
		</>
	);
};

export default Home;
