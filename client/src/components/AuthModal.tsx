import { useState, forwardRef, useImperativeHandle } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	addToast
} from "@heroui/react";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

export interface AuthModalRef {
	openModal: () => void;
}

const AuthModal = forwardRef<AuthModalRef>((_, ref) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLogin, setIsLogin] = useState(true);

	useImperativeHandle(ref, () => ({
		openModal: () => setIsOpen(true),
	}));

	const handleAuth = async (formData: {
		username: string;
		email?: string;
		password: string;
	}) => {
		try {
			await fetch("http://localhost:8000/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
				credentials: "include",
			});
			setIsOpen(false);
			window.location.href = "/home";
		} catch (error) {
			console.error("Auth Error:", error);
			addToast({
				title: "Error",
				description: "An error occurred while authenticating.",
				timeout: 3000,
				shouldShowTimeoutProgress: true,
				variant: "bordered",
				radius: "md",
				color: "danger",
			});
		}
	};

	const authTitleText = isLogin ? "Login" : "Register";

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			backdrop="blur"
			className="flex items-center justify-center bg-background/80 backdrop-blur-md border border-primary-500"
			size="lg"
		>
			<ModalContent className="max-h-[90vh] overflow-hidden">
				<ModalHeader className="flex flex-col items-center gap-5">
					<h3 className="text-3xl font-extrabold text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
						{authTitleText}
					</h3>
				</ModalHeader>
				<ModalBody className="overflow-y-auto">
					{isLogin ? (
						<Login onSubmit={handleAuth} />
					) : (
						<Register onSubmit={handleAuth} />
					)}
				</ModalBody>
				<ModalFooter className="flex justify-center gap-4 border-t border-primary-200">
					<Button
						color="secondary"
						variant="ghost"
						onPress={() => setIsLogin(!isLogin)}
					>
						{isLogin ? "Switch to Register" : "Switch to Login"}
					</Button>
					<Button
						color="danger"
						variant="shadow"
						onPress={() => setIsOpen(false)}
					>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
});

export default AuthModal;
