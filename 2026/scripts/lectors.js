import { TEXTS } from "./config.js";

export function showLectors(scheduleData, all = true, specificLector = null) {
	const contentEl = document.getElementById("lectorContent");
	contentEl.innerHTML = "";

	// Build a map: lectorName -> [blocks]
	const lectorsMap = {};
	for (const day of scheduleData) {
		for (const block of day.blocks) {
			if (!block.lectors) continue;
			for (const lector of block.lectors) {
				if (!all && lector.name !== specificLector) continue;
				if (!lectorsMap[lector.name]) lectorsMap[lector.name] = [];
				lectorsMap[lector.name].push({ ...block, date: day.date });
			}
		}
	}

	for (const lectorName of Object.keys(lectorsMap).sort()) {
		const blocks = lectorsMap[lectorName];
		// Deduplicate blocks per day
		const seenPerDay = {};
		const dedupedBlocks = [];
		for (const block of blocks) {
			const lectorsStr = (block.lectors || [])
				.map((l) => l.name + (l.color || ""))
				.sort()
				.join(",");
			const key = `${block.title}||${block.tema || ""}||${
				block.description || ""
			}||${lectorsStr}`;
			if (!seenPerDay[block.date]) seenPerDay[block.date] = new Set();
			if (seenPerDay[block.date].has(key)) continue;
			seenPerDay[block.date].add(key);
			dedupedBlocks.push(block);
		}

		// Sort by date and start time
		dedupedBlocks.sort(
			(a, b) =>
				new Date(`${a.date}T${a.start || "00:00"}`) -
				new Date(`${b.date}T${b.start || "00:00"}`)
		);

		// Find realName if available
		const sampleBlock = dedupedBlocks.find((b) =>
			b.lectors?.some((l) => l.name === lectorName)
		);
		const realName =
			sampleBlock?.lectors?.find((l) => l.name === lectorName)?.realName || "";

		// Header
		const lectorHeader = document.createElement("h6");
		lectorHeader.textContent = realName
			? `${lectorName} – ${realName} (${dedupedBlocks.length})`
			: `${lectorName} (${dedupedBlocks.length})`;
		contentEl.appendChild(lectorHeader);

		for (const block of dedupedBlocks) {
			const blockDiv = document.createElement("div");
			blockDiv.className = "lector-block";

			const dayName = new Date(block.date).toLocaleDateString("cs-CZ", {
				weekday: "short",
			});
			const timeText = `${dayName} ${block.start || ""}${
				block.end ? "–" + block.end : ""
			}`;

			// Info icon
			const infoIcon = document.createElement("span");
			infoIcon.className = "lector-info-icon";
			if (["program", "ostatní"].includes(block.type)) {
				infoIcon.textContent = "ℹ️";
				infoIcon.style.cursor = "pointer";
				infoIcon.title = "Více informací";
				infoIcon.onclick = () => {
					const lectorModalEl = document.getElementById("lectorModal");
					const lectorModalInstance = bootstrap.Modal.getInstance(lectorModalEl);
					if (lectorModalInstance) lectorModalInstance.hide();
					if (window.showModal) window.showModal(block);
					document
						.getElementById("blockModal")
						.addEventListener(
							"hidden.bs.modal",
							() => lectorModalInstance && lectorModalInstance.show(),
							{ once: true }
						);
				};
			} else {
				infoIcon.textContent = "";
				infoIcon.style.width = "1.5em";
			}

			// Block name
			const blockName = document.createElement("span");
			blockName.className = "lector-block-name";
			blockName.textContent = block.tema || block.title;

			// Right: day + time
			const rightDiv = document.createElement("div");
			rightDiv.className = "right";
			rightDiv.textContent = timeText;

			blockDiv.append(infoIcon, blockName, rightDiv);
			contentEl.appendChild(blockDiv);
		}
	}

	new bootstrap.Modal(document.getElementById("lectorModal")).show();
}
