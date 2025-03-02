import { Button, Card, CardBody } from "@heroui/react";

interface CustomPopupProps {
	name: string;
	distance: number | null;
	duration: number | null;
	onRouteClick: () => void;
}

const CustomPopup: React.FC<CustomPopupProps> = ({
	name,
	distance,
	duration,
	onRouteClick,
}) => {
	return (
		<Card className="p-3 w-56">
			<CardBody>
				<h3 className="text-lg font-bold">{name}</h3>
				{distance !== null && duration !== null ? (
					<p className="text-sm text-gray-600">
						Distance: {distance.toFixed(2)} km <br />
						ETA: {duration.toFixed(0)} min
					</p>
				) : (
					<p className="text-sm text-gray-600">Click below to get the route</p>
				)}
				<Button className="mt-3 w-full" color="primary" onPress={onRouteClick}>
					Calculate Route
				</Button>
			</CardBody>
		</Card>
	);
};

export default CustomPopup;
