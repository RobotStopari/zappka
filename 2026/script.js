// Show all materials popup
function showMaterials() {
	const contentEl = document.getElementById("materialsContent");
	contentEl.innerHTML = "";

	// Gather all blocks with sources
	const allBlocks = [];
	scheduleData.forEach((day) => {
		day.blocks.forEach((block) => {
			allBlocks.push({ ...block, date: day.date });
		});
	});

	// Sort by date+start
	allBlocks.sort((a, b) => {
		const dateA = new Date(`${a.date}T${a.start || "00:00"}`);
		const dateB = new Date(`${b.date}T${b.start || "00:00"}`);
		return dateA - dateB;
	});

	const now = new Date();
	let anyShown = false;
	allBlocks.forEach((block) => {
		const hasSources =
			(block.files && block.files.length > 0) ||
			(block.links && block.links.length > 0);
		if (!hasSources && (!block.start || !block.end)) return;

		// Find block start
		let blockStart = null;
		if (block.date && block.start)
			blockStart = new Date(`${block.date}T${block.start}`);
		let sourcesUnlocked = blockStart && now >= blockStart;

		if (!hasSources && !sourcesUnlocked) return;

		// If locked
		const blockLabel = block.tema ? block.tema : block.title;
		if (hasSources && !sourcesUnlocked) {
			const blockDiv = document.createElement("div");
			blockDiv.className = "mb-3";
			blockDiv.innerHTML = `<span style="font-weight:600; font-size:1rem;">${blockLabel} <span class='sources-icon' title='Materiály budou zpřístupněny až po začátku bloku.'>🔒</span></span>`;
			contentEl.appendChild(blockDiv);
			anyShown = true;
			return;
		}

		// If has sources and unlocked
		if (hasSources && sourcesUnlocked) {
			const blockDiv = document.createElement("div");
			blockDiv.className = "mb-3";
			blockDiv.innerHTML = `<div style="font-weight:600; font-size:1rem; margin-bottom:0.2em;">${blockLabel}</div>`;
			// Files
			if (block.files && block.files.length > 0) {
				const filesList = document.createElement("ul");
				filesList.className = "list-unstyled file-list";
				block.files.forEach((f) => {
					const li = document.createElement("li");
					li.innerHTML = `<a href="${f.url}" target="_blank">${f.name}</a>`;
					filesList.appendChild(li);
				});
				blockDiv.appendChild(filesList);
			}
			// Links
			if (block.links && block.links.length > 0) {
				const linksList = document.createElement("ul");
				linksList.className = "list-unstyled link-list";
				block.links.forEach((l) => {
					const li = document.createElement("li");
					li.innerHTML = `<a href="${l.url}" target="_blank">${l.desc}</a>`;
					linksList.appendChild(li);
				});
				blockDiv.appendChild(linksList);
			}
			contentEl.appendChild(blockDiv);
			anyShown = true;
		}
	});

	if (!anyShown) {
		contentEl.innerHTML =
			'<div class="text-center text-muted">Žádné materiály nejsou aktuálně dostupné.</div>';
	}

	new bootstrap.Modal(document.getElementById("materialsModal")).show();
}
document
	.getElementById("materialsBtn")
	.addEventListener("click", showMaterials);
let scheduleData = [];
let historyVisible = false;

// ✅ Safe date parser (YYYY-MM-DD → always correct order)
function parseDay(dateStr) {
	const [y, m, d] = dateStr.split("-").map(Number);
	return new Date(y, m - 1, d);
}

// Load schedule data
async function loadSchedule() {
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
}

const blockTypeStyles = {
	program: { color: "#0d6efd", icon: "📒" },
	jídlo: { color: "#28a745", icon: "🍽️" },
	"zpětná vazba": { color: "#ffc107", icon: "📝" },
	teploměr: { color: "#fd7e14", icon: "🌡️" },
	ostatní: { color: "#6c757d", icon: "⚪" },
};

