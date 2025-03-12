import { useState, useEffect } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Polyline,
	useMap,
} from "react-leaflet";
import { LatLngTuple } from "leaflet";
import { Button, Select, SelectItem, addToast } from "@heroui/react";
import CustomPopup from "@/components/MapPopupComponent";
import "leaflet/dist/leaflet.css";
import MapOptionsModal from "@/components/MapOptionsModal";
import { userIconLeaflet } from "@/components/svgs";

interface MapComponentProps {
	user: any;
}

const MapComponent = ({ user }: MapComponentProps) => {
	const [route, setRoute] = useState<LatLngTuple[]>([]);
	const [distance, setDistance] = useState<number | null>(null);
	const [duration, setDuration] = useState<number | null>(null);
	const [locationEnabled, setLocationEnabled] = useState(false);
	const [userLocation, setUserLocation] = useState<LatLngTuple>([0, 0]);
	const [routeInstructions, setRouteInstructions] = useState<string[]>([]);
	const [selectedTransport, setSelectedTransport] = useState("driving");
	const [showDetails, setShowDetails] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [quests, setQuests] = useState<
		{
			id: number;
			latitude: number;
			longitude: number;
			title: string;
			description: string;
			created_by: string;
		}[]
	>([]);

	const handleOpen = () => setIsOpen(true);
	const onClose = () => setIsOpen(false);

	const handleLocationRequest = () => {
		if (navigator.geolocation) {
			console.log("Requesting location...");
			navigator.geolocation.getCurrentPosition(
				(position) => {
					console.log("Location obtained:", position.coords);
					setUserLocation([
						position.coords.latitude,
						position.coords.longitude,
					]);
					setLocationEnabled(true);
				},
				(error) => {
					console.error("Error getting location:", error);
					setLocationEnabled(false);
					addToast({
						title: "Error",
						description: "An error occurred while getting your location.",
						timeout: 3000,
						shouldShowTimeoutProgress: true,
						variant: "bordered",
						radius: "md",
						color: "danger",
					});
				}
			);
		}
	};

	const getRoute = async (destination: LatLngTuple) => {
		const url = `https://router.project-osrm.org/route/v1/${selectedTransport}/${userLocation[1]},${userLocation[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=true`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data.routes && data.routes.length > 0) {
				const coords: LatLngTuple[] = data.routes[0].geometry.coordinates.map(
					([lng, lat]: [number, number]) => [lat, lng] as LatLngTuple
				);
				setRoute(coords);
				setDistance(data.routes[0].distance / 1000);
				setDuration(data.routes[0].duration / 60);
				setRouteInstructions(data);
				setShowDetails(true);
			}
		} catch (error) {
			console.error("Error fetching route:", error);
			addToast({
				title: "Error",
				description: "An error occurred while fetching your route.",
				timeout: 3000,
				shouldShowTimeoutProgress: true,
				variant: "bordered",
				radius: "md",
				color: "danger",
			});
		}
	};

	useEffect(() => {
		const getLocation = () => {
			if (navigator.geolocation) {
				try {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							console.log("Location obtained:", position.coords);
							setUserLocation([
								position.coords.latitude,
								position.coords.longitude,
							]);
							setLocationEnabled(true);
						},
						(error) => {
							console.error("Error getting location:", error);
							setLocationEnabled(false);
						}
					);
				} catch (error) {
					console.error("Error getting location:", error);
					setLocationEnabled(false);
					addToast({
						title: "Error",
						description: "An error occurred while getting your location.",
						timeout: 3000,
						shouldShowTimeoutProgress: true,
						variant: "bordered",
						radius: "md",
						color: "danger",
					});
				}
			} else {
				console.error("Geolocation is not supported by this browser.");
				setLocationEnabled(false);
			}
		};

		getLocation();
	}, []);

	useEffect(() => {
		const fetchQuests = async () => {
			try {
				const response = await fetch("http://localhost:8000/api/quests", {
					credentials: "include",
				});
				const data = await response.json();
				setQuests(data.quests);
			} catch (error) {
				console.error("Error fetching quests:", error);
				addToast({
					title: "Error",
					description: "An error occurred while getting the quests.",
					timeout: 3000,
					shouldShowTimeoutProgress: true,
					variant: "bordered",
					radius: "md",
					color: "danger",
				});
			}
		};

		fetchQuests();
	}, []);

	const handleMarkerClick = (quest: any) => {
		getRoute([quest.latitude, quest.longitude]);
	};

	const MapUpdater = ({ center }: { center: LatLngTuple }) => {
		const map = useMap();
		useEffect(() => {
			map.setView(center);
		}, [center, map]);
		return null;
	};

	return (
		<div className="flex flex-col h-screen">
			<div className="flex-1 relative overflow-hidden rounded-2xl shadow-lg gap-2">
				<div className="absolute top-5 right-5 transform -translate-x-1/2 z-10 space-y-4">
					<Button
						color="primary"
						onPress={handleOpen}
						className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:bg-primary-700 transition duration-300"
					>
						Show Details
					</Button>

					<Select
						className="max-w-xs mb-4"
						defaultSelectedKeys={["driving"]}
						placeholder="Select a transport"
						value={selectedTransport}
						onChange={(e) => setSelectedTransport(e.target.value)}
					>
						<SelectItem key={"driving"}>🚗 Driving</SelectItem>
						<SelectItem key={"walking"}>🚶 Walking</SelectItem>
						<SelectItem key={"cycling"}>🚴 Cycling</SelectItem>
					</Select>
				</div>

				<MapContainer
					scrollWheelZoom={true}
					center={userLocation as LatLngTuple}
					zoom={13}
					className="h-full w-full z-[1]"
				>
					<MapUpdater center={userLocation} />
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>

					{route.length > 0 && <Polyline positions={route} color="blue" />}

					<Marker position={userLocation} icon={userIconLeaflet}>
						<Popup>You are here</Popup>
					</Marker>

					{quests
						.filter((quest) => quest.created_by !== user._id)
						.map((quest) => (
							<Marker
								key={quest.id}
								position={[quest.latitude, quest.longitude] as LatLngTuple}
								eventHandlers={{
									click: () => handleMarkerClick(quest),
								}}
							>
								<Popup>
									<CustomPopup
										quest={quest}
										distance={distance}
										duration={duration}
									/>
								</Popup>
							</Marker>
						))}
				</MapContainer>
				<MapOptionsModal
					isOpen={isOpen}
					onClose={onClose}
					showDetails={showDetails}
					routeInstructions={routeInstructions}
				/>
				{!locationEnabled && (
					<div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-10 space-y-4">
						<Button
							color="primary"
							onPress={handleLocationRequest}
							className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:bg-primary-700 transition duration-300"
						>
							Enable Location
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default MapComponent;
