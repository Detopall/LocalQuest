import { useEffect } from "react";
import Profile from "./Profile";
import { useParams } from "react-router-dom";
import { addToast } from "@heroui/react";

function ProfileOther() {
	const { idOrUsername } = useParams();

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(
					`http://localhost:8000/api/users/${idOrUsername}`,
					{
						credentials: "include",
					}
				);
				if (!response.ok) {
					addToast({
						title: "Invalid User",
						description: "The user you are trying to view does not exist.",
						timeout: 3000,
						shouldShowTimeoutProgress: true,
						variant: "bordered",
						radius: "md",
						color: "danger",
					});
					window.location.href = "/profile";
				}
			} catch (error) {
				console.error("Error fetching user:", error);
				addToast({
					title: "Error",
					description: "An error occurred while trying to fetch the user.",
					timeout: 3000,
					shouldShowTimeoutProgress: true,
					variant: "bordered",
					radius: "md",
					color: "danger",
				});
				window.location.href = "/profile";
			}
		};

		fetchUser();
	}, [idOrUsername]);

	idOrUsername && sessionStorage.setItem("otherUserId", idOrUsername);
	const otherUserId = sessionStorage.getItem("otherUserId");
	return (
		<>{otherUserId ? <Profile otherUserId={otherUserId} /> : <Profile />}</>
	);
}

export default ProfileOther;
