import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Form,
	Input,
	Checkbox,
	DatePicker,
} from "@heroui/react";
import { now, getLocalTimeZone } from "@internationalized/date";
import { useEffect, useState, useRef } from "react";

interface CreateQuestModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface CacheType {
	[key: string]: any;
}

interface CreateQuestModalProps {
	isOpen: boolean;
	onClose: () => void;
	quest?: {
		_id: string;
		title: string;
		description: string;
		longitude: string;
		latitude: string;
		price: string;
		deadline: string;
		topics: string[];
	};
}

function CreateQuestModal({ isOpen, onClose, quest }: CreateQuestModalProps) {
	const [topics, setTopics] = useState<string[]>([]);
	const [formData, setFormData] = useState({
		title: quest?.title || "",
		description: quest?.description || "",
		longitude: quest?.longitude || "",
		latitude: quest?.latitude || "",
		price: quest?.price || "",
		deadline: quest?.deadline || "",
		topics: quest?.topics || [],
	});
	const cache = useRef<CacheType>({});

	useEffect(() => {
		async function getTopics() {
			const cacheKey = "http://localhost:8000/api/topics";
			if (cache.current[cacheKey]) {
				setTopics(
					Array.isArray(cache.current[cacheKey]) ? cache.current[cacheKey] : []
				);
				return;
			}
			try {
				const response = await fetch(cacheKey, { credentials: "include" });
				if (response.ok) {
					const fetchedTopics = await response.json();
					const topicsArray = Array.isArray(fetchedTopics["topics"])
						? fetchedTopics["topics"]
						: [];
					cache.current[cacheKey] = topicsArray;
					setTopics(topicsArray);
				} else {
					setTopics([]);
				}
			} catch (error) {
				console.error("Error fetching topics:", error);
				setTopics([]);
			}
		}
		getTopics();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCheckboxChange = (topic: string) => {
		setFormData((prev) => ({
			...prev,
			topics: prev.topics.includes(topic)
				? prev.topics.filter((t) => t !== topic)
				: [...prev.topics, topic],
		}));
	};

	async function handleSubmit() {
		const questData = {
			...formData,
			longitude: parseFloat(formData.longitude),
			latitude: parseFloat(formData.latitude),
			price: parseFloat(formData.price),
		};

		try {
			const url = quest
				? `http://localhost:8000/api/quests/${quest._id}`
				: "http://localhost:8000/api/quests";
			const method = quest ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(questData),
			});

			if (response.ok) {
				console.log(`Quest ${quest ? "updated" : "created"} successfully!`);
				onClose();
				window.location.reload();
			} else {
				console.error(`Failed to ${quest ? "update" : "create"} quest`);
			}
		} catch (error) {
			console.error(`Error ${quest ? "updating" : "creating"} quest:`, error);
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			backdrop="blur"
			size="lg"
			className="p-4"
		>
			<ModalContent className="max-h-[90vh] w-full max-w-lg mx-auto overflow-hidden">
				{(onClose) => (
					<>
						<ModalHeader className="text-center">
							<h3 className="text-xl font-bold text-primary-600">
								{quest ? "Edit Quest" : "Create a Quest"}
							</h3>
						</ModalHeader>
						<ModalBody className="overflow-y-auto px-4">
							<Form className="space-y-4">
								<Input
									isRequired
									name="title"
									label="Title"
									placeholder="Enter quest title"
									value={formData.title}
									onChange={handleChange}
								/>
								<Input
									isRequired
									name="description"
									label="Description"
									placeholder="Enter quest description"
									value={formData.description}
									onChange={handleChange}
								/>
								<div className="flex flex-wrap gap-2">
									{topics.map((topic) => (
										<Checkbox
											key={topic}
											isSelected={formData.topics.includes(topic)}
											onChange={() => handleCheckboxChange(topic)}
										>
											{topic}
										</Checkbox>
									))}
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<Input
										isRequired
										name="longitude"
										label="Longitude"
										placeholder="e.g., 12.34567"
										value={formData.longitude}
										onChange={handleChange}
									/>
									<Input
										isRequired
										name="latitude"
										label="Latitude"
										placeholder="e.g., 12.34567"
										value={formData.latitude}
										onChange={handleChange}
									/>
								</div>
								<Input
									isRequired
									name="price"
									label="Price (bux)"
									placeholder="Enter quest price"
									value={formData.price}
									onChange={handleChange}
								/>
								<DatePicker
									hideTimeZone
									isRequired
									showMonthAndYearPickers
									defaultValue={now(getLocalTimeZone())}
									label="Deadline"
									variant="bordered"
									firstDayOfWeek="mon"
									onChange={(date) => {
										if (date) {
											const formattedDate = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")} ${String(date.hour || 0).padStart(2, "0")}:${String(date.minute || 0).padStart(2, "0")}:${String(date.second || 0).padStart(2, "0")}`;
											setFormData((prev) => ({
												...prev,
												deadline: formattedDate,
											}));
										}
									}}
								/>
							</Form>
						</ModalBody>
						<ModalFooter className="flex flex-col sm:flex-row justify-center gap-2 border-t border-gray-200 p-4">
							<Button
								color="primary"
								variant="solid"
								className="w-full sm:w-auto"
								onPress={handleSubmit}
							>
								{quest ? "Update Quest" : "Create Quest"}
							</Button>
							<Button
								color="danger"
								variant="ghost"
								className="w-full sm:w-auto"
								onPress={onClose}
							>
								Close
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}

export default CreateQuestModal;
