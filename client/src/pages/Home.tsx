import FilterComponent from "@/components/FilterComponent";

interface User {
	username: string;
	email: string;
}

function Home({ user }: { user: User }) {
	return (
		<>
			<div className="flex min-h-screen pt-16 px-4">
				<div className="w-1/4 min-w-[250px]">
					<FilterComponent />
				</div>
				<div className="flex-1">
					<h1 className="text-3xl font-bold">Welcome, {user.username}</h1>
					<p className="text-xl font-semibold">Your email: {user.email}</p>
				</div>
			</div>
		</>
	);
}

export default Home;
