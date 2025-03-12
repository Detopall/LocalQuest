import { Avatar, Button, addToast } from "@heroui/react";
import { useState } from "react";
import CreateQuestModal from "@/components/CreateQuestModal";
import { CreateQuestSvg, LogoutSvg } from "@/components/svgs";

interface HeaderProps {
	user: any;
	profilePage?: boolean;
}

function Header({ user, profilePage }: HeaderProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => setIsOpen(false);

	async function handleLogout() {
		await fetch("http://localhost:8000/auth/logout", {
			method: "POST",
			credentials: "include",
		});
		addToast({
			title: "Logged Out",
			description: "You have successfully logged out.",
			timeout: 1000,
			shouldShowTimeoutProgress: true,
			variant: "bordered",
			radius: "md",
			color: "success",
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
					<Button
						isIconOnly
						aria-label="Quest"
						color="primary"
						variant="ghost"
						onPress={handleOpen}
					>
						<CreateQuestSvg />
					</Button>
					<Button
						isIconOnly
						aria-label="Logout"
						color="danger"
						variant="ghost"
						onPress={handleLogout}
					>
						<LogoutSvg />
					</Button>
				</div>

				<CreateQuestModal isOpen={isOpen} onClose={handleClose} />
			</div>
		)
	);
}

export default Header;
