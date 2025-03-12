import { Filter } from "lucide-react";
import {
	Card,
	CardBody,
	Select,
	SelectItem,
	Button,
	CardHeader,
	addToast,
	Skeleton,
} from "@heroui/react";
import { useEffect, useState } from "react";
import ApplicantsModal from "@/components/ApplicantsModal";
import CreateQuestModal from "@/components/CreateQuestModal";
import Header from "@/components/Header";
import { Quest } from "@/pages/Profile";
import QuestCard from "@/components/QuestCard";

interface ProfileComponentProps {
	user: any;
	statusFilter: string;
	setStatusFilter: (filter: string) => void;
	setTopicFilter: (filter: string) => void;
	filteredQuests: any[];
	topicFilter: string;
	allTopics: string[];
	locations: { [key: string]: any };
	otherUserData?: any;
	appliedQuests: any[];
	createdQuests: any[];
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
	topicFilter,
	setTopicFilter,
	filteredQuests,
	allTopics,
	locations,
	otherUserData,
	appliedQuests,
	createdQuests,
}: ProfileComponentProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [applicantsOpen, setApplicantsOpen] = useState(false);
	const [pendingOpen, setPendingOpen] = useState(false);
	const [selectedQuest, setSelectedQuest] = useState<ModifiedQuest | null>(
		null
	);
	const [applicantsQuest, setApplicantsQuest] = useState<Quest | null>(null);
	const [loading, setLoading] = useState(true);

	const displayedUser = otherUserData || user;

	const handleClose = () => setIsOpen(false);
	const handleCloseApplicants = () => setApplicantsOpen(false);

	const statusOptions = [
		{ key: "all", label: "All Quests" },
		{ key: "open", label: "Open" },
		{ key: "closed", label: "Closed" },
	];

	const filteredCreatedQuests = createdQuests.filter((quest) => {
		const statusMatch =
			statusFilter === "all" ||
			(statusFilter === "open" && quest.status === "open") ||
			(statusFilter === "closed" && quest.status === "closed");

		const topicMatch =
			topicFilter === "all" || quest.topics.includes(topicFilter);

		return statusMatch && topicMatch;
	});

	const filteredAppliedQuests = appliedQuests.filter((quest) => {
		const statusMatch =
			statusFilter === "all" ||
			(statusFilter === "open" && quest.status === "open") ||
			(statusFilter === "closed" && quest.status === "closed");

		const topicMatch =
			topicFilter === "all" || quest.topics.includes(topicFilter);

		return statusMatch && topicMatch;
	});

	async function handleDeleteQuest(quest: any) {
		try {
			const response = await fetch(
				`http://localhost:8000/api/quests/${quest._id}`,
				{
					method: "DELETE",
					credentials: "include",
				}
			);
			if (response.ok) {
				addToast({
					title: "Successfully Deleted",
					description: "You have successfully deleted your quest.",
					timeout: 1000,
					shouldShowTimeoutProgress: true,
					variant: "bordered",
					radius: "md",
					color: "success",
				});
				window.location.reload();
			} else {
				console.error("Failed to delete quest");
				addToast({
					title: "Error",
					description: "An error occurred while trying to delete the quest.",
					timeout: 3000,
					shouldShowTimeoutProgress: true,
					variant: "bordered",
					radius: "md",
					color: "danger",
				});
			}
		} catch (error) {
			console.error("Error deleting quest:", error);
		}
	}

	async function handleApplyQuest(quest: any) {
		try {
			const response = await fetch(
				`http://localhost:8000/api/quests/${quest._id}/apply`,
				{
					method: "POST",
					credentials: "include",
				}
			);
			if (response.ok) {
				addToast({
					title: "Successfully Applied",
					description: "You have successfully applied this quest.",
					timeout: 1000,
					shouldShowTimeoutProgress: true,
					variant: "bordered",
					radius: "md",
					color: "success",
				});
				window.location.reload();
			} else {
				console.error("Failed to apply to quest");
				addToast({
					title: "Error",
					description: "An error occurred while trying to apply to a quest.",
					timeout: 3000,
					shouldShowTimeoutProgress: true,
					variant: "bordered",
					radius: "md",
					color: "danger",
				});
			}
		} catch (error) {
			console.error("Error applying to quest:", error);
		}
	}

	async function handleCloseQuest(quest: any) {
		try {
			const response = await fetch(
				`http://localhost:8000/api/quests/${quest._id}/close`,
				{
					method: "POST",
					credentials: "include",
				}
			);
			if (response.ok) {
				addToast({
					title: "Successfully Closed",
					description: "You have successfully closed your quest.",
					timeout: 1000,
					shouldShowTimeoutProgress: true,
					variant: "bordered",
					radius: "md",
					color: "success",
				});
				window.location.reload();
			} else {
				console.error("Failed to close quest");
				addToast({
					title: "Error",
					description: "An error occurred while trying to close the quest.",
					timeout: 3000,
					shouldShowTimeoutProgress: true,
					variant: "bordered",
					radius: "md",
					color: "danger",
				});
			}
		} catch (error) {
			console.error("Error closing quest:", error);
		}
	}

	function handleEditQuest(quest: ModifiedQuest) {
		setSelectedQuest(quest);
		setPendingOpen(true);
	}

	function handleShowApplicants(quest: Quest) {
		setApplicantsQuest(quest);
		setApplicantsOpen(true);
	}

	useEffect(() => {
		if (pendingOpen && selectedQuest) {
			setIsOpen(true);
			setPendingOpen(false);
		}
	}, [pendingOpen, selectedQuest]);

	useEffect(() => {
		if (otherUserData) {
			setLoading(true);
		}
	}, [otherUserData]);

	useEffect(() => {
		if (!otherUserData && user) {
			setLoading(false);
		}
	}, [user, otherUserData]);

	return (
		<div className="min-h-screen bg-slate-50">
			<Header user={displayedUser} profilePage={true} />

			<main className="container mx-auto px-4 py-6">
				<Skeleton isLoaded={loading} className="rounded-lg mb-5">
					<Card className="mb-6 shadow-md">
						<CardBody className="p-6 flex text-center items-center gap-4">
							<div className="flex-shrink-0">
								<img
									src="/avatar.png"
									alt="User Avatar"
									className="w-10 h-10 rounded-full"
								/>
							</div>

							<div>
								<h1 className="text-2xl font-bold">
									{displayedUser.username || "You"}
								</h1>
								<p className="text-gray-600">
									{displayedUser.email || "No email provided"}
								</p>
							</div>
						</CardBody>
					</Card>
				</Skeleton>

				<Card className="mb-6 shadow-sm max-w-xl mx-auto">
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
							onChange={(e) => setStatusFilter(e.target.value.toLowerCase())}
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
						Total Quests ({filteredQuests.length})
					</h2>

					{filteredCreatedQuests.length > 0 && (
						<>
							<h2 className="text-xl font-semibold mb-4">
								Created Quests ({filteredCreatedQuests.length})
							</h2>
							{filteredCreatedQuests.map((quest) => (
								<QuestCard
									key={quest._id}
									quest={quest}
									handleCloseQuest={handleCloseQuest}
									handleShowApplicants={handleShowApplicants}
									handleEditQuest={handleEditQuest}
									handleDeleteQuest={handleDeleteQuest}
									handleApplyQuest={handleApplyQuest}
									location={
										locations[`${quest.latitude}_${quest.longitude}`] || {}
									}
									user={user}
								/>
							))}
						</>
					)}

					{filteredAppliedQuests.length > 0 && (
						<>
							<h2 className="text-xl font-semibold mt-6 mb-4">
								Applied Quests ({filteredAppliedQuests.length})
							</h2>
							{filteredAppliedQuests.map((quest) => (
								<QuestCard
									key={quest._id}
									quest={quest}
									handleCloseQuest={handleCloseQuest}
									handleApplyQuest={handleApplyQuest}
									user={user}
									handleShowApplicants={handleShowApplicants}
									handleEditQuest={handleEditQuest}
									handleDeleteQuest={handleDeleteQuest}
									location={
										locations[`${quest.latitude}_${quest.longitude}`] || {}
									}
								/>
							))}
						</>
					)}
					{selectedQuest && !pendingOpen && (
						<CreateQuestModal
							isOpen={isOpen}
							onClose={handleClose}
							quest={selectedQuest}
						/>
					)}
					{applicantsQuest && (
						<ApplicantsModal
							isOpen={applicantsOpen}
							onClose={handleCloseApplicants}
							quest={applicantsQuest}
							user={user}
						/>
					)}
				</div>
			</main>
		</div>
	);
}

export default ProfileComponent;