// Render schedule on main page
function renderSchedule(schedule) {
	const scheduleEl = document.getElementById("schedule");
	scheduleEl.innerHTML = "";
	const now = new Date();

	// ✅ Sort days by parsed date
	const sortedDays = [...schedule].sort(
		(a, b) => parseDay(a.date) - parseDay(b.date)
	);

	sortedDays.forEach((day) => {
		const blocksSorted = [...day.blocks].sort((a, b) =>
			a.start.localeCompare(b.start)
		);

		const grouped = {};

		// ✅ Teploměr always separate group
		blocksSorted.forEach((block) => {
			if (block.type === "teploměr") {
				grouped[`${block.start}_teplomer_${block.title}`] = [block];
			} else {
				if (!grouped[block.start]) grouped[block.start] = [];
				grouped[block.start].push(block);
			}
		});

		const futureBlocks = blocksSorted.filter(
			(b) => new Date(`${day.date}T${b.end || b.start}`) >= now
		);
		if (!historyVisible && futureBlocks.length === 0) return;

		const dayHeader = document.createElement("h3");
		dayHeader.className = "day-header";
		// Capitalize only the first letter of the weekday, rest as is
		const dateObj = parseDay(day.date);
		let dayStr = dateObj.toLocaleDateString("cs-CZ", {
			weekday: "long",
			day: "numeric",
			month: "long",
		});
		// Capitalize only the first word (weekday)
		dayStr = dayStr.replace(/^([\p{L}])/u, (m) => m.toUpperCase());
		dayHeader.textContent = dayStr;
		scheduleEl.appendChild(dayHeader);

		let lastEnd = null;

		Object.keys(grouped).forEach((startTime, index) => {
			const group = grouped[startTime];
			const start = new Date(`${day.date}T${group[0].start}`);
			const earliestEnd = new Date(
				`${day.date}T${group[0].end || group[0].start}`
			);

			// Pauses
			if (lastEnd) {
				const pauzaStart = lastEnd;
				const pauzaEnd = start;
				const pauzaDur = Math.max(
					0,
					Math.round((pauzaEnd - pauzaStart) / (1000 * 60))
				);
				if (pauzaDur > 0 && (historyVisible || pauzaEnd >= now)) {
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

			if (!historyVisible && isPastGroup && !isRunningGroup) {
				lastEnd = earliestEnd;
				return;
			}

			if (group.length === 1) {
				const block = group[0];
				const end = new Date(`${day.date}T${block.end || block.start}`);
				const duration =
					block.type !== "teploměr" ? Math.round((end - start) / (1000 * 60)) : 0;
				const isNow = start <= now && end >= now;

				const row = document.createElement("div");
				row.className = "row g-3";

				const card = createBlockCard(block, duration, isNow, isPastGroup, index);
				row.appendChild(card);
				scheduleEl.appendChild(row);
				lastEnd = end;
			} else {
				const parallelGroup = document.createElement("div");
				parallelGroup.className = "row g-3 parallel-group";

				group.forEach((block, idx) => {
					const end = new Date(`${day.date}T${block.end || block.start}`);
					const duration =
						block.type !== "teploměr" ? Math.round((end - start) / (1000 * 60)) : 0;
					const isNow = start <= now && end >= now;

					const col = document.createElement("div");
					col.className = "col-12 col-md";
					const card = createBlockCard(block, duration, isNow, isPastGroup, idx);
					col.appendChild(card);
					parallelGroup.appendChild(col);
				});

				scheduleEl.appendChild(parallelGroup);
				lastEnd = earliestEnd;
			}
		});
	});
}

// Pause card
function createPauseCard(minutes) {
	const card = document.createElement("div");
	card.className = "schedule-card pause-card";
	card.style.background = "#e9ecef";
	card.style.color = "#000";
	card.style.padding = "0.25rem 0.5rem";
	card.style.margin = "0.25rem 0";
	card.style.borderRadius = "0.25rem";
	card.style.fontSize = "0.85rem";
	card.style.display = "flex";
	card.style.alignItems = "center";
	card.style.justifyContent = "center";
	card.style.opacity = 0;
	card.style.animation = "fadeInUp 0.4s forwards";

	card.textContent = `☕ Pauza (${formatDuration(minutes)})`;
	return card;
}

// Block card
function createBlockCard(block, duration, isNow, isPastGroup, index = 0) {
	const col = document.createElement("div");
	col.className = "schedule-card";

	const typeStyle = blockTypeStyles[block.type] || blockTypeStyles["ostatní"];
	const bgColor = typeStyle.color;
	const icon = typeStyle.icon;

	const card = document.createElement("div");
	card.className = `card shadow-sm ${isNow ? "running" : ""}`;
	card.style.background = bgColor;
	card.style.color = "white";
	card.style.opacity = 0;
	card.style.animation = `fadeInUp 0.4s forwards`;
	card.style.animationDelay = `${index * 0.05}s`;

	// --- Sources icon logic ---
	let hasSources =
		(block.files && block.files.length > 0) ||
		(block.links && block.links.length > 0);
	let showSources = false;
	let sourcesIcon = "";
	// Only for blocks where info is available (program, ostatní)
	if (["program", "ostatní"].includes(block.type)) {
		if (hasSources) {
			// Find block date
			let blockDate = null;
			for (const day of scheduleData) {
				if (day.blocks && Array.isArray(day.blocks)) {
					for (const b of day.blocks) {
						if (b === block) {
							blockDate = day.date;
							break;
						}
					}
				}
				if (blockDate) break;
			}
			if (blockDate && block.start) {
				const now = new Date();
				const blockStart = new Date(`${blockDate}T${block.start}`);
				// Only show sources if the block has started (now >= blockStart)
				if (now >= blockStart) {
					showSources = true;
				}
			}
			if (showSources) {
				sourcesIcon =
					'<span class="sources-icon" title="Materiály jsou nyní dostupné.">👁️</span>';
			} else {
				sourcesIcon =
					'<span class="sources-icon" title="Materiály budou zpřístupněny až po začátku bloku.">🔒</span>';
			}
		} else {
			// No sources at all
			sourcesIcon =
				'<span class="sources-icon no-sources" title="Žádné materiály nejsou k tomuto bloku k dispozici.">📁</span>';
		}
	}

	if (block.type === "teploměr") {
		card.innerHTML = `
	  <div class="card-body d-flex align-items-center p-1">
		<strong>${icon} ${block.title}</strong>
	  </div>
	`;
	} else {
		card.innerHTML = `
	  <div class="card-body">
		<h5 class="card-title">${icon} ${block.title} ${sourcesIcon}</h5>
		${
			block.tema
				? `<p class="card-subtema text-muted mb-1" style="font-size:0.85rem; text-transform: lowercase;">${block.tema}</p>`
				: ""
		}
		<p class="card-text mb-1">
		  <strong>${block.start} – ${block.end || ""}</strong>
		  ${block.type !== "teploměr" ? "(" + formatDuration(duration) + ")" : ""}
		</p>
		<p class="card-text">${renderLectors(block.lectors)}</p>
		${
			block.type === "jídlo" && block.description
				? `<p class="card-text"><em>${block.description}</em></p>`
				: ""
		}
	  </div>
	`;

		if (!["jídlo", "zpětná vazba", "teploměr"].includes(block.type)) {
			const btn = document.createElement("button");
			btn.className = "btn btn-light btn-sm mt-2 info-btn";
			btn.textContent = "ℹ️ Více informací";
			btn.addEventListener("click", () => showModal(block));
			card.querySelector(".card-body").appendChild(btn);
		}
	}

	if (isPastGroup) {
		card.style.opacity = "0.5";
		card.style.filter = "grayscale(80%)";
	}

	col.appendChild(card);
	return col;
}

// Modal logic
function showModal(block) {
	const tableModalEl = document.getElementById("tableModal");
	const tableModalInstance = bootstrap.Modal.getInstance(tableModalEl);
	const tableWasVisible = tableModalEl.classList.contains("show");
	if (tableWasVisible && tableModalInstance) tableModalInstance.hide();

	// Title
	document.getElementById("modalTitle").textContent = block.title;

	// Title
	document.getElementById("modalTitle").textContent = block.title;

	// Téma (top of modal, above time)
	const modalTemaEl = document.getElementById("modalTema");
	if (modalTemaEl) {
		modalTemaEl.textContent = block.tema || "";
		modalTemaEl.style.display = block.tema ? "block" : "none";
	}

	// Time
	document.getElementById("modalTime").textContent = block.start
		? `${block.start}${block.end ? " – " + block.end : ""}`
		: "";

	// Lectors
	document.getElementById("modalLectors").innerHTML = renderLectors(
		block.lectors
	);

	// Description
	document.getElementById("modalDesc").textContent =
		block.description || "Bez popisu";

	// --- Sources icon logic for modal ---
	const filesEl = document.getElementById("modalFiles");
	filesEl.innerHTML = "";
	let hasSources =
		(block.files && block.files.length > 0) ||
		(block.links && block.links.length > 0);
	let showFilesAndLinks = false;
	let sourcesIcon = "";
	if (hasSources) {
		// Try to get the block's date from the scheduleData
		let blockDate = null;
		for (const day of scheduleData) {
			if (day.blocks && Array.isArray(day.blocks)) {
				for (const b of day.blocks) {
					if (b === block) {
						blockDate = day.date;
						break;
					}
				}
			}
			if (blockDate) break;
		}
		if (blockDate && block.start) {
			const now = new Date();
			const blockStart = new Date(`${blockDate}T${block.start}`);
			// Only show sources if the block has started (now >= blockStart)
			if (now >= blockStart) {
				showFilesAndLinks = true;
				// No icon when sources are available in modal
			} else {
				sourcesIcon =
					'<span class="sources-icon" title="Materiály budou zpřístupněny až po začátku bloku.">🔒</span>';
			}
		} else {
			sourcesIcon =
				'<span class="sources-icon" title="Materiály budou zpřístupněny až po začátku bloku.">🔒</span>';
		}
	}
	// Insert icon at the top of modal files section if needed
	if (sourcesIcon) {
		filesEl.innerHTML = sourcesIcon;
	}
	if (showFilesAndLinks) {
		if (block.files && block.files.length > 0) {
			filesEl.innerHTML +=
				"<strong>Soubory ke stažení:</strong><ul class='list-unstyled file-list'></ul>";
			const ul = filesEl.querySelector("ul");
			block.files.forEach((f) => {
				const li = document.createElement("li");
				li.innerHTML = `<a href=\"${f.url}\" target=\"_blank\">${f.name}</a>`;
				ul.appendChild(li);
			});
		}
		if (block.links && block.links.length > 0) {
			const linksContainer = document.createElement("div");
			linksContainer.innerHTML =
				"<strong>Odkazy:</strong><ul class='list-unstyled link-list'></ul>";
			const ul = linksContainer.querySelector("ul");
			block.links.forEach((l) => {
				const li = document.createElement("li");
				li.innerHTML = `<a href=\"${l.url}\" target=\"_blank\">${l.desc}</a>`;
				ul.appendChild(li);
			});
			filesEl.appendChild(linksContainer);
		}
	}

	// Show the modal
	const blockModal = new bootstrap.Modal(document.getElementById("blockModal"));
	blockModal.show();

	document.getElementById("blockModal").addEventListener(
		"hidden.bs.modal",
		() => {
			if (tableWasVisible && tableModalInstance) tableModalInstance.show();
		},
		{ once: true }
	);
}

// Tabulka view
function showTable() {
	const tableEl = document.getElementById("tableContent");
	tableEl.innerHTML = "";

	// Sort days safely
	const sortedDays = [...scheduleData].sort(
		(a, b) => parseDay(a.date) - parseDay(b.date)
	);

	sortedDays.forEach((day) => {
		const dayHeader = document.createElement("h5");
		dayHeader.className = "text-primary mt-3 mb-2";
		// Capitalize only the first letter of the weekday, rest as is
		const dateObj = parseDay(day.date);
		let dayStr = dateObj.toLocaleDateString("cs-CZ", {
			weekday: "long",
			day: "numeric",
			month: "long",
		});
		// Capitalize only the first word (weekday)
		dayStr = dayStr.replace(/^([\p{L}])/u, (m) => m.toUpperCase());
		dayHeader.textContent = dayStr;
		tableEl.appendChild(dayHeader);

		// Sort blocks by start time
		const blocksSorted = [...day.blocks].sort((a, b) =>
			(a.start || "").localeCompare(b.start || "")
		);
		blocksSorted.forEach((block, index) => {
			const card = document.createElement("div");
			card.className = "card mb-2 shadow-sm";

			const typeStyle = blockTypeStyles[block.type] || blockTypeStyles["ostatní"];
			card.style.background = typeStyle.color;
			card.style.color = "white";
			card.style.opacity = 0;
			card.style.animation = `fadeInUp 0.4s forwards`;
			card.style.animationDelay = `${index * 0.05}s`;

			const cardBody = document.createElement("div");
			cardBody.className =
				"card-body d-flex justify-content-between align-items-center p-2";

			const leftDiv = document.createElement("div");
			const blockLabel = block.tema || block.title; // Use tema or fallback to title
			leftDiv.innerHTML = `<span class="me-2">${
				typeStyle.icon
			}</span> <strong>${blockLabel}</strong> ${
				block.type === "teploměr" ? "" : block.start || ""
			} ${block.type === "teploměr" ? "" : block.end ? "– " + block.end : ""}`;
			cardBody.appendChild(leftDiv);

			// ℹ️ button for info
			if (["program", "ostatní"].includes(block.type)) {
				const btn = document.createElement("span");
				btn.className = "table-info-icon";
				btn.textContent = "ℹ️";
				btn.style.cursor = "pointer";
				btn.title = "Více informací";
				btn.addEventListener("click", () => {
					const tableModalEl = document.getElementById("tableModal");
					const tableModalInstance = bootstrap.Modal.getInstance(tableModalEl);
					if (tableModalInstance) tableModalInstance.hide();
					showModal(block);
					document.getElementById("blockModal").addEventListener(
						"hidden.bs.modal",
						() => {
							if (tableModalInstance) tableModalInstance.show();
						},
						{ once: true }
					);
				});
				cardBody.appendChild(btn);
			}

			card.appendChild(cardBody);
			tableEl.appendChild(card);
		});
	});

	new bootstrap.Modal(document.getElementById("tableModal")).show();
}

// Helpers
function renderLectors(lectors) {
	if (!lectors || lectors.length === 0) return "";
	return lectors
		.map(
			(l) =>
				`<span class="badge me-1" style="background:${l.color}; cursor:pointer" onclick="showLectors(false, '${l.name}')">${l.name}</span>`
		)
		.join(" ");
}

function formatDuration(minutes) {
	if (minutes < 60) return `${minutes} min`;

	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;

	return mins === 0 ? `${hours} h` : `${hours} h ${mins} min`;
}

// History toggle
function toggleHistory() {
	historyVisible = !historyVisible;
	renderSchedule(scheduleData);
	const historyBtn = document.getElementById("historyBtn");
	if (historyVisible) historyBtn.classList.add("active-toggle");
	else historyBtn.classList.remove("active-toggle");
}

function showLectors(all = true, specificLector = null) {
	const contentEl = document.getElementById("lectorContent");
	contentEl.innerHTML = "";

	const lectorsMap = {};
	scheduleData.forEach((day) => {
		day.blocks.forEach((block) => {
			if (!block.lectors) return;
			block.lectors.forEach((l) => {
				if (!all && l.name !== specificLector) return;
				if (!lectorsMap[l.name]) lectorsMap[l.name] = [];
				lectorsMap[l.name].push({ ...block, date: day.date });
			});
		});
	});

	Object.keys(lectorsMap)
		.sort()
		.forEach((lectorName) => {
			const blocks = lectorsMap[lectorName];

			// Sort blocks by date + start time
			blocks.sort((a, b) => {
				const dateA = new Date(`${a.date}T${a.start || "00:00"}`);
				const dateB = new Date(`${b.date}T${b.start || "00:00"}`);
				return dateA - dateB;
			});

			const blocksCount = blocks.length;

			// Lector header
			const lectorHeader = document.createElement("h6");
			lectorHeader.textContent = `${lectorName} (${blocksCount})`;
			contentEl.appendChild(lectorHeader);

			blocks.forEach((block) => {
				const blockDiv = document.createElement("div");
				blockDiv.className = "lector-block";

				const dayName = new Date(block.date).toLocaleDateString("cs-CZ", {
					weekday: "short",
				});
				const timeText = `${dayName} ${block.start || ""}${
					block.end ? "–" + block.end : ""
				}`;

				// Info icon (always left)
				let infoIcon = null;
				if (["program", "ostatní"].includes(block.type)) {
					infoIcon = document.createElement("span");
					infoIcon.className = "lector-info-icon";
					infoIcon.textContent = "ℹ️";
					infoIcon.style.cursor = "pointer";
					infoIcon.title = "Více informací";
					infoIcon.addEventListener("click", () => {
						const lectorModalEl = document.getElementById("lectorModal");
						const lectorModalInstance = bootstrap.Modal.getInstance(lectorModalEl);
						if (lectorModalInstance) lectorModalInstance.hide();
						showModal(block);
						document.getElementById("blockModal").addEventListener(
							"hidden.bs.modal",
							() => {
								if (lectorModalInstance) lectorModalInstance.show();
							},
							{ once: true }
						);
					});
				} else {
					infoIcon = document.createElement("span");
					infoIcon.className = "lector-info-icon";
					infoIcon.textContent = "";
					infoIcon.style.width = "1.5em"; // reserve space
				}

				// Block name
				const blockName = document.createElement("span");
				blockName.className = "lector-block-name";
				blockName.textContent = block.tema || block.title;

				// Right: day + time
				const rightDiv = document.createElement("div");
				rightDiv.className = "right";
				rightDiv.textContent = timeText;

				blockDiv.appendChild(infoIcon);
				blockDiv.appendChild(blockName);
				blockDiv.appendChild(rightDiv);
				contentEl.appendChild(blockDiv);
			});
		});

	new bootstrap.Modal(document.getElementById("lectorModal")).show();
}

// Events
document.getElementById("historyBtn").addEventListener("click", toggleHistory);
document.getElementById("tableBtn").addEventListener("click", showTable);
document
	.getElementById("lectorBtn")
	.addEventListener("click", () => showLectors());
// Init
loadSchedule();

// Make showLectors accessible from HTML onclick
window.showLectors = showLectors;
