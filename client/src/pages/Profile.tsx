import { useAuth } from "@/components/AuthContext";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import ProfileComponent from "@/components/ProfileComponent";
import { addToast } from "@heroui/react";

export interface Quest {
	_id: string;
	title: string;
	description: string;
	topics: string[];
	longitude: number;
	latitude: number;
	price: number;
	deadline: string;
	applicants: any[];
	status: string;
	location?: {
		village?: string;
		town?: string;
		province?: string;
		region?: string;
		country?: string;
	};
}

async function fetchLocation(lat: number, lon: number) {
	const cacheKey = `location_${lat}_${lon}`;
	const cacheTimeKey = `${cacheKey}_time`;
	const cached = localStorage.getItem(cacheKey);
	const cacheTime = localStorage.getItem(cacheTimeKey);
	const cacheExpiry = 4 * 60 * 60 * 1000; // 4 hours

	if (cached && cacheTime && Date.now() - Number(cacheTime) < cacheExpiry) {
		return JSON.parse(cached);
	}

	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
		);
		const data = await response.json();

		const location = {
			village: data.address?.village,
			town: data.address?.town,
			city: data.address?.city,
			state: data.address?.state,
			province: data.address?.province,
			region: data.address?.region,
			country: data.address?.country,
		};

		localStorage.setItem(cacheKey, JSON.stringify(location));
		localStorage.setItem(cacheTimeKey, Date.now().toString());
		return location;
	} catch (error) {
		console.error("Error fetching location:", error);
		addToast({
			title: "Error",
			description: "An error occurred while fetching your location.",
			timeout: 3000,
			shouldShowTimeoutProgress: true,
			variant: "bordered",
			radius: "md",
			color: "danger",
		});
		return "?";
	}
}

interface ProfileProps {
	otherUserId?: string;
}

function Profile({ otherUserId }: ProfileProps) {
	const [createdQuests, setCreatedQuests] = useState<Quest[]>([]);
	const [appliedQuests, setAppliedQuests] = useState<Quest[]>([]);
	const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
	const [statusFilter, setStatusFilter] = useState("all");
	const [topicFilter, setTopicFilter] = useState("all");
	const { user, loading } = useAuth();
	const [locations, setLocations] = useState<{ [key: string]: any }>({});
	const [userData, setUserData] = useState<any>(null);

	useEffect(() => {
		if (!user) return;
		const userId = otherUserId || user._id;

		fetch(`http://localhost:8000/api/users/${userId}`, {
			credentials: "include",
		})
			.then((res) => res.json())
			.then((data) => {
				setCreatedQuests(data.user.created_quests || []);
				setAppliedQuests(data.user.applied_quests || []);
				setUserData(data.user);

				const allQuests = [
					...(data.user.created_quests || []),
					...(data.user.applied_quests || []),
				];
				setFilteredQuests(allQuests);

				allQuests.forEach((quest) => {
					if (quest.latitude !== undefined && quest.longitude !== undefined) {
						const locationKey = `${quest.latitude}_${quest.longitude}`;
						if (!locations[locationKey]) {
							fetchLocation(quest.latitude, quest.longitude).then(
								(locationData) => {
									setLocations((prevLocations) => ({
										...prevLocations,
										[locationKey]: locationData,
									}));
								}
							);
						}
					}
				});
			})
			.catch((error) => {
				console.error("Error fetching quests:", error);
				addToast({
					title: "Error",
					description: "An error occurred while trying to fetch the quests.",
					timeout: 3000,
					shouldShowTimeoutProgress: true,
					variant: "bordered",
					radius: "md",
					color: "danger",
				});
			});
	}, [user, otherUserId]);

	useEffect(() => {
		let result = [...createdQuests, ...appliedQuests];

		if (statusFilter !== "all") {
			result = result.filter((quest) => quest.status === statusFilter);
		}

		if (topicFilter !== "all") {
			result = result.filter((quest) => quest.topics.includes(topicFilter));
		}

		setFilteredQuests(result);
	}, [statusFilter, topicFilter, createdQuests, appliedQuests]);

	if (loading) {
		return <p className="text-center py-8">Loading...</p>;
	}

	if (!user) {
		return <Navigate to="/" />;
	}

	const allTopics = [
		...new Set(
			[...createdQuests, ...appliedQuests].flatMap((quest) => quest.topics)
		),
	];

	return (

			<ProfileComponent
				allTopics={allTopics}
				user={user}
				locations={locations}
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				setTopicFilter={setTopicFilter}
				topicFilter={topicFilter}
				filteredQuests={filteredQuests}
				otherUserData={userData}
				appliedQuests={appliedQuests}
				createdQuests={createdQuests}
			/>
	);
}

export default Profile;
