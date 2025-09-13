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
			contentEl.insertAdjacentHTML(
				"beforeend",
				`<div class="mb-3"><span style="font-weight:600; font-size:1rem;">${blockLabel} <span class='sources-icon' title='${TEXTS.sources.locked}'>🔒</span></span></div>`
			);
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
