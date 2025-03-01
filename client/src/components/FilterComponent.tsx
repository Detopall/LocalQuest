import { useState } from "react";
import {
	Card,
	Button,
	Slider,
	Listbox,
	ListboxItem,
	CardHeader,
	CardBody,
} from "@heroui/react";

const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Miami"];
const topics = ["Technology", "Health", "Finance", "Education", "Sports"];

interface ListboxWrapperProps {
	children: React.ReactNode;
}

interface ListboxItemProps {
	childName: string;
	children: string[];
	selectedChildren: Set<string>;
	setChildren: (newChildren: Set<string>) => void;
}

export const ListboxWrapper = ({ children }: ListboxWrapperProps) => (
	<div className="w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
		{children}
	</div>
);

export const ListboxItemWrapper = ({
	children,
	childName,
	selectedChildren,
	setChildren,
}: ListboxItemProps) => (
	<Card className="p-4">
		<CardHeader className="text-lg font-semibold mb-2">{childName}</CardHeader>
		<CardBody>
			<Listbox
				selectionMode="multiple"
				selectedKeys={selectedChildren}
				onSelectionChange={(keys) => setChildren(keys as Set<string>)}
			>
				{children.map((child) => (
					<ListboxItem key={child}>{child}</ListboxItem>
				))}
			</Listbox>
		</CardBody>
	</Card>
);

const FilterComponent = () => {
	const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
	const [price, setPrice] = useState<[number, number]>([0, 100]);
	const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

	const applyFilters = () => {
		const params = new URLSearchParams();
		if (selectedCities.size) {
			selectedCities.forEach((city) => {
				params.append("city", city);
			});
		}
		if (price) params.append("price", price.toString());
		if (selectedTopics.size) {
			selectedTopics.forEach((topic) => {
				params.append("topic", topic);
			});
		}

		console.log(params.toString());

		fetch(`http://localhost:8000/api/filter?${params.toString()}`)
			.then((res) => res.json())
			.then((data) => console.log("Filtered data:", data))
			.catch((err) => console.error("Error fetching data:", err));
	};

	return (
		<div className="max-w-[300px] w-full max-h-[90vh] overflow-y-auto p-6 border-r space-y-6 flex-shrink-0">
			<ListboxItemWrapper
				childName="Cities"
				children={cities}
				selectedChildren={selectedCities}
				setChildren={setSelectedCities}
			/>

			<ListboxItemWrapper
				childName="Topics"
				children={topics}
				selectedChildren={selectedTopics}
				setChildren={setSelectedTopics}
			/>

			<Card className="p-4 mb-5">
				<CardHeader className="text-lg font-semibold mb-2">Price</CardHeader>
				<CardBody>
					<Slider
						classNames={{
							base: "max-w-md",
							filler: "bg-gradient-to-r from-primary-500 to-secondary-400",
							labelWrapper: "mb-2",
							label: "font-medium text-default-700 text-medium",
							value: "font-medium text-default-500 text-small",
							thumb: [
								"transition-size",
								"bg-gradient-to-r from-secondary-400 to-primary-500",
								"data-[dragging=true]:shadow-lg data-[dragging=true]:shadow-black/20",
								"data-[dragging=true]:w-7 data-[dragging=true]:h-7 data-[dragging=true]:after:h-6 data-[dragging=true]:after:w-6",
							],
							step: "data-[in-range=true]:bg-black/30 dark:data-[in-range=true]:bg-white/50",
						}}
						defaultValue={[0, 800]}
						disableThumbScale={true}
						formatOptions={{ style: "currency", currency: "EUR" }}
						label="Price Range"
						maxValue={100}
						minValue={0}
						showOutline={true}
						showSteps={true}
						showTooltip={true}
						step={1}
						tooltipProps={{
							offset: 10,
							placement: "bottom",
							classNames: {
								base: [
									"before:bg-gradient-to-r before:from-secondary-400 before:to-primary-500",
								],
								content: [
									"py-2 shadow-xl",
									"text-white bg-gradient-to-r from-secondary-400 to-primary-500",
								],
							},
						}}
						tooltipValueFormatOptions={{
							style: "currency",
							currency: "EUR",
							maximumFractionDigits: 0,
						}}
						value={price}
						onChange={(value) => {
							if (Array.isArray(value) && value.length === 2) {
								setPrice([value[0], value[1]]);
							}
						}}
					/>
				</CardBody>
			</Card>

			<Button
				onPress={applyFilters}
				className="w-full mt-4"
				color="primary"
				variant="shadow"
			>
				Apply Filters
			</Button>

			<Button
				onPress={() => {
					setSelectedCities(new Set());
					setPrice([0, 100]);
					setSelectedTopics(new Set());
				}}
				className="w-full mt-4"
				color="danger"
				variant="shadow"
			>
				Reset Filters
			</Button>
		</div>
	);
};

export default FilterComponent;
