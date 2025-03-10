import { useParams } from "react-router-dom";

function ProfileApplicants() {
	const { username } = useParams();
	return (
		<>
			<div className="text-2xl font-bold">
				<p>{username}'s page</p>
			</div>
		</>
	);
}

export default ProfileApplicants;
