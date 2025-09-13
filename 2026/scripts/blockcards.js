import { FEEDBACK_ICON } from "./config.js";
function createFeedbackIcon(block, isNow, isPastGroup) {
	// Only show for past or running blocks of type program/ostatní
	if (!isNow && !isPastGroup) return null;
	if (!["program", "ostatní"].includes(block.type)) return null;
	const span = document.createElement("span");
	span.className = "feedback-icon ms-2";
	span.textContent = FEEDBACK_ICON.icon;
	span.setAttribute("data-popup", FEEDBACK_ICON.tooltip);
	span.style.cursor = "pointer";
	span.addEventListener("click", (e) => {
		e.stopPropagation();
		window.openFeedbackModalForBlock && window.openFeedbackModalForBlock(block);
	});
	// Tooltip popup (same as sources icon)
	let popupDiv = null;
	span.addEventListener("mouseenter", (e) => {
		if (popupDiv) return;
		popupDiv = document.createElement("div");
		popupDiv.className = "sources-popup";
		popupDiv.textContent = FEEDBACK_ICON.tooltip;
		document.body.appendChild(popupDiv);
		const rect = span.getBoundingClientRect();
		popupDiv.style.left = `${
			rect.left + window.scrollX + rect.width / 2 - popupDiv.offsetWidth / 2
		}px`;
		popupDiv.style.top = `${rect.bottom + window.scrollY + 6}px`;
		setTimeout(() => {
			if (!popupDiv || !popupDiv.isConnected) return;
			const rect2 = span.getBoundingClientRect();
			popupDiv.style.left = `${
				rect2.left + window.scrollX + rect2.width / 2 - popupDiv.offsetWidth / 2
			}px`;
			popupDiv.style.top = `${rect2.bottom + window.scrollY + 6}px`;
		}, 0);
	});
	span.addEventListener("mouseleave", () => {
		if (popupDiv) {
			popupDiv.remove();
			popupDiv = null;
		}
	});
	return span;
}
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
	let iconType = "none";
	let popupText = TEXTS.sources.none;
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
			if (showSources) {
				iconType = "unlocked";
				popupText = TEXTS.sources.unlocked;
			} else {
				iconType = "locked";
				popupText = TEXTS.sources.locked;
			}
		}
		// Use data-popup attribute for instant popup
		return `<span class="sources-icon${
			iconType === "none" ? " no-sources" : ""
		}" data-popup="${popupText.replace(/"/g, "&quot;")}">${
			MATERIAL_ICONS[iconType]
		}</span>`;
	}
	return "";
}

function createInfoButton(block) {
	const btn = document.createElement("button");
	btn.className = "info-btn-modern mt-2";
	btn.innerHTML = `<span class="info-icon">ℹ️</span><span class="info-text">${TEXTS.moreInfo
		.replace("ℹ️", "")
		.trim()}</span>`;
	btn.type = "button";
	btn.addEventListener("click", () => {
		btn.classList.add("no-tilt");
		window.showModal(block);
		// Listen for modal close to re-enable tilt
		const blockModal = document.getElementById("blockModal");
		if (blockModal) {
			const handler = () => {
				btn.classList.remove("no-tilt");
				blockModal.removeEventListener("hidden.bs.modal", handler);
			};
			blockModal.addEventListener("hidden.bs.modal", handler);
		} else {
			// fallback: re-enable after 2s if modal not found
			setTimeout(() => btn.classList.remove("no-tilt"), 2000);
		}
	});
	return btn;
}

function getCardBodyHtml(block, icon, sourcesIcon, duration) {
	// Keep icon and last word together with non-breaking space if icon exists
	let titleHtml = block.title;
	if (sourcesIcon) {
		// Find last word in title
		const match = /^(.*?)(\s+)(\S+)$/.exec(block.title);
		if (match) {
			// Insert &nbsp; between last word and icon
			titleHtml = `${match[1]}&nbsp;${match[3]}`;
		}
	}
	return `
			<div class="card-body">
				<h5 class="card-title">${icon} ${titleHtml}${
		sourcesIcon ? "&nbsp;" + sourcesIcon : ""
	}</h5>
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
	col.className = "schedule-card" + (isPastGroup ? " past-block" : "");

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
		// No padding here; let CSS handle it for normal and past blocks
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
		const cardBodyEl = card.querySelector(".card-body");
		const feedbackIcon = createFeedbackIcon(block, isNow, isPastGroup);
		if (feedbackIcon) {
			// Wrap in a right-aligned container
			let rightDiv = cardBodyEl.querySelector(".block-icons-right");
			if (!rightDiv) {
				rightDiv = document.createElement("div");
				rightDiv.className =
					"block-icons-right d-flex flex-column align-items-end justify-content-center";
				cardBodyEl.appendChild(rightDiv);
			}
			rightDiv.appendChild(feedbackIcon);
		}
		if (!["jídlo", "zpětná vazba", "teploměr"].includes(block.type)) {
			cardBodyEl.appendChild(createInfoButton(block));
		}

		// --- Custom instant popup for sources icons ---
		const sourcesEl = card.querySelector(".sources-icon");
		if (sourcesEl) {
			let popupDiv = null;
			sourcesEl.addEventListener("mouseenter", (e) => {
				if (popupDiv) return;
				popupDiv = document.createElement("div");
				popupDiv.className = "sources-popup";
				popupDiv.textContent = sourcesEl.getAttribute("data-popup") || "";
				document.body.appendChild(popupDiv);
				const rect = sourcesEl.getBoundingClientRect();
				popupDiv.style.left = `${
					rect.left + window.scrollX + rect.width / 2 - popupDiv.offsetWidth / 2
				}px`;
				popupDiv.style.top = `${rect.bottom + window.scrollY + 6}px`;
				// Position after adding to DOM
				setTimeout(() => {
					const rect2 = sourcesEl.getBoundingClientRect();
					popupDiv.style.left = `${
						rect2.left + window.scrollX + rect2.width / 2 - popupDiv.offsetWidth / 2
					}px`;
					popupDiv.style.top = `${rect2.bottom + window.scrollY + 6}px`;
				}, 0);
			});
			sourcesEl.addEventListener("mouseleave", () => {
				if (popupDiv) {
					popupDiv.remove();
					popupDiv = null;
				}
			});
		}
	}

	// Do NOT add schedule-card or past-block to the inner card
	col.appendChild(card);
	return col;
}
