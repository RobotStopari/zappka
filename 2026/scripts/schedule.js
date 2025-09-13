import { LOCALE } from "./config.js";

export let scheduleData = [];

// Parse date string (YYYY-MM-DD) to Date object
export const parseDay = (dateStr) => {
	const [y, m, d] = dateStr.split("-").map(Number);
	return new Date(y, m - 1, d);
};

// Load schedule data and render
export const loadSchedule = async (renderSchedule) => {
	const loadingEl = document.getElementById("loading");
	loadingEl.style.display = "block";
	try {
		const response = await fetch("schedule.json");
		scheduleData = await response.json();
		renderSchedule(scheduleData);
	} catch (err) {
		console.error("Chyba při načítání dat:", err);
	} finally {
		loadingEl.style.display = "none";
	}
};

// Render schedule on main page
export const renderSchedule = (
	schedule,
	historyVisible,
	createBlockCard,
	createPauseCard
) => {
	const scheduleEl = document.getElementById("schedule");
	scheduleEl.innerHTML = "";
	const now = new Date();
	const showHistory =
		window.historyVisible !== undefined ? window.historyVisible : historyVisible;

	// Sort days by date
	const sortedDays = [...schedule].sort(
		(a, b) => parseDay(a.date) - parseDay(b.date)
	);

	for (const day of sortedDays) {
		const blocksSorted = [...day.blocks].sort((a, b) =>
			a.start.localeCompare(b.start)
		);

		// Group blocks by start time, teploměr always separate
		const grouped = {};
		for (const block of blocksSorted) {
			if (block.type === "teploměr") {
				grouped[`${block.start}_teplomer_${block.title}`] = [block];
			} else {
				grouped[block.start] = grouped[block.start] || [];
				grouped[block.start].push(block);
			}
		}

		// Skip day if no future blocks and not showing history
		const futureBlocks = blocksSorted.filter(
			(b) => new Date(`${day.date}T${b.end || b.start}`) >= now
		);
		if (!showHistory && futureBlocks.length === 0) continue;

		// Day header
		const dateObj = parseDay(day.date);
		let dayStr = dateObj.toLocaleDateString(LOCALE, {
			weekday: "long",
			day: "numeric",
			month: "long",
		});
		dayStr = dayStr.replace(/^([\p{L}])/u, (m) => m.toUpperCase());
		const dayHeader = document.createElement("h3");
		dayHeader.className = "day-header";
		dayHeader.textContent = dayStr;
		scheduleEl.appendChild(dayHeader);

		let lastEnd = null;
		Object.entries(grouped).forEach(([startTime, group], index) => {
			const start = new Date(`${day.date}T${group[0].start}`);
			const earliestEnd = new Date(
				`${day.date}T${group[0].end || group[0].start}`
			);

			// Insert pause if needed
			if (lastEnd) {
				const pauzaDur = Math.max(0, Math.round((start - lastEnd) / 60000));
				if (pauzaDur > 0 && (showHistory || start >= now)) {
					scheduleEl.appendChild(createPauseCard(pauzaDur));
				}
			}

			const isPastGroup = group.every(
				(b) => new Date(`${day.date}T${b.end || b.start}`) < now
			);
			const isRunningGroup = group.some((b) => {
				const s = new Date(`${day.date}T${b.start}`);
				const e = new Date(`${day.date}T${b.end || b.start}`);
				return s <= now && e >= now;
			});

			if (!showHistory && isPastGroup && !isRunningGroup) {
				lastEnd = earliestEnd;
				return;
			}

			if (group.length === 1) {
				const block = group[0];
				const end = new Date(`${day.date}T${block.end || block.start}`);
				const duration =
					block.type !== "teploměr" ? Math.round((end - start) / 60000) : 0;
				const isNow = start <= now && end >= now;

				const row = document.createElement("div");
				row.className = "row g-3";
				row.appendChild(
					createBlockCard(block, duration, isNow, isPastGroup, index)
				);
				scheduleEl.appendChild(row);
				lastEnd = end;
			} else {
				const parallelGroup = document.createElement("div");
				parallelGroup.className = "row g-3 parallel-group";
				group.forEach((block, idx) => {
					const end = new Date(`${day.date}T${block.end || block.start}`);
					const duration =
						block.type !== "teploměr" ? Math.round((end - start) / 60000) : 0;
					const isNow = start <= now && end >= now;

					const col = document.createElement("div");
					col.className = "col-12 col-md";
					col.appendChild(createBlockCard(block, duration, isNow, isPastGroup, idx));
					parallelGroup.appendChild(col);
				});
				scheduleEl.appendChild(parallelGroup);
				lastEnd = earliestEnd;
			}
		});
	}
};
