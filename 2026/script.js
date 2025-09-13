import {
	scheduleData,
	loadSchedule,
	renderSchedule,
	parseDay,
} from "./scripts/schedule.js";
import { createBlockCard, createPauseCard } from "./scripts/blockcards.js";
import { toggleHistory, setHistoryButtonState } from "./scripts/history.js";
import {
	generateICSFromSchedule,
	downloadICSFile,
} from "./scripts/calendar.js";
import { CURRENT_YEAR } from "./scripts/config.js";
let historyVisible = false;

// Setup all modal and popup buttons, and expose info globally
const setupUIButtons = async () => {
	let materialsBtn = document.getElementById("materialsBtn");
	let lectorsBtn = document.getElementById("lectorBtn");
	let tableBtn = document.getElementById("tableBtn");
	let addToCalendarBtn = document.getElementById("addToCalendarBtn");
	for (let i = 0; i < 20 && (!materialsBtn || !lectorsBtn || !tableBtn); i++) {
		await new Promise((r) => setTimeout(r, 50));
		materialsBtn = document.getElementById("materialsBtn");
		lectorsBtn = document.getElementById("lectorBtn");
		tableBtn = document.getElementById("tableBtn");
	}
	if (materialsBtn) {
		const { showMaterials } = await import("./scripts/materials.js");
		materialsBtn.addEventListener("click", () => showMaterials(scheduleData));
	}
	if (lectorsBtn) {
		const { showLectors } = await import("./scripts/lectors.js");
		lectorsBtn.addEventListener("click", () => showLectors(scheduleData));
		window.showLectors = (all = true, specificLector = null) =>
			showLectors(scheduleData, all, specificLector);
	}
	if (tableBtn) {
		const { showTable } = await import("./scripts/table.js");
		tableBtn.addEventListener("click", () => showTable(scheduleData, parseDay));
		window.showTable = () => showTable(scheduleData, parseDay);
	}
	if (addToCalendarBtn) {
		addToCalendarBtn.addEventListener("click", (e) => {
			e.preventDefault();
			const ics = generateICSFromSchedule(scheduleData);
			downloadICSFile(ics);
		});
	}
	const { showModal } = await import("./scripts/moreinfo.js");
	window.showModal = (block) => showModal(scheduleData, block);
};

function updateMainHeadingYear() {
	// Wait for navigation to be loaded
	const tryUpdate = () => {
		const heading = document.querySelector(".main-heading");
		if (heading) {
			heading.innerHTML = heading.innerHTML.replace(/\d{4}/, CURRENT_YEAR);
		} else {
			setTimeout(tryUpdate, 50);
		}
	};
	tryUpdate();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		setupUIButtons();
		updateMainHeadingYear();
	});
} else {
	setupUIButtons();
	updateMainHeadingYear();
}

// --- History toggle setup ---
const setHistoryState = (val) => {
	historyVisible = val;
	window.historyVisible = val;
};

const setupHistoryButton = () => {
	const historyBtn = document.getElementById("historyBtn");
	if (historyBtn) {
		setHistoryButtonState(historyVisible);
		historyBtn.addEventListener("click", () => {
			toggleHistory(
				historyVisible,
				setHistoryState,
				() =>
					renderSchedule(
						scheduleData,
						historyVisible,
						window.createBlockCard,
						window.createPauseCard
					),
				scheduleData
			);
		});
	}
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", setupHistoryButton);
} else {
	setupHistoryButton();
}

// Initialize schedule and expose card creators globally
loadSchedule((data) => {
	renderSchedule(
		data,
		historyVisible,
		window.createBlockCard,
		window.createPauseCard
	);
});
window.createBlockCard = (block, duration, isNow, isPastGroup, index = 0) =>
	createBlockCard(scheduleData, block, duration, isNow, isPastGroup, index);
window.createPauseCard = createPauseCard;
