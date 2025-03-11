import { Button, Card, CardBody } from "@heroui/react";
import { MapPin, DollarSign, Calendar } from "lucide-react";

interface CustomPopupProps {
	quest: any;
	distance: number | null;
	duration: number | null;
}

const CustomPopup: React.FC<CustomPopupProps> = ({
	quest,
	distance,
	duration,
}) => {
	const formatDuration = (duration: number) => {
		if (duration >= 60) {
			const hours = Math.floor(duration / 60);
			const minutes = Math.floor(duration % 60);
			return `${hours} hr ${minutes} min`;
		}
		return `${duration.toFixed(0)} min`;
	};

	return (
		<Card className="max-w-sm mx-auto p-3 shadow-md rounded-xl border">
			<CardBody className="flex flex-col gap-2">
				<h3 className="text-lg font-semibold text-gray-800">{quest.title}</h3>
				<p className="text-sm text-gray-600">{quest.description}</p>
				<div className="flex items-center gap-2 text-gray-700">
					<DollarSign size={14} />
					<span>bux {quest.price.toFixed(2)}</span>
				</div>
				{quest.tags && (
					<div className="flex items-center gap-2 text-gray-700">
						<span>Tags: {quest.tags.join(", ")}</span>
					</div>
				)}
				{distance !== null && duration !== null && (
					<>
						<div className="flex items-center gap-2 text-gray-700">
							<MapPin size={14} />
							<span>Distance: {distance.toFixed(2)} km</span>
						</div>
						<div className="flex items-center gap-2 text-gray-700">
							<Calendar size={14} />
							<span>ETA: {formatDuration(duration)}</span>
						</div>
					</>
				)}
				<Button
					className="mt-3 w-full"
					color="primary"
					variant="ghost"
					onPress={() => {
						sessionStorage.setItem("otherUserId", quest.created_by);
						window.open(`/profile/${quest.created_by}`, "_blank");
					}}
				>
					Visit Creator Page
				</Button>
			</CardBody>
		</Card>
	);
};

export default CustomPopup;
