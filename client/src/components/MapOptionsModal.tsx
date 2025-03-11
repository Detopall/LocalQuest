import {
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Button,
	Card,
	CardBody,
} from "@heroui/react";
import {
	FaArrowRight,
	FaArrowLeft,
	FaArrowUp,
	FaArrowDown,
} from "react-icons/fa";

interface MapOptionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	showDetails: boolean;
	routeInstructions: any;
}

const getDirectionIcon = (maneuver: string) => {
	const icons = {
		"turn-right": <FaArrowRight className="text-primary-600" />,
		"turn-left": <FaArrowLeft className="text-primary-600" />,
		straight: <FaArrowUp className="text-primary-600" />,
		uturn: <FaArrowDown className="text-primary-600" />,
	};

	const right = ["right", "sharp right", "slight right"];
	const left = ["left", "sharp left", "slight left"];

	if (right.includes(maneuver)) {
		return icons["turn-right"];
	} else if (left.includes(maneuver)) {
		return icons["turn-left"];
	} else {
		return icons["straight"];
	}
};

const formatDuration = (duration: number) => {
	if (duration >= 60) {
		const minutes = Math.floor(duration / 60);
		const seconds = Math.floor(duration % 60);
		return `${minutes} min ${seconds} s`;
	}
	return `${duration.toFixed(0)} s`;
};

const formatDistance = (distance: number) => {
	if (distance >= 500) {
		return `${(distance / 1000).toFixed(2)} km`;
	}
	return `${distance.toFixed(0)} m`;
};

const MapOptionsModal = ({
	isOpen,
	onClose,
	showDetails,
	routeInstructions,
}: MapOptionsModalProps) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			backdrop="blur"
			className="flex items-center justify-center bg-background/80 backdrop-blur-md border border-primary-500 z-[1050]"
			size="5xl"
		>
			<ModalContent className="overflow-hidden">
				<ModalHeader className="flex flex-col gap-1 text-2xl font-bold text-primary-600">
					Map Options
				</ModalHeader>
				<ModalBody className="flex flex-col items-center justify-center w-[600px] h-[600px] mb-5">
					{showDetails && (
						<Card className="mt-4 w-full max-h-80 overflow-y-auto shadow-lg">
							<CardBody>
								<h3 className="text-xl font-semibold mb-4 text-primary-600">
									Destination: {routeInstructions.routes[0].legs[0].summary}
								</h3>
								<p className="font-semibold mb-4 text-primary-600">
									Distance:{" "}
									{formatDistance(routeInstructions.routes[0].legs[0].distance)}{" "}
									- Duration:{" "}
									{formatDuration(routeInstructions.routes[0].legs[0].duration)}
								</p>

								<ul className="space-y-4">
									{routeInstructions.routes[0].legs[0].steps.map(
										(step: any, index: number) => (
											<li
												key={index}
												className="flex items-center justify-between text-sm text-gray-700 hover:bg-primary-50 rounded-lg p-3 transition duration-200 ease-in-out"
											>
												<div className="flex items-center space-x-2 font-semibold text-primary-600">
													{getDirectionIcon(step.maneuver.modifier)}
													<span>
														{step.maneuver.modifier} on{" "}
														{step.name ? (
															step.name
														) : (
															<span className="text-gray-400 italic">
																street
															</span>
														)}
													</span>
												</div>

												<div className="flex space-x-4">
													<span className="text-sm text-gray-500">
														{formatDistance(step.distance)}
													</span>
													<span className="text-sm text-gray-500">
														{formatDuration(step.duration)}
													</span>
												</div>
											</li>
										)
									)}
								</ul>
							</CardBody>
						</Card>
					)}

					<Button
						className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
						onPress={onClose}
					>
						Close
					</Button>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default MapOptionsModal;
