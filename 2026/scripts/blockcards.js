import { blockTypeStyles, TEXTS, MATERIAL_ICONS } from "./config.js";
import { renderLectors, formatDuration } from "./helpers.js";

export function createPauseCard(minutes) {
	const card = Object.assign(document.createElement("div"), {
		className: "schedule-card pause-card",
		textContent: `${TEXTS.pause} (${formatDuration(minutes)})`,
	});
	Object.assign(card.style, {
		background: "#e9ecef",
		color: "#000",
		padding: "0.25rem 0.5rem",
		margin: "0.25rem 0",
		borderRadius: "0.25rem",
		fontSize: "0.85rem",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		opacity: 0,
		animation: "fadeInUp 0.4s forwards",
	});
	return card;
}

function getSourcesIcon(scheduleData, block) {
	const hasSources =
		(block.files?.length || 0) > 0 || (block.links?.length || 0) > 0;
	if (["program", "ostatní"].includes(block.type)) {
		if (hasSources) {
			let blockDate = null;
			for (const day of scheduleData) {
				if (Array.isArray(day.blocks) && day.blocks.includes(block)) {
					blockDate = day.date;
					break;
				}
			}
			const now = new Date();
			const blockStart =
				blockDate && block.start ? new Date(`${blockDate}T${block.start}`) : null;
			const showSources = blockStart && now >= blockStart;
			return showSources
				? `<span class="sources-icon" title="${TEXTS.sources.unlocked}">${MATERIAL_ICONS.unlocked}</span>`
				: `<span class="sources-icon" title="${TEXTS.sources.locked}">${MATERIAL_ICONS.locked}</span>`;
		} else {
			return `<span class="sources-icon no-sources" title="${TEXTS.sources.none}">${MATERIAL_ICONS.none}</span>`;
		}
	}
	return "";
}

function createInfoButton(block) {
	const btn = document.createElement("button");
	btn.className = "btn btn-light btn-sm mt-2 info-btn";
	btn.textContent = "ℹ️ Více informací";
	btn.onclick = () => window.showModal(block);
	return btn;
}

function getCardBodyHtml(block, icon, sourcesIcon, duration) {
	return `
		<div class="card-body">
			<h5 class="card-title">${icon} ${block.title} ${sourcesIcon}</h5>
			${
				block.tema
					? `<p class="card-subtema text-muted mb-1" style="font-size:0.85rem; text-transform: lowercase;">${block.tema}</p>`
					: ""
			}
			<p class="card-text mb-1">
				<strong>${block.start} – ${block.end || ""}</strong>
				${block.type !== "teploměr" ? `(${formatDuration(duration)})` : ""}
			</p>
			<p class="card-text">${renderLectors(block.lectors)}</p>
			${
				block.type === "jídlo" && block.description
					? `<p class="card-text"><em>${block.description}</em></p>`
					: ""
			}
		</div>
	`;
}

export function createBlockCard(
	scheduleData,
	block,
	duration,
	isNow,
	isPastGroup,
	index = 0
) {
	const col = document.createElement("div");
	col.className = "schedule-card";

	const { color: bgColor, icon } =
		blockTypeStyles[block.type] || blockTypeStyles["ostatní"];

	const card = document.createElement("div");
	card.className = `card shadow-sm${isNow ? " running" : ""}`;
	Object.assign(card.style, {
		background: bgColor,
		color: "white",
		opacity: 0,
		animation: "fadeInUp 0.4s forwards",
		animationDelay: `${index * 0.05}s`,
	});

	const sourcesIcon = getSourcesIcon(scheduleData, block);

	if (block.type === "teploměr") {
		card.innerHTML = `
			<div class="card-body d-flex align-items-center p-1">
				<strong>${icon} ${block.title}</strong>
			</div>
		`;
	} else {
		card.innerHTML = getCardBodyHtml(block, icon, sourcesIcon, duration);
		if (!["jídlo", "zpětná vazba", "teploměr"].includes(block.type)) {
			card.querySelector(".card-body").appendChild(createInfoButton(block));
		}
	}

	if (isPastGroup) {
		Object.assign(card.style, {
			opacity: "0.5",
			filter: "grayscale(80%)",
		});
	}

	col.appendChild(card);
	return col;
}
