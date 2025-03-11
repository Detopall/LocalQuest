import L from "leaflet";

function ClockSvg() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12m9.828-5.243a1 1 0 0 1 1 1v4.968l3.527 1.34a1 1 0 1 1-.71 1.87l-4.172-1.586a1 1 0 0 1-.645-.935V7.757a1 1 0 0 1 1-1"
				fill="currentColor"
			/>
		</svg>
	);
}

function DangerSvg() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1m0 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0"
				fill="currentColor"
			/>
		</svg>
	);
}

function EditSvg() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M4.333 16.048 16.57 3.81a2.56 2.56 0 0 1 3.62 3.619L7.951 19.667a2 2 0 0 1-1.022.547L3 21l.786-3.93a2 2 0 0 1 .547-1.022"
				stroke="#FFF"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path d="m14.5 6.5 3 3" stroke="#FFF" stroke-width="2" />
		</svg>
	);
}

function TrashSvg() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24">
			<path
				fill="none"
				stroke="#FFF"
				stroke-width="2"
				stroke-miterlimit="10"
				d="M23 27H11c-1.1 0-2-.9-2-2V8h16v17c0 1.1-.9 2-2 2zm4-19H7m7 0V6c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v2m-3 15V12m4 11V12m-8 11V12"
			/>
		</svg>
	);
}

function WarningSvg() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 9v5m0 7.41H5.94c-3.47 0-4.92-2.48-3.24-5.51l3.12-5.62L8.76 5c1.78-3.21 4.7-3.21 6.48 0l2.94 5.29 3.12 5.62c1.68 3.03.22 5.51-3.24 5.51H12z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M11.995 17h.009"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function CreateQuestSvg() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="8" x2="12" y2="16" />
			<line x1="8" y1="12" x2="16" y2="12" />
		</svg>
	);
}

function NotificationSvg() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
			<path d="M13.73 21a2 2 0 0 1-3.46 0" />
		</svg>
	);
}

function LogoutSvg() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
			<path d="M9 12h12l-3 -3" />
			<path d="M18 15l3 -3" />
		</svg>
	);
}

function LogoSvg() {
	return (
		<svg
			width="100%"
			viewBox="225.1453078608281 234.31049832028143 99.7888265418635 98.93798709123703"
		>
			<g
				data-paper-data='{"isIcon":"true","iconType":"icon","rawIconId":"c37d4f0f-8529-431d-8ec0-68c04810674b","source":"inline","selectedEffects":{"container":"","transformation":"","pattern":""},"isDetailed":false,"fillRule":"evenodd","bounds":{"x":225.1453078608281,"y":234.31049832028143,"width":99.7888265418635,"height":98.93798709123703},"iconStyle":"standalone","suitableAsStandaloneIcon":true}'
				fill-rule="evenodd"
				fill="#101820"
			>
				<path
					d="M225.14531,283.77949c0,-27.32092 22.14802,-49.46899 49.46899,-49.46899c11.52183,0 22.12359,3.93862 30.53226,10.54378c-6.40355,-3.56554 -13.77847,-5.59712 -21.6278,-5.59712c-24.58892,0 -44.52212,19.93317 -44.52212,44.52234c0,24.58888 19.9332,44.52212 44.52212,44.52212c7.84933,0 15.22425,-2.03131 21.6278,-5.5968c-8.40867,6.60473 -19.01044,10.54367 -30.53226,10.54367c-27.32097,0 -49.46899,-22.14804 -49.46899,-49.46899zM324.93413,283.77949c0,21.85676 -17.71843,39.5752 -39.5752,39.5752c-9.21745,0 -17.69886,-3.15116 -24.42578,-8.43496c5.12282,2.85244 11.02272,4.47748 17.30222,4.47748c19.67111,0 35.61783,-15.94663 35.61783,-35.61772c0,-19.67138 -15.94671,-35.61783 -35.61783,-35.61783c-6.2795,0 -12.17941,1.62483 -17.30222,4.47737c6.72691,-5.28391 15.20833,-8.4347 24.42578,-8.4347c21.85678,0 39.5752,17.71826 39.5752,39.57515zM291.85714,306.26546v-12.37037h-18.7278v-32.60146h-14.90711v44.97184z"
					data-paper-data='{"isPathIcon":true}'
				></path>
			</g>
		</svg>
	);
}

