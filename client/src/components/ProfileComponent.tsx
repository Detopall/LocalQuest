import { MapPin, Filter } from "lucide-react";
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
import { useEffect, useState } from "react";
import CreateQuestModal from "@/components/CreateQuestModal";
import Header from "@/components/Header";
import {
	ClockSvg,
	WarningSvg,
	DangerSvg,
	TrashSvg,
	EditSvg,
} from "@/components/svgs";

interface ProfileComponentProps {
	user: any;
	statusFilter: string;
	setStatusFilter: (filter: string) => void;
	setTopicFilter: (filter: string) => void;
	filteredQuests: any[];
	allTopics: string[];
	locations: { [key: string]: any };
}

interface ModifiedQuest {
	_id: string;
	title: string;
	description: string;
	longitude: string;
	latitude: string;
	price: string;
	deadline: string;
	topics: string[];
}

function ProfileComponent({
	user,
	statusFilter,
	setStatusFilter,
	setTopicFilter,
	filteredQuests,
	allTopics,
	locations,
}: ProfileComponentProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [pendingOpen, setPendingOpen] = useState(false);
	const handleClose = () => setIsOpen(false);
	const [selectedQuest, setSelectedQuest] = useState<ModifiedQuest | null>(
		null
	);

	const statusOptions = [
		{ key: "all", label: "All Quests" },
		{ key: "open", label: "Open" },
		{ key: "closed", label: "Closed" },
	];

	function getDeadlineChip(deadline: string) {
		const deadlineDate = new Date(deadline);
		const now = new Date();
		const timeDiff = deadlineDate.getTime() - now.getTime();
		const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

		let color: "success" | "warning" | "danger" = "success";
		let icon = <ClockSvg />;

		if (daysDiff <= 7 && daysDiff > 1) {
			color = "warning";
			icon = <WarningSvg />;
		} else if (daysDiff <= 1) {
			color = "danger";
			icon = <DangerSvg />;
		}

		return (
			<Chip variant="shadow" color={color} startContent={icon}>
				{deadlineDate.toLocaleDateString()}
			</Chip>
		);
	}

	async function handleDeleteQuest(questId: number) {
		try {
			const response = await fetch(
				`http://localhost:8000/api/quests/${questId}`,
				{
					method: "DELETE",
					credentials: "include",
				}
			);
			if (response.ok) {
				window.location.reload();
			} else {
				console.error("Failed to delete quest");
			}
		} catch (error) {
			console.error("Error deleting quest:", error);
		}
	}

	function handleEditQuest(quest: ModifiedQuest) {
		setSelectedQuest(quest);
		setPendingOpen(true);
	}

	useEffect(() => {
		if (pendingOpen && selectedQuest) {
			setIsOpen(true);
			setPendingOpen(false);
		}
	}, [pendingOpen, selectedQuest]);

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

				<div className="space-y-4 flex justify-center flex-col items-center">
					<h2 className="text-xl font-semibold mb-4">
						Your Quests ({filteredQuests.length})
					</h2>

					{filteredQuests.length > 0 ? (
						filteredQuests.map((quest: any) => {
							const location =
								locations[`${quest.latitude}_${quest.longitude}`] || {};

							return (
								<Card
									key={quest._id}
									className="overflow-hidden hover:shadow-md transition-shadow w-3/4"
								>
									<CardBody className="p-4">
										<div className="flex justify-between items-start mb-2">
											<h3 className="text-lg font-semibold">{quest.title}</h3>
											<div className="flex flex-wrap gap-2">
												<Button
													isIconOnly
													aria-label="Edit"
													color="warning"
													onPress={() => handleEditQuest(quest)}
												>
													<EditSvg />
												</Button>
												<Button
													isIconOnly
													aria-label="Edit"
													color="danger"
													onPress={() => handleDeleteQuest(quest)}
												>
													<TrashSvg />
												</Button>
											</div>
										</div>

										<p className="text-gray-700 mb-3">{quest.description}</p>

										<div className="flex flex-wrap gap-2 mb-3">
											{quest.topics.map((topic: string, index: number) => (
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
											<div className="flex items-center gap-5">
												{getDeadlineChip(quest.deadline)}
												<Chip
													variant="shadow"
													color={quest.status === "open" ? "success" : "danger"}
												>
													{quest.status}
												</Chip>
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
				{selectedQuest && !pendingOpen && (
					<CreateQuestModal
						isOpen={isOpen}
						onClose={handleClose}
						quest={selectedQuest}
					/>
				)}
			</main>
		</div>
	);
}

export default ProfileComponent;
