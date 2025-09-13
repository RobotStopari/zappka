import { blockTypeStyles, LOCALE } from "./config.js";
import { showModal } from "./moreinfo.js";

export function showTable(scheduleData, parseDay) {
	const tableEl = document.getElementById("tableContent");
	tableEl.innerHTML = "";

	// Sort days by date
	const sortedDays = [...scheduleData].sort(
		(a, b) => parseDay(a.date) - parseDay(b.date)
	);

	for (const day of sortedDays) {
		// Header
		const dateObj = parseDay(day.date);
		let dayStr = dateObj.toLocaleDateString(LOCALE, {
			weekday: "long",
			day: "numeric",
			month: "long",
		});
		// Capitalize the first word (not just first letter)
		dayStr = dayStr.replace(
			/^([\p{L}]+)/u,
			(w) => w.charAt(0).toUpperCase() + w.slice(1)
		);
		const dayHeader = Object.assign(document.createElement("h5"), {
			className: "text-primary mt-3 mb-2",
			textContent: dayStr,
		});
		tableEl.appendChild(dayHeader);

		// Sort and group blocks
		const blocksSorted = [...day.blocks].sort((a, b) =>
			(a.start || "").localeCompare(b.start || "")
		);
		const groups = {};
		for (const block of blocksSorted) {
			if (block.type === "teploměr") {
				groups[`${block.start}_teplomer_${block.title}`] = [block];
			} else {
				groups[block.start] ??= [];
				groups[block.start].push(block);
			}
		}

		Object.values(groups).forEach((group, groupIdx) => {
			if (group.length > 1) {
				// Parallel blocks
				const parallelDiv = Object.assign(document.createElement("div"), {
					className: "table-parallel-group",
				});
				group.forEach((block, idx) =>
					parallelDiv.appendChild(createBlockCard(block, scheduleData, idx))
				);
				tableEl.appendChild(parallelDiv);
			} else {
				tableEl.appendChild(createBlockCard(group[0], scheduleData, groupIdx));
			}
		});
	}

	new bootstrap.Modal(document.getElementById("tableModal")).show();
}

function createBlockCard(block, scheduleData, animIdx = 0) {
	const typeStyle = blockTypeStyles[block.type] || blockTypeStyles["ostatní"];
	const card = document.createElement("div");
	card.className = `card mb-2 shadow-sm${
		block.type === "teploměr" ? "" : " flex-fill"
	}`;
	card.style.background = typeStyle.color;
	card.style.color = "white";
	card.style.opacity = 0;
	card.style.animation = "fadeInUp 0.4s forwards";
	card.style.animationDelay = `${animIdx * 0.05}s`;
	if (block.type !== "teploměr") card.style.minWidth = "260px";

	const cardBody = document.createElement("div");
	cardBody.className =
		"card-body d-flex justify-content-between align-items-center p-2";

	const blockLabel = block.tema || block.title;
	const leftDiv = document.createElement("div");
	leftDiv.innerHTML = `
	<span class=\"me-2\">${typeStyle.icon}</span>
	<strong>${blockLabel}</strong>
	${
		block.type === "teploměr"
			? ""
			: `<span class=\"block-time\">${
					block.start ? `${block.start}${block.end ? ` – ${block.end}` : ""}` : ""
			  }</span>`
	}
  `;
	cardBody.appendChild(leftDiv);

	if (["program", "ostatní"].includes(block.type)) {
		const btn = Object.assign(document.createElement("span"), {
			className: "table-info-icon",
			textContent: "ℹ️",
			style: "cursor:pointer;",
			title: "Více informací",
		});
		btn.addEventListener("click", () => {
			const tableModalEl = document.getElementById("tableModal");
			const tableModalInstance = bootstrap.Modal.getInstance(tableModalEl);
			if (tableModalInstance) tableModalInstance.hide();
			showModal(scheduleData, block);
			document
				.getElementById("blockModal")
				.addEventListener(
					"hidden.bs.modal",
					() => tableModalInstance && tableModalInstance.show(),
					{ once: true }
				);
		});
		cardBody.appendChild(btn);
	}

	card.appendChild(cardBody);
	return card;
}
