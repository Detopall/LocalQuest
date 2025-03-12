import { addToast } from "@heroui/react";
import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface AuthContextType {
	user: any;
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
			addToast({
				title: "Error",
				description: "An error occurred while checking your authentication.",
				timeout: 3000,
				shouldShowTimeoutProgress: true,
				variant: "bordered",
				radius: "md",
				color: "danger",
			});
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
