
import Hero, { AuthProvider } from "@/components/Hero";

function App() {


	return (
		<>
			<AuthProvider>
				<Hero />
			</AuthProvider>
		</>
	);
}

export default App;
