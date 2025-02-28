import { Form, Input, Button } from "@heroui/react";

interface LoginProps {
	onSubmit: (formData: { username: string; password: string }) => void;
}

function Login({ onSubmit }: LoginProps) {
	return (
		<Form
			className="w-full p-5"
			onSubmit={(e) => {
				e.preventDefault();
				const data = Object.fromEntries(new FormData(e.currentTarget)) as {
					username: string;
					password: string;
				};
				try {
					onSubmit(data);
				} catch (error) {
					console.error("Register Error:", error);
				}
			}}
		>
			<Input
				isRequired
				errorMessage="Please enter a valid username"
				label="Username"
				labelPlacement="outside"
				name="username"
				placeholder="Enter your username"
				type="text"
			/>
			<Input
				isRequired
				errorMessage="Please enter a valid username"
				label="Password"
				labelPlacement="outside"
				name="password"
				placeholder="Enter your password"
				type="password"
			/>
			<Button color="primary" variant="shadow" type="submit" className="mt-5">
				Submit
			</Button>
		</Form>
	);
}

export default Login;
