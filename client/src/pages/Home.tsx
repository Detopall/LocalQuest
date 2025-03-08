import { useAuth } from "@/components/AuthContext";
import { Navigate } from "react-router-dom";
import FilterComponent from "@/components/FilterComponent";
import MapComponent from "@/components/MapComponent";
import Header from "@/components/Header";
import { addToast } from "@heroui/react";

const Home = () => {
	const { user, loading } = useAuth();

	if (loading) return <p>Loading...</p>;

	if (!user) {
		addToast({
			title: "Unauthorized",
			description: "You must be logged in to access this page.",
			timeout: 3000,
			shouldShowTimeoutProgress: true,
			variant: "bordered",
			radius: "md",
			color: "danger",
		});
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
