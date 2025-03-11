import Profile from "./Profile";

function ProfileOther() {
	const otherUserId = sessionStorage.getItem("otherUserId");
	return (
		<>{otherUserId ? <Profile otherUserId={otherUserId} /> : <Profile />}</>
	);
}

export default ProfileOther;