function GroupSvg() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 36 36"
			fill="#FFF"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M17.9 17.3c2.7 0 4.8-2.2 4.8-4.9s-2.2-4.8-4.9-4.8S13 9.8 13 12.4c0 2.7 2.2 4.9 4.9 4.9m-.1-7.7q.15 0 0 0c1.6 0 2.9 1.3 2.9 2.9s-1.3 2.8-2.9 2.8S15 14 15 12.5c0-1.6 1.3-2.9 2.8-2.9" />
			<path d="M32.7 16.7c-1.9-1.7-4.4-2.6-7-2.5h-.8q-.3 1.2-.9 2.1c.6-.1 1.1-.1 1.7-.1 1.9-.1 3.8.5 5.3 1.6V25h2v-8z" />
			<path d="M23.4 7.8c.5-1.2 1.9-1.8 3.2-1.3 1.2.5 1.8 1.9 1.3 3.2-.4.9-1.3 1.5-2.2 1.5-.2 0-.5 0-.7-.1.1.5.1 1 .1 1.4v.6c.2 0 .4.1.6.1 2.5 0 4.5-2 4.5-4.4 0-2.5-2-4.5-4.4-4.5-1.6 0-3 .8-3.8 2.2.5.3 1 .7 1.4 1.3" />
			<path d="M12 16.4q-.6-.9-.9-2.1h-.8c-2.6-.1-5.1.8-7 2.4L3 17v8h2v-7.2c1.6-1.1 3.4-1.7 5.3-1.6.6 0 1.2.1 1.7.2" />
			<path d="M10.3 13.1c.2 0 .4 0 .6-.1v-.6c0-.5 0-1 .1-1.4-.2.1-.5.1-.7.1-1.3 0-2.4-1.1-2.4-2.4S9 6.3 10.3 6.3c1 0 1.9.6 2.3 1.5.4-.5 1-1 1.5-1.4-1.3-2.1-4-2.8-6.1-1.5s-2.8 4-1.5 6.1c.8 1.3 2.2 2.1 3.8 2.1" />
			<path d="m26.1 22.7-.2-.3c-2-2.2-4.8-3.5-7.8-3.4-3-.1-5.9 1.2-7.9 3.4l-.2.3v7.6c0 .9.7 1.7 1.7 1.7h12.8c.9 0 1.7-.8 1.7-1.7v-7.6zm-2 7.3H12v-6.6c1.6-1.6 3.8-2.4 6.1-2.4 2.2-.1 4.4.8 6 2.4z" />
			<path fill="none" d="M0 0h36v36H0z" />
		</svg>
	);
}

function PersonSvg() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m2 4c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2m4 10c-.2-.71-3.3-2-6-2-2.69 0-5.77 1.28-6 2zM4 18c0-2.66 5.33-4 8-4s8 1.34 8 4v2H4z"
				fill="#FFF"
			/>
		</svg>
	);
}

function UserSvg() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			data-name="Flat Color"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M21 20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 6 6 0 0 1 6-6h6a6 6 0 0 1 6 6m-9-8a5 5 0 1 0-5-5 5 5 0 0 0 5 5"
				fill="#000"
			/>
		</svg>
	);
}

const userIconLeaflet = L.icon({
	iconUrl: "src/assets/svgs/user.svg",
	iconSize: [24, 24],
	iconAnchor: [24, 24],
	popupAnchor: [-10, -40],
});

export {
	ClockSvg,
	DangerSvg,
	EditSvg,
	TrashSvg,
	WarningSvg,
	CreateQuestSvg,
	NotificationSvg,
	LogoutSvg,
	LogoSvg,
	GroupSvg,
	PersonSvg,
	UserSvg,
	userIconLeaflet,
};
