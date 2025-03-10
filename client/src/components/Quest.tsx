import { Card, CardBody, Chip, CardHeader } from "@heroui/react";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface QuestProps {
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

const formatLocation = (location: QuestProps["location"]) => {
	if (!location) return "Unknown location";

	const parts = [location.town, location.province, location.country].filter(
		Boolean
	);

	return parts.length > 0 ? parts.join(", ") : "?";
};

const QuestCard = ({ quest }: { quest: QuestProps }) => {
	return (
		<Card className="max-w-md mx-auto p-4 shadow-lg rounded-2xl border">
			<CardHeader>
				<h2 className="text-xl font-bold">Title: {quest.title}</h2>
			</CardHeader>
			<CardBody>
				<p className="mb-4">Description: {quest.description}</p>
				<div className="flex flex-wrap gap-2 mb-4">
					{quest.topics.map((topic, index) => (
						<Chip key={index} color="primary" variant="shadow">
							{topic}
						</Chip>
					))}
				</div>
				<div className="flex items-center gap-2  flex-col mb-4">
					<h3 className="text-lg font-bold"> Applicants </h3>
					<div className="flex items-center flex-col gap-2 mb-4">
						{quest.applicants.map((applicant, index) => (
							<Link key={index} to={`/profile/${applicant.username}`}>
								<Chip key={index} color="primary" variant="shadow">
									{applicant.username}
								</Chip>
							</Link>
						))}
					</div>
				</div>
				<div className="flex justify-between items-center text-sm text-gray-600">
					<div className="flex items-center gap-1">
						<MapPin size={14} />
						<span>
							{location ? formatLocation(quest.location) : "Unknown"}
						</span>
					</div>
					<div className="font-medium text-primary">
						bux: {quest.price.toFixed(2)}
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

export default QuestCard;

const SmallQuestCard = ({ quest }: { quest: QuestProps }) => {
	return (
		<Card className="max-w-sm mx-auto p-3 shadow-md rounded-xl border">
			<CardBody className="flex flex-col gap-2">
				<h3 className="text-lg font-semibold">{quest.title}</h3>
				<div className="flex items-center gap-2 text-gray-700">
					<MapPin size={14} />
					<span>{formatLocation(quest.location)}</span>
				</div>
				<div className="flex items-center gap-2 text-gray-700">
					<DollarSign size={14} />
					<span>{quest.price.toFixed(2)}</span>
				</div>
				<div className="flex items-center gap-2 text-gray-700">
					<Calendar size={14} />
					<span>{new Date(quest.deadline).toLocaleDateString()}</span>
				</div>
			</CardBody>
		</Card>
	);
};

export { QuestCard, SmallQuestCard };
