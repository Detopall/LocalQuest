import { Avatar, Button } from "@heroui/react";

interface HeaderProps {
	user: any;
	profilePage?: boolean;
}

function Header({ user, profilePage }: HeaderProps) {
	async function handleLogout() {
		await fetch("http://localhost:8000/auth/logout", {
			method: "POST",
			credentials: "include",
		});
		window.location.href = "/";
	}

	return (
		user && (
			<div className="flex items-center justify-between px-4 py-2">
				<div className="flex items-center gap-5">
					{profilePage ? (
						<Button
							color="primary"
							className="p-5"
							variant="ghost"
							onPress={() => (window.location.href = "/home")}
						>
							<svg
								fill="#000000"
								xmlns="http://www.w3.org/2000/svg"
								width="800px"
								height="800px"
								viewBox="0 0 52 52"
								enable-background="new 0 0 52 52"
							>
								<path
									d="M48.6,23H15.4c-0.9,0-1.3-1.1-0.7-1.7l9.6-9.6c0.6-0.6,0.6-1.5,0-2.1l-2.2-2.2c-0.6-0.6-1.5-0.6-2.1,0
	L2.5,25c-0.6,0.6-0.6,1.5,0,2.1L20,44.6c0.6,0.6,1.5,0.6,2.1,0l2.1-2.1c0.6-0.6,0.6-1.5,0-2.1l-9.6-9.6C14,30.1,14.4,29,15.3,29
	h33.2c0.8,0,1.5-0.6,1.5-1.4v-3C50,23.8,49.4,23,48.6,23z"
								/>
							</svg>
							<p className="text-lg font-semibold">Go Back</p>
						</Button>
					) : (
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
					)}
				</div>
				<a href="/home">
					<h1 className="text-3xl font-bold">LocalQuest</h1>
				</a>
				<div className="flex items-center gap-3">
					<Button isIconOnly aria-label="Quest" color="primary" variant="ghost">
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
					<Button isIconOnly aria-label="Logout" color="danger" variant="ghost" onPress={handleLogout}>
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
		)
	);
}

export default Header;
