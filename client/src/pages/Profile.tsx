import { useAuth } from "@/components/AuthContext";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import ProfileComponent from "@/components/ProfileComponent";

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
		return "?";
	}
}

function Profile() {
	const [quests, setQuests] = useState<Quest[]>([]);
	const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
	const [statusFilter, setStatusFilter] = useState("all");
	const [topicFilter, setTopicFilter] = useState("all");
	const { user, loading } = useAuth();
	const [locations, setLocations] = useState<{ [key: string]: any }>({});

	useEffect(() => {
		if (!user) return;

		fetch(`http://localhost:8000/api/users/${user._id}`, {
			credentials: "include",
		})
			.then((res) => res.json())
			.then((data) => {
				const allQuests = [
					...data.user.created_quests,
					...data.user.applied_quests,
				];
				setQuests(allQuests);
				setFilteredQuests(allQuests);

				// Fetch locations for quests with coordinates
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
			.catch((error) => console.error("Error fetching quests:", error));
	}, [user]);

	useEffect(() => {
		let result = [...quests];

		if (statusFilter !== "all") {
			result = result.filter((quest) => quest.status === statusFilter);
		}

		if (topicFilter !== "all") {
			result = result.filter((quest) => quest.topics.includes(topicFilter));
		}

		setFilteredQuests(result);
	}, [statusFilter, topicFilter, quests]);

	if (loading) {
		return <p className="text-center py-8">Loading...</p>;
	}

	if (!user) {
		return <Navigate to="/" />;
	}

	const allTopics = [...new Set(quests.flatMap((quest) => quest.topics))];

	return <ProfileComponent allTopics={allTopics} user={user} locations={locations} statusFilter={statusFilter} setStatusFilter={setStatusFilter} setTopicFilter={setTopicFilter} filteredQuests={filteredQuests} />;
}

export default Profile;
