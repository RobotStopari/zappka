export function toggleHistory(
	historyVisible,
	setHistoryVisible,
	renderSchedule,
	scheduleData
) {
	const newHistoryVisible = !historyVisible;
	setHistoryVisible(newHistoryVisible);
	renderSchedule(scheduleData);

	const historyBtn = document.getElementById("historyBtn");
	if (!historyBtn) return;
	historyBtn.classList.toggle("active-toggle", newHistoryVisible);
}
