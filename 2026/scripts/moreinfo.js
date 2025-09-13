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

	// --- Sources icon logic for modal ---
	const filesEl = $("modalFiles");
	filesEl.innerHTML = "";
	const hasSources =
		(block.files?.length || 0) > 0 || (block.links?.length || 0) > 0;
	let showFilesAndLinks = false;
	let sourcesIcon = "";

	if (hasSources) {
		// Find block date
		let blockDate = null;
		for (const day of scheduleData) {
			if (Array.isArray(day.blocks)) {
				if (day.blocks.includes(block)) {
					blockDate = day.date;
					break;
				}
			}
		}
		if (blockDate && block.start) {
			const now = new Date();
			const blockStart = new Date(`${blockDate}T${block.start}`);
			if (now >= blockStart) {
				showFilesAndLinks = true;
			} else {
				sourcesIcon = `<span class="sources-icon modal-lock" style="opacity:1;filter:none;cursor:default;">🔒</span><span class="sources-modal-msg">Materiály budou zpřístupněny až po začátku bloku.</span>`;
			}
		} else {
			sourcesIcon = `<span class="sources-icon modal-lock" style="opacity:1;filter:none;cursor:default;">🔒</span><span class="sources-modal-msg">Materiály budou zpřístupněny až po začátku bloku.</span>`;
		}
	}

	// Insert icon if needed
	if (sourcesIcon) filesEl.innerHTML = sourcesIcon;

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
