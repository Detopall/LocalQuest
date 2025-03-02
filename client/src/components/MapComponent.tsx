import { useState } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Polyline,
} from "react-leaflet";
import { LatLngTuple } from "leaflet";
import { Button, Select, SelectItem } from "@heroui/react";
import CustomPopup from "@/components/MapPopupComponent";
import "leaflet/dist/leaflet.css";
import MapOptionsModal from "./MapOptionsModal";

const MapComponent = () => {
	const [route, setRoute] = useState<LatLngTuple[]>([]);
	const [distance, setDistance] = useState<number | null>(null);
	const [duration, setDuration] = useState<number | null>(null);
	const [routeInstructions, setRouteInstructions] = useState<string[]>([]);
	const [selectedTransport, setSelectedTransport] = useState("driving");
	const [showDetails, setShowDetails] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const handleOpen = () => setIsOpen(true);
	const onClose = () => setIsOpen(false);

	const userLocation: LatLngTuple = [51.505, -0.09];

	const destinations = [
		{ id: 1, position: [51.515, -0.1] as LatLngTuple, name: "Destination A" },
		{ id: 2, position: [51.525, -0.08] as LatLngTuple, name: "Destination B" },
	];

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
		}
	};

	return (
		<div className="flex">
			<div className="relative flex-1 pl-4 w-[80vw] h-[80vh] overflow-hidden rounded-2xl shadow-lg gap-2">
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
					center={userLocation}
					zoom={13}
					className="h-[80vh] w-[80vw] z-[1]"
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>

					<Marker position={userLocation}>
						<Popup>
							<p className="text-lg font-bold text-blue-600">You are here</p>
						</Popup>
					</Marker>

					{destinations.map((dest) => (
						<Marker key={dest.id} position={dest.position}>
							<Popup>
								<CustomPopup
									name={dest.name}
									distance={distance}
									duration={duration}
									onRouteClick={() => getRoute(dest.position)}
								/>
							</Popup>
						</Marker>
					))}

					{route.length > 0 && <Polyline positions={route} color="blue" />}
				</MapContainer>
				<MapOptionsModal
					isOpen={isOpen}
					onClose={onClose}
					showDetails={showDetails}
					routeInstructions={routeInstructions}
				/>
			</div>
		</div>
	);
};

export default MapComponent;
