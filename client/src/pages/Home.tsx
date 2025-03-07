import FilterComponent from "@/components/FilterComponent";
import MapComponent from "@/components/MapComponent";
import { Avatar, Button } from "@heroui/react";

interface User {
	username: string;
	email: string;
}

function Home({ user }: { user: User }) {
	return (
		<>
			<div className="flex flex-col">
				<div className="flex items-center justify-between px-4 py-2">
					<div className="flex items-center gap-5">
						<Button
							color="primary"
							className="p-5"
							variant="ghost"
							onPress={() => (window.location.href = "/profile")}
						>
							<Avatar
								className="h-7 w-7"
								src="https://i.pravatar.cc/150?u=a04258114e29026708c"
							/>
							<p className="text-lg font-semibold">{user.username}</p>
						</Button>
					</div>
					<h1 className="text-3xl font-bold">LocalQuest</h1>
					<div className="flex items-center gap-3">
						<Button
							isIconOnly
							aria-label="Quest"
							color="primary"
							variant="ghost"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="8" x2="12" y2="16" />
								<line x1="8" y1="12" x2="16" y2="12" />
							</svg>
						</Button>
						<Button
							isIconOnly
							aria-label="Notification"
							color="secondary"
							variant="ghost"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
								<path d="M13.73 21a2 2 0 0 1-3.46 0" />
							</svg>
						</Button>
						<Button
							isIconOnly
							aria-label="Logout"
							color="danger"
							variant="ghost"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
								<path d="M9 12h12l-3 -3" />
								<path d="M18 15l3 -3" />
							</svg>
						</Button>
					</div>
				</div>

				<div className="flex min-h-screen pt-16 px-4 gap-4 items-center">
					<FilterComponent />
					<MapComponent />
				</div>
			</div>
		</>
	);
}

export default Home;
