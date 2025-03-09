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
		selectedTopics: [] as string[],
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
				const response = await fetch(cacheKey, {
					credentials: "include",
				});

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
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCheckboxChange = (topic: string) => {
		setFormData((prev) => ({
			...prev,
			selectedTopics: prev.selectedTopics.includes(topic)
				? prev.selectedTopics.filter((t) => t !== topic)
				: [...prev.selectedTopics, topic],
		}));
	};

	async function handleCreateQuest() {
		const questData = {
			title: formData.title,
			description: formData.description,
			longitude: parseFloat(formData.longitude),
			latitude: parseFloat(formData.latitude),
			price: parseFloat(formData.price),
			deadline: formData.deadline,
			topics: formData.selectedTopics,
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
			className="flex items-center justify-center bg-background/80 backdrop-blur-md border border-primary-500"
			size="5xl"
		>
			<ModalContent className="max-h-[90vh] overflow-hidden">
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col items-center gap-5">
							<h3 className="text-3xl font-extrabold text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
								Create a Quest
							</h3>
						</ModalHeader>
						<ModalBody className="overflow-y-auto">
							<div className="flex flex-col items-center">
								<Form>
									<Input
										isRequired
										name="title"
										label="Title"
										labelPlacement="outside"
										placeholder="Enter the title of your quest"
										value={formData.title}
										onChange={handleChange}
										validate={(val) => {
											if (val.length < 3) {
												return "Title must be at least 3 characters long";
											}
										}}
									/>
									<Input
										isRequired
										name="description"
										label="Description"
										labelPlacement="outside"
										placeholder="Enter the description of your quest"
										value={formData.description}
										onChange={handleChange}
										validate={(val) => {
											if (val.length < 5) {
												return "Description must be at least 5 characters long";
											}
										}}
									/>
									<div className="flex items-center gap-2">
										{topics.map((topic) => (
											<Checkbox
												key={topic}
												isSelected={formData.selectedTopics.includes(topic)}
												onChange={() => handleCheckboxChange(topic)}
											>
												{topic}
											</Checkbox>
										))}
									</div>
									<Input
										isRequired
										name="longitude"
										label="Longitude"
										labelPlacement="outside"
										placeholder="Enter the longitude of the location of your quest (ex.: 12.34567)"
										value={formData.longitude}
										onChange={handleChange}
									/>
									<Input
										isRequired
										name="latitude"
										label="Latitude"
										labelPlacement="outside"
										placeholder="Enter the latitude of the location of your quest (ex.: 12.34567)"
										value={formData.latitude}
										onChange={handleChange}
									/>
									<Input
										isRequired
										name="price"
										label="Price"
										labelPlacement="outside"
										placeholder="Enter the price you want to get paid for your quest"
										value={formData.price}
										onChange={handleChange}
									/>
									<DatePicker
										hideTimeZone
										isRequired
										showMonthAndYearPickers
										defaultValue={now(getLocalTimeZone())}
										label="Event Date"
										variant="bordered"
										firstDayOfWeek="mon"
										onChange={(date) => {
											if (date) {
												// Format the date to "YYYY-MM-DD HH:mm:ss" (Python-compatible datetime format)
												const formattedDate = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")} ${String(date.hour || 0).padStart(2, "0")}:${String(date.minute || 0).padStart(2, "0")}:${String(date.second || 0).padStart(2, "0")}`;
												setFormData((prev) => ({
													...prev,
													deadline: formattedDate,
												}));
											}
										}}
									/>
								</Form>
							</div>
						</ModalBody>
						<ModalFooter className="flex justify-center gap-4 border-t border-primary-200">
							<Button
								color="primary"
								variant="ghost"
								onPress={handleCreateQuest}
							>
								Create Quest
							</Button>
							<Button color="danger" variant="ghost" onPress={onClose}>
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
