import { useRef } from "react";
import { Button } from "@heroui/react";
import { LogoSvg } from "@/components/svgs";
import AuthModal, { AuthModalRef } from "@/components/AuthModal";

function Hero() {
	const modalRef = useRef<AuthModalRef>(null);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-center p-4">
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

			<AuthModal ref={modalRef} />
		</div>
	);
}

export default Hero;
