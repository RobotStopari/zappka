import { FEEDBACK_ICON } from "./config.js";
function createFeedbackIconForModal(block, blockDate) {
	// Only show for past or running blocks of type program/ostatní
	if (!["program", "ostatní"].includes(block.type)) return null;
	const now = new Date();
	const start =
		blockDate && block.start ? new Date(`${blockDate}T${block.start}`) : null;
	const end =
		blockDate && (block.end || block.start)
			? new Date(`${blockDate}T${block.end || block.start}`)
			: null;
	const isFuture = start && start > now;
	if (isFuture) return null;
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
import { renderLectors } from "./helpers.js";

export function showModal(scheduleData, block) {
	const $ = (id) => document.getElementById(id);

	// Hide table modal if visible
	const tableModalEl = $("tableModal");
	const tableModalInstance = bootstrap.Modal.getInstance(tableModalEl);
	const tableWasVisible = tableModalEl?.classList.contains("show");
	if (tableWasVisible && tableModalInstance) tableModalInstance.hide();

	// Set modal title
	$("modalTitle").textContent = block.title;

	// Téma (above time)
	const temaEl = $("modalTema");
	if (temaEl) {
		temaEl.textContent = block.tema || "";
		temaEl.style.display = block.tema ? "block" : "none";
	}

	// Time
	$("modalTime").textContent = block.start
		? `${block.start}${block.end ? " – " + block.end : ""}`
		: "";

	// Lectors
	$("modalLectors").innerHTML = renderLectors(block.lectors);

	// Description
	$("modalDesc").textContent = block.description || "Bez popisu";

	// --- Feedback and sources icon logic for modal ---
	const filesEl = $("modalFiles");
	filesEl.innerHTML = "";
	let blockDate = null;
	for (const day of scheduleData) {
		if (Array.isArray(day.blocks)) {
			if (day.blocks.includes(block)) {
				blockDate = day.date;
				break;
			}
		}
	}
	// Feedback icon for non-future blocks (move to modal-header)
	const feedbackIcon = createFeedbackIconForModal(block, blockDate);
	if (feedbackIcon) {
		feedbackIcon.classList.add("modal-header-feedback-icon");
		// Insert into modal-header, before close button
		const modalHeader = document.querySelector("#blockModal .modal-header");
		const closeBtn = modalHeader?.querySelector(".btn-close");
		// Remove all existing feedback icons first
		if (modalHeader) {
			modalHeader
				.querySelectorAll(".modal-header-feedback-icon")
				.forEach((el) => el.remove());
		}
		if (modalHeader && closeBtn) {
			modalHeader.insertBefore(feedbackIcon, closeBtn);
		}
	}

	const hasSources =
		(block.files?.length || 0) > 0 || (block.links?.length || 0) > 0;
	let showFilesAndLinks = false;
	let sourcesIcon = "";
	if (hasSources) {
		if (blockDate && block.start) {
			const now = new Date();
			const blockStart = new Date(`${blockDate}T${block.start}`);
			if (now >= blockStart) {
				showFilesAndLinks = true;
			} else {
				sourcesIcon = `<span class=\"sources-icon modal-lock\" style=\"opacity:1;filter:none;cursor:default;\">🔒</span><span class=\"sources-modal-msg\">Materiály budou zpřístupněny až po začátku bloku.</span>`;
			}
		} else {
			sourcesIcon = `<span class=\"sources-icon modal-lock\" style=\"opacity:1;filter:none;cursor:default;\">🔒</span><span class=\"sources-modal-msg\">Materiály budou zpřístupněny až po začátku bloku.</span>`;
		}
	}
	// Insert icon if needed
	if (sourcesIcon) filesEl.innerHTML += sourcesIcon;

	if (showFilesAndLinks) {
		if (block.files?.length) {
			filesEl.innerHTML += `<strong>Soubory ke stažení:</strong><ul class='list-unstyled file-list'></ul>`;
			const ul = filesEl.querySelector("ul");
			block.files.forEach((f) => {
				const li = document.createElement("li");
				li.innerHTML = `<a href="${f.url}" target="_blank">${f.name}</a>`;
				ul.appendChild(li);
			});
		}
		if (block.links?.length) {
			const linksContainer = document.createElement("div");
			linksContainer.innerHTML = `<strong>Odkazy:</strong><ul class='list-unstyled link-list'></ul>`;
			const ul = linksContainer.querySelector("ul");
			block.links.forEach((l) => {
				const li = document.createElement("li");
				li.innerHTML = `<a href="${l.url}" target="_blank">${l.desc}</a>`;
				ul.appendChild(li);
			});
			filesEl.appendChild(linksContainer);
		}
	}

	// Show the modal
	const blockModal = new bootstrap.Modal($("blockModal"));
	blockModal.show();

	$("blockModal").addEventListener(
		"hidden.bs.modal",
		() => {
			if (tableWasVisible && tableModalInstance) tableModalInstance.show();
		},
		{ once: true }
	);
}
