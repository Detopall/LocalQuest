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
	user: any;
}

function ApplicantsModal({
	isOpen,
	onClose,
	quest,
	user,
}: ApplicationModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalContent>
				<ModalHeader>Applicants</ModalHeader>
				<ModalBody>
					{quest.applicants.length === 0 && (
						<p className="text-center font-bold mb-5">No applicants yet</p>
					)}
					{quest.applicants.map((applicant) => (
						<div
							key={applicant._id + applicant.username}
							className="flex flex-row gap-5 text-center justify-center items-center mb-5"
						>
							{applicant.username !== user.username ? (
								<>
									<span className="font-bold text-lg">
										{applicant.username}
									</span>
									<Button
										color="secondary"
										startContent={<PersonSvg />}
										onPress={() => {
											sessionStorage.setItem("otherUserId", applicant._id);
											window.open(`/profile/${applicant.username}`, "_blank");
										}}
									>
										View Profile
									</Button>
								</>
							) : (
								<p className="font-bold text-emerald-500">
									You've applied to this quest
								</p>
							)}
						</div>
					))}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}

export default ApplicantsModal;
