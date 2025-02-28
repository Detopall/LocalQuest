import { Form, Input, Button } from "@heroui/react";

interface RegisterProps {
	onSubmit: (formData: {
		username: string;
		email: string;
		password: string;
	}) => void;
}

function Register({ onSubmit }: RegisterProps) {

	return (
		<Form
			className="w-full p-5"
			onSubmit={(e) => {
				e.preventDefault();
				const data = Object.fromEntries(new FormData(e.currentTarget)) as {
					username: string;
					email: string;
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
				errorMessage="Please enter a valid email"
				label="Email"
				labelPlacement="outside"
				name="email"
				placeholder="Enter your email"
				type="email"
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

export default Register;
