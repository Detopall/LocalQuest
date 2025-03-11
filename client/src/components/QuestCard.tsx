import {
	TrashSvg,
	EditSvg,
	GroupSvg,
	ClockSvg,
	WarningSvg,
	DangerSvg,
	CreateQuestSvg,
	UserSvg,
} from "@/components/svgs";
import { MapPin } from "lucide-react";
import { Card, CardBody, Button, Chip } from "@heroui/react";

interface QuestCardProps {
	quest: any;
	handleShowApplicants: (quest: any) => void;
	handleEditQuest: (quest: any) => void;
	handleDeleteQuest: (quest: any) => void;
	handleApplyQuest: (quest: any) => void;
	location: any;
	user: any;
}

function QuestCard({
	quest,
	handleShowApplicants,
	handleEditQuest,
	handleApplyQuest,
	handleDeleteQuest,
	location,
	user,
}: QuestCardProps) {
	if (!quest) {
		return null;
	}

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

	const isUserNotApplied = !quest.applicants.some(
		(applicant: { _id: any }) => applicant._id === user._id
	);

	console.log(quest);

	return (
		<Card
			key={quest._id}
			className="overflow-hidden hover:shadow-md transition-shadow w-3/4"
		>
			<CardBody className="p-4">
				<div className="flex justify-between items-start mb-2">
					<h3 className="text-lg font-semibold">{quest.title}</h3>
					{quest.created_by !== user._id ? (
						<Button
							color="warning"
							variant="ghost"
							startContent={<UserSvg />}
							onPress={() => {
								sessionStorage.setItem("otherUserId", quest.created_by);
								window.open(`/profile/${quest.created_by}`, "_blank");
							}}
						>
							Creator Profile
						</Button>
					) : null}
					<div className="flex flex-wrap gap-2">
						<Button
							isIconOnly
							aria-label="Applicants"
							color="secondary"
							onPress={() => handleShowApplicants(quest)}
						>
							<GroupSvg />
						</Button>
						{quest.created_by === user._id ? (
							<>
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
							</>
						) : isUserNotApplied ? (
							<Button
								isIconOnly
								aria-label="Apply"
								color="primary"
								onPress={() => handleApplyQuest(quest)}
							>
								<CreateQuestSvg />
							</Button>
						) : null}
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
}

export default QuestCard;
