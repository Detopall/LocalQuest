import {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	ReactNode,
} from "react";
import { Button } from "@heroui/react";
import LogoSvg from "@/components/LogoSvg";
import AuthModal, { AuthModalRef } from "@/components/AuthModal";
import Home from "@/pages/Home";

// Define AuthContext types
interface AuthContextType {
	user: any; //user object
	loading: boolean;
	checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const checkAuth = async () => {
		try {
			const response = await fetch("http://localhost:8000/auth/me", {
				credentials: "include",
			});
			if (response.ok) {
				const data = await response.json();
				setUser(data);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error("Auth Check Error:", error);
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, checkAuth }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

function Hero() {
	const modalRef = useRef<AuthModalRef>(null);
	const auth = useAuth();

	if (auth.loading) return <p>Loading...</p>;

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-center p-4">
			{auth.user ? (
				<Home user={auth.user} />
			) : (
				<>
					<div className="flex flex-col items-center gap-5 justify-center">
						<LogoSvg />
						<h1 className="text-3xl font-bold">LocalQuest</h1>
						<p className="text-xl font-bold">
							Help out your local community for a quick buck.
						</p>
					</div>
					<Button
						className="mt-5 px-6"
						color="primary"
						size="lg"
						variant="shadow"
						onPress={() => modalRef.current?.openModal()}
					>
						Get Started
					</Button>
				</>
			)}

			<AuthModal ref={modalRef} />
		</div>
	);
}

export default Hero;
