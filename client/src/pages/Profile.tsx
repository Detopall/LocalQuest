import { useAuth } from "@/components/AuthContext";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
	Card,
	CardBody,
	Select,
	SelectItem,
	Avatar,
	Button,
	CardHeader,
	Badge,
} from "@heroui/react";
import { MapPin, Filter } from "lucide-react";

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
	const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
	const [statusFilter, setStatusFilter] = useState("all");
	const [topicFilter, setTopicFilter] = useState("all");
	const { user, loading } = useAuth();

	// Extract unique topics from quests
	const allTopics = [...new Set(quests.flatMap((quest) => quest.topics))];

	useEffect(() => {
		if (!user) return;

		const tempQuests: Quest[] = [
			{
				title: "Research Local Business Opportunities",
				description:
					"Conduct market research for potential business expansion in the downtown area.",
				topics: ["research", "business"],
				longitude: 10.0,
				latitude: 20.0,
				price: 120.0,
				deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
				applicants: [],
				status: "open",
			},
			{
				title: "Translate Product Documentation",
				description:
					"Translate technical documentation from English to Spanish for software product.",
				topics: ["translation", "writing"],
				longitude: 15.0,
				latitude: 25.0,
				price: 85.0,
				deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
				applicants: [],
				status: "in progress",
			},
			{
				title: "Event Photography",
				description:
					"Take professional photos at the local farmers market festival.",
				topics: ["photography", "events"],
				longitude: 35.0,
				latitude: 45.0,
				price: 200.0,
				deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
				applicants: [],
				status: "completed",
			},
		];

		// Fetch location data asynchronously and update quests
		Promise.all(
			tempQuests.map(async (quest) => {
				const location = await fetchLocation(quest.latitude, quest.longitude);
				return { ...quest, location };
			})
		).then((questsWithLocation) => {
			setQuests(questsWithLocation);
			setFilteredQuests(questsWithLocation);
		});
	}, [user]);

	// Apply filters when they change
	useEffect(() => {
		let result = [...quests];

		// Apply status filter
		if (statusFilter !== "all") {
			result = result.filter((quest) => quest.status === statusFilter);
		}

		// Apply topic filter
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

	return (
		<div className="min-h-screen bg-slate-50">
			<Header user={user} />

			<main className="container mx-auto px-4 py-6">
				{/* Simple Profile Header */}
				<Card className="mb-6 shadow-md">
					<CardBody className="p-6">
						<div className="flex items-center gap-4">
							<Avatar
								className="h-7 w-7"
								src="https://i.pravatar.cc/150?u=a04258114e29026708c"
							/>

							<div>
								<h1 className="text-2xl font-bold">
									{user.username || "You"}
								</h1>
								<p className="text-gray-600">
									{user.email || "No email provided"}
								</p>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Filters Section */}
				<Card className="mb-6 shadow-sm">
					<CardHeader className="pb-3">
						<h2 className="text-lg flex items-center gap-2">
							<Filter size={18} />
							<span>Filter Quests</span>
						</h2>
					</CardHeader>
					<CardBody className="flex flex-wrap gap-4">
						<div className="w-full sm:w-auto">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Status
							</label>
							<Select
								defaultSelectedKeys={["all"]}
								onChange={(e) => setStatusFilter(e.target.value.toLowerCase())}
							>
								<SelectItem>All Status</SelectItem>
								<SelectItem>Open</SelectItem>
								<SelectItem>In Progress</SelectItem>
								<SelectItem>Completed</SelectItem>
							</Select>
						</div>

						<div className="w-full sm:w-auto">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Topic
							</label>
							<Select
								defaultSelectedKeys={["all"]}
								onSelectionChange={(e) => setTopicFilter(e.currentKey || "all")}
								items={[
									{ key: "all", label: "All Topics" },
									...allTopics.map((topic) => ({ key: topic, label: topic })),
								]}
							>
								{(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
							</Select>
						</div>

						<div className="flex items-end ml-auto">
							<Button
								color="default"
								variant="ghost"
								onPress={() => {
									setStatusFilter("all");
									setTopicFilter("all");
								}}
								className="h-10"
							>
								Reset Filters
							</Button>
						</div>
					</CardBody>
				</Card>

				{/* Quests List */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold mb-4">
						Your Quests ({filteredQuests.length})
					</h2>

					{filteredQuests.length > 0 ? (
						filteredQuests.map((quest) => (
							<Card
								key={quest.title}
								className="overflow-hidden hover:shadow-md transition-shadow"
							>
								<CardBody className="p-4">
									<div className="flex justify-between items-start mb-2">
										<h3 className="text-lg font-semibold">{quest.title}</h3>
										<Badge
											variant="shadow"
											color={
												quest.status === "completed" ? "success" : "warning"
											}
											className="capitalize"
										>
											{quest.status}
										</Badge>
									</div>

									<p className="text-gray-700 mb-3">{quest.description}</p>

									<div className="flex flex-wrap gap-2 mb-3">
										{quest.topics.map((topic, index) => (
											<Badge
												key={index}
												variant="shadow"
												className="capitalize"
											>
												{topic}
											</Badge>
										))}
									</div>

									<div className="flex justify-between items-center text-sm text-gray-600">
										<div className="flex items-center gap-1">
											<MapPin size={14} />
											<span>
												{quest.location?.town || quest.location?.village || ""}
												{quest.location?.country
													? `, ${quest.location.country}`
													: ""}
											</span>
										</div>
										<div className="font-medium text-primary">
											${quest.price.toFixed(2)}
										</div>
									</div>
								</CardBody>
							</Card>
						))
					) : (
						<div className="text-center p-8 bg-white rounded-lg border">
							<p className="text-gray-500">
								No matching quests found. Try adjusting your filters.
							</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

export default Profile;
