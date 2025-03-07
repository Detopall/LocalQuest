import QuestCard, { SmallQuestCard } from "@/components/Quest";
import { useState, useEffect } from "react";

interface Quest {
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

	useEffect(() => {
		const tempQuests: Quest[] = [
			{
				title: "Quest 1",
				description: "Test description 1",
				topics: ["common", "topic1"],
				longitude: 10.0,
				latitude: 20.0,
				price: 10.0,
				deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
				applicants: [],
				status: "open",
			},
			{
				title: "Quest 2",
				description: "Test description 2",
				topics: ["topic2", "common"],
				longitude: 15.0,
				latitude: 25.0,
				price: 15.0,
				deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
				applicants: [],
				status: "open",
			},
			{
				title: "Quest 3",
				description: "Test description 3",
				topics: ["topic3"],
				longitude: 30.0,
				latitude: 40.0,
				price: 30.0,
				deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
				applicants: [],
				status: "open",
			},
		];

		Promise.all(
			tempQuests.map(async (quest) => {
				const location = await fetchLocation(quest.latitude, quest.longitude);
				return { ...quest, location };
			})
		).then((questsWithLocation) => setQuests(questsWithLocation));
	}, []);

	return (
		<div>
			<h1>Profile</h1>
			{quests.map((quest, index) => (
				<>
					<QuestCard key={index} quest={quest} />
					<SmallQuestCard key={index} quest={quest} />
				</>
			))}
		</div>
	);
}

export default Profile;
