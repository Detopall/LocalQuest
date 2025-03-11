import { useAuth } from "@/components/AuthContext";
import { Navigate } from "react-router-dom";
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
				<MapComponent user={user} />
			</div>
		</>
	);
};

export default Home;
