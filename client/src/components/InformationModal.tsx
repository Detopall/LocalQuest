import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
} from "@heroui/react";

interface InformationModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	message?: string;
	backgroundColor?: string;
	buttonLabel?: string;
}

function InformationModal({
	isOpen,
	onClose,
	title = "Information",
	message = "This is a message",
	backgroundColor = "bg-blue-100",
	buttonLabel = "Close",
}: InformationModalProps) {

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalContent className={`${backgroundColor} p-6 rounded-lg shadow-lg`}>
				<ModalHeader className={`text-lg font-semibold`}>{title}</ModalHeader>
				<ModalBody className={`mt-2`}>{message}</ModalBody>
				<ModalFooter className="flex justify-end mt-4">
					<Button
						onPress={onClose}
						variant="ghost"
						className={`text-lg font-semibold`}
						color="danger"
					>
						{buttonLabel}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export default InformationModal;
