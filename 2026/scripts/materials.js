import { TEXTS } from "./config.js";

export function showMaterials(scheduleData) {
	const contentEl = document.getElementById("materialsContent");
	contentEl.innerHTML = "";

	// Flatten all blocks with their date
	const allBlocksRaw = scheduleData.flatMap((day) =>
		day.blocks.map((block) => ({ ...block, date: day.date }))
	);

	// Deduplicate blocks per day
	const seenPerDay = {};
	const allBlocks = allBlocksRaw.filter((block) => {
		const lectorsStr = (block.lectors || [])
			.map((l) => l.name + (l.color || ""))
			.sort()
			.join(",");
		const key = `${block.title}||${block.tema || ""}||${
			block.description || ""
		}||${lectorsStr}`;
		if (!seenPerDay[block.date]) seenPerDay[block.date] = new Set();
		if (seenPerDay[block.date].has(key)) return false;
		seenPerDay[block.date].add(key);
		return true;
	});

	// Sort by date and start time
	allBlocks.sort(
		(a, b) =>
			new Date(`${a.date}T${a.start || "00:00"}`) -
			new Date(`${b.date}T${b.start || "00:00"}`)
	);

	const now = new Date();
	let anyShown = false;

	for (const block of allBlocks) {
		const hasFiles = Array.isArray(block.files) && block.files.length > 0;
		const hasLinks = Array.isArray(block.links) && block.links.length > 0;
		const hasSources = hasFiles || hasLinks;
		if (!hasSources && (!block.start || !block.end)) continue;

		// Determine if sources are unlocked
		const blockStart =
			block.date && block.start ? new Date(`${block.date}T${block.start}`) : null;
		const sourcesUnlocked = blockStart && now >= blockStart;
		if (!hasSources && !sourcesUnlocked) continue;

		const blockLabel = block.tema || block.title;

		// Locked sources
		if (hasSources && !sourcesUnlocked) {
			const div = document.createElement("div");
			div.className = "mb-3";
			div.innerHTML = `<span style="font-weight:600; font-size:1rem;">${blockLabel} <span class='sources-icon' title='${TEXTS.sources.locked}'>🔒</span></span>`;
			// Add popup and pointer to lock icon
			const lockIcon = div.querySelector(".sources-icon");
			if (lockIcon) {
				lockIcon.style.cursor = "pointer";
				let popupDiv = null;
				lockIcon.addEventListener("mouseenter", (e) => {
					if (popupDiv) return;
					popupDiv = document.createElement("div");
					popupDiv.className = "sources-popup";
					popupDiv.textContent = TEXTS.sources.locked;
					document.body.appendChild(popupDiv);
					const rect = lockIcon.getBoundingClientRect();
					popupDiv.style.left = `${
						rect.left + window.scrollX + rect.width / 2 - popupDiv.offsetWidth / 2
					}px`;
					popupDiv.style.top = `${rect.bottom + window.scrollY + 6}px`;
					setTimeout(() => {
						if (!popupDiv || !popupDiv.isConnected) return;
						const rect2 = lockIcon.getBoundingClientRect();
						popupDiv.style.left = `${
							rect2.left + window.scrollX + rect2.width / 2 - popupDiv.offsetWidth / 2
						}px`;
						popupDiv.style.top = `${rect2.bottom + window.scrollY + 6}px`;
					}, 0);
				});
				lockIcon.addEventListener("mouseleave", () => {
					if (popupDiv) {
						popupDiv.remove();
						popupDiv = null;
					}
				});
			}
			contentEl.appendChild(div);
			anyShown = true;
			continue;
		}

		// Unlocked sources
		if (hasSources && sourcesUnlocked) {
			let html = `<div style="font-weight:600; font-size:1rem; margin-bottom:0.2em;">${blockLabel}</div>`;
			if (hasFiles) {
				html += `<ul class="list-unstyled file-list">${block.files
					.map((f) => `<li><a href="${f.url}" target="_blank">${f.name}</a></li>`)
					.join("")}</ul>`;
			}
			if (hasLinks) {
				html += `<ul class="list-unstyled link-list">${block.links
					.map((l) => `<li><a href="${l.url}" target="_blank">${l.desc}</a></li>`)
					.join("")}</ul>`;
			}
			contentEl.insertAdjacentHTML("beforeend", `<div class="mb-3">${html}</div>`);
			anyShown = true;
		}
	}

	if (!anyShown) {
		contentEl.innerHTML = `<div class="text-center text-muted">${TEXTS.sources.none}</div>`;
	}

	new bootstrap.Modal(document.getElementById("materialsModal")).show();
}
