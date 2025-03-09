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
	Chip,
} from "@heroui/react";
import { MapPin, Filter } from "lucide-react";

interface Quest {
	_id: number;
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

const statusOptions = [
	{ key: "all", label: "All Quests" },
	{ key: "open", label: "Open" },
	{ key: "closed", label: "Closed" },
];

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

	function getDeadlineChip(deadline: string) {
		const deadlineDate = new Date(deadline);
		const now = new Date();
		const timeDiff = deadlineDate.getTime() - now.getTime();
		const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

		let color: "success" | "warning" | "danger" = "success";
		let icon = (
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m9.828-5.243a1 1 0 0 1 1 1v4.968l3.527 1.34a1 1 0 1 1-.71 1.87l-4.172-1.586a1 1 0 0 1-.645-.935V7.757a1 1 0 0 1 1-1"
					fill="currentColor"
				/>
			</svg>
		);

		if (daysDiff <= 7 && daysDiff > 1) {
			color = "warning";
			icon = (
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 9v5m0 7.41H5.94c-3.47 0-4.92-2.48-3.24-5.51l3.12-5.62L8.76 5c1.78-3.21 4.7-3.21 6.48 0l2.94 5.29 3.12 5.62c1.68 3.03.22 5.51-3.24 5.51H12z"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M11.995 17h.009"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		} else if (daysDiff <= 1) {
			color = "danger";
			icon = (
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1m0 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
						fill="currentColor"
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0"
						fill="currentColor"
					/>
				</svg>
			);
		}

		return (
			<Chip variant="shadow" color={color} startContent={icon}>
				{deadlineDate.toLocaleDateString()}
			</Chip>
		);
	}

	const allTopics = [...new Set(quests.flatMap((quest) => quest.topics))];
	console.log(quests);

	return (
		<div className="min-h-screen bg-slate-50">
			<Header user={user} profilePage={true} />

			<main className="container mx-auto px-4 py-6">
				<Card className="mb-6 shadow-md">
					<CardBody className="p-6 flex text-center items-center gap-4">
						<Avatar
							className="h-15 w-15"
							src="https://i.pravatar.cc/150?u=a04258114e29026708c"
						/>
						<div>
							<h1 className="text-2xl font-bold">{user.username || "You"}</h1>
							<p className="text-gray-600">
								{user.email || "No email provided"}
							</p>
						</div>
					</CardBody>
				</Card>

				<Card className="mb-6 shadow-sm">
					<CardHeader className="pb-3">
						<h2 className="text-lg flex items-center gap-2">
							<Filter size={18} />
							<span>Filter Quests</span>
						</h2>
					</CardHeader>
					<CardBody className="flex flex-wrap gap-4">
						<Select
							defaultSelectedKeys={["all"]}
							label="Status"
							onChange={(e) => {
								setStatusFilter(e.target.value.toLowerCase());
							}}
							value={statusFilter}
						>
							{statusOptions.map((option) => (
								<SelectItem key={option.key}>{option.label}</SelectItem>
							))}
						</Select>

						<Select
							defaultSelectedKeys={["all"]}
							onSelectionChange={(e) => setTopicFilter(e.currentKey || "all")}
							label="Topic"
							items={[
								{ key: "all", label: "All Topics" },
								...allTopics.map((topic) => ({ key: topic, label: topic })),
							]}
						>
							{(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
						</Select>

						<Button
							color="default"
							variant="ghost"
							onPress={() => {
								setStatusFilter("all");
								setTopicFilter("all");
							}}
							className="h-10 ml-auto"
						>
							Reset Filters
						</Button>
					</CardBody>
				</Card>

				<div className="space-y-4">
					<h2 className="text-xl font-semibold mb-4">
						Your Quests ({filteredQuests.length})
					</h2>

					{filteredQuests.length > 0 ? (
						filteredQuests.map((quest) => {
							const locationKey = `${quest.latitude}_${quest.longitude}`;
							const location = locations[locationKey] || {};

							return (
								<Card
									key={quest._id}
									className="overflow-hidden hover:shadow-md transition-shadow"
								>
									<CardBody className="p-4">
										<div className="flex justify-between items-start mb-2">
											<h3 className="text-lg font-semibold">{quest.title}</h3>
											<div className="flex gap-5">
												{getDeadlineChip(quest.deadline)}
												<Chip
													variant="shadow"
													color={quest.status === "open" ? "success" : "danger"}
												>
													{quest.status}
												</Chip>
											</div>
										</div>

										<p className="text-gray-700 mb-3">{quest.description}</p>

										<div className="flex flex-wrap gap-2 mb-3">
											{quest.topics.map((topic, index) => (
												<Chip key={index} variant="shadow" color="primary">
													{topic}
												</Chip>
											))}
										</div>

										<div className="flex justify-between items-center text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<MapPin size={14} />
												<span>
													{location.town ||
														location.village ||
														location.city ||
														location.state ||
														location.province ||
														location.region ||
														"Unknown"}
													, {location.country || "Unknown"}
												</span>
											</div>
											<div className="font-medium text-primary">
												bux: {quest.price.toFixed(2)}
											</div>
										</div>
									</CardBody>
								</Card>
							);
						})
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
