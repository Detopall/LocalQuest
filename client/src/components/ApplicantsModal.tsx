import { Quest } from "@/pages/Profile";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Button,
} from "@heroui/react";
import { PersonSvg } from "@/components/svgs";

interface ApplicationModalProps {
	isOpen: boolean;
	onClose: () => void;
	quest: Quest;
}

function ApplicantsModal({ isOpen, onClose, quest }: ApplicationModalProps) {
	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalContent>
					<ModalHeader>Applicants</ModalHeader>
					<ModalBody>
						{quest.applicants.map((applicant) => (
							<div className="flex flex-row gap-5 text-center justify-center items-center mb-5">
								<span className="font-bold text-lg">{applicant.username}</span>
								<Button
									key={applicant._id}
									color="secondary"
									startContent={<PersonSvg />}
									onPress={() =>
										(window.location.href = `/profile/${applicant.username}`)
									}
								>
									View Profile
								</Button>
							</div>
						))}
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}

export default ApplicantsModal;
