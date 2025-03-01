
import Hero from "@/components/Hero";
//import Nav from "@/components/Nav";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";

function App() {


	return (
		<div>
			<Routes>
				<Route element={<Hero />} path="/" />
				<Route element={<Home />} path="/home" />
			</Routes>
		</div>
	);
}

export default App;
