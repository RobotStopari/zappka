import {
	scheduleData,
	loadSchedule,
	renderSchedule,
	parseDay,
} from "./scripts/schedule.js";
import { createBlockCard, createPauseCard } from "./scripts/blockcards.js";
import { toggleHistory } from "./scripts/history.js";
let historyVisible = false;

// Setup all modal and popup buttons, and expose info globally
const setupUIButtons = async () => {
	let materialsBtn = document.getElementById("materialsBtn");
	let lectorsBtn = document.getElementById("lectorBtn");
	let tableBtn = document.getElementById("tableBtn");
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
	const { showModal } = await import("./scripts/moreinfo.js");
	window.showModal = (block) => showModal(scheduleData, block);
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", setupUIButtons);
} else {
	setupUIButtons();
}

// --- History toggle setup ---
const setHistoryState = (val) => {
	historyVisible = val;
	window.historyVisible = val;
};

const setupHistoryButton = () => {
	const historyBtn = document.getElementById("historyBtn");
	if (historyBtn) {
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
