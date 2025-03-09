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

function CreateQuestModal({ isOpen, onClose }: CreateQuestModalProps) {
	const [topics, setTopics] = useState<string[]>([]);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		longitude: "",
		latitude: "",
		price: "",
		deadline: now(getLocalTimeZone()).toString(),
		topics: [] as string[],
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

	async function handleCreateQuest() {
		const questData = {
			...formData,
			longitude: parseFloat(formData.longitude),
			latitude: parseFloat(formData.latitude),
			price: parseFloat(formData.price),
		};

		console.log(questData);

		try {
			const response = await fetch("http://localhost:8000/api/quests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(questData),
			});

			if (response.ok) {
				console.log("Quest created successfully!");
				onClose();
				window.location.reload();
			} else {
				console.error("Failed to create quest");
			}
		} catch (error) {
			console.error("Error creating quest:", error);
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
								Create a Quest
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
									className="w-full"
								/>
								<Input
									isRequired
									name="description"
									label="Description"
									placeholder="Enter quest description"
									value={formData.description}
									onChange={handleChange}
									className="w-full"
								/>
								<div className="flex flex-wrap gap-2">
									{topics.map((topic) => (
										<Checkbox
											key={topic}
											isSelected={formData.topics.includes(topic)}
											onChange={() => handleCheckboxChange(topic)}
											className="text-sm"
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
										className="w-full"
									/>
									<Input
										isRequired
										name="latitude"
										label="Latitude"
										placeholder="e.g., 12.34567"
										value={formData.latitude}
										onChange={handleChange}
										className="w-full"
									/>
								</div>
								<Input
									isRequired
									name="price"
									label="Price (bux)"
									placeholder="Enter quest price"
									value={formData.price}
									onChange={handleChange}
									className="w-full"
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
								onPress={handleCreateQuest}
							>
								Create Quest
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
