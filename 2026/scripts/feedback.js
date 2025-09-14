// Allow opening modal for a specific block (preselect program)
window.openFeedbackModalForBlock = function (block) {
	// Wait for modal to be loaded
	const show = () => {
		const feedbackModal = document.getElementById("feedbackModal");
		const programSelect = document.getElementById("feedbackProgramSelect");
		if (!feedbackModal || !programSelect) return;
		// Open modal
		if (window.bootstrap) {
			const bsModal = window.bootstrap.Modal.getOrCreateInstance(feedbackModal);
			bsModal.show();
		}
		// Try to preselect the correct option
		const options = Array.from(programSelect.options);
		let found = false;
		for (const opt of options) {
			if (
				opt.textContent &&
				block.title &&
				opt.textContent.startsWith(block.title)
			) {
				programSelect.value = opt.value;
				found = true;
				break;
			}
		}
		if (!found) {
			programSelect.selectedIndex = 0;
		}
		// Trigger change event for validation
		programSelect.dispatchEvent(new Event("change"));
	};
	if (!document.getElementById("feedbackModal")) {
		fetch("components/feedback.html")
			.then((response) => response.text())
			.then((html) => {
				document.body.insertAdjacentHTML("beforeend", html);
				// Dynamically load feedback-emojis.js after feedback.html is inserted
				var emojiScript = document.createElement("script");
				emojiScript.src = "scripts/feedback-emojis.js";
				emojiScript.onload = function () {
					setTimeout(() => {
						if (typeof renderEmojiRadios === "function") {
							renderEmojiRadios("programFeelingGroup", "programFeeling");
							renderEmojiRadios("lectorsFeelingGroup", "lectorsFeeling");
						}
						show();
					}, 0);
				};
				document.body.appendChild(emojiScript);
			});
	} else {
		// Always re-render emoji radios before showing modal
		if (typeof renderEmojiRadios === "function") {
			renderEmojiRadios("programFeelingGroup", "programFeeling");
			renderEmojiRadios("lectorsFeelingGroup", "lectorsFeeling");
		}
		show();
	}
};
// Firebase initialization
const firebaseConfig = {
	apiKey: "AIzaSyCxFc5gOOdM87Sj44oTV9Un2P1c1NklY_I",
	authDomain: "zappka-zapalovac.firebaseapp.com",
	projectId: "zappka-zapalovac",
	storageBucket: "zappka-zapalovac.firebasestorage.app",
	messagingSenderId: "249905974004",
	appId: "1:249905974004:web:57518d5d5b748b8c812ca1",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function () {
	// Only insert feedback modal if not present
	if (!document.getElementById("feedbackModal")) {
		fetch("components/feedback.html")
			.then((response) => response.text())
			.then((html) => {
				document.body.insertAdjacentHTML("beforeend", html);
				// Dynamically load feedback-emojis.js after feedback.html is inserted
				var emojiScript = document.createElement("script");
				emojiScript.src = "scripts/feedback-emojis.js";
				emojiScript.onload = function () {
					if (typeof renderEmojiRadios === "function") {
						renderEmojiRadios("programFeelingGroup", "programFeeling");
						renderEmojiRadios("lectorsFeelingGroup", "lectorsFeeling");
					}
				};
				document.body.appendChild(emojiScript);
				// Load feedback popup CSS
				var popupCss = document.createElement("link");
				popupCss.rel = "stylesheet";
				popupCss.href = "css/feedback-popup.css";
				document.head.appendChild(popupCss);
				// Load feedback popup script, then setup modal
				var popupScript = document.createElement("script");
				popupScript.src = "scripts/feedback-popup.js";
				popupScript.onload = function () {
					setupFeedbackModal();
				};
				document.body.appendChild(popupScript);
			});
	}

	async function setupFeedbackModal() {
		const feedbackBtn = document.getElementById("feedbackBtn");
		const feedbackModal = document.getElementById("feedbackModal");
		const feedbackModalClose = document.getElementById("feedbackModalClose");

		let bsModal = null;
		if (window.bootstrap && feedbackModal) {
			bsModal = new window.bootstrap.Modal(feedbackModal);
		}

		// Populate the select dropdown with schedule data
		populateProgramSelect();

		// Validation for enabling submit button
		const form = document.getElementById("feedbackForm");
		const programSelect = document.getElementById("feedbackProgramSelect");
		const programFeelingRadios = () =>
			form.querySelectorAll('input[name="programFeeling"]');
		const lectorsFeelingRadios = () =>
			form.querySelectorAll('input[name="lectorsFeeling"]');
		const submitBtn = form.querySelector('button[type="submit"]');

		// Handle form submission to Firestore
		form.addEventListener("submit", async function (e) {
			e.preventDefault();
			// Get selected option's label for program+lectors
			let programLabel = "";
			if (programSelect && programSelect.selectedIndex > 0) {
				const selectedOption = programSelect.options[programSelect.selectedIndex];
				programLabel = selectedOption.textContent;
			}
			const data = {
				"1: K programu": programLabel,
				"2: Pocit z programu": form.programFeeling.value,
				"6: Pocit z lektorujících": form.lectorsFeeling.value,
				"3: Co pro mě bylo přínosné?": form.useful.value,
				"4: Co mě na programu zaujalo?": form.interesting.value,
				"5: Co mi na programu chybělo?": form.missing.value,
				"7: Lektorujícím chci doporučit": form.lectorsRecommend.value,
				"8: Lektorující chci pochválit za": form.lectorsPraise.value,
				"9: Podpis": form.signature.value,
				Vytvořeno: new Date().toISOString(),
			};
			try {
				await db
					.collection("ZV_Zappka_" + String(window.CURRENT_YEAR || CURRENT_YEAR))
					.add(data);
				if (window.showFeedbackPopup) {
					window.showFeedbackPopup("Děkujeme za zpětnou vazbu!", false);
				}
				form.reset();
				// Reset dropdown to placeholder
				if (programSelect) {
					programSelect.selectedIndex = 0;
				}
				// Optionally close modal if desired
				if (bsModal) bsModal.hide();
			} catch (err) {
				if (window.showFeedbackPopup) {
					window.showFeedbackPopup("Chyba při odesílání: " + err.message, true);
				}
			}
		});

		if (feedbackBtn && bsModal) {
			feedbackBtn.addEventListener("click", () => {
				bsModal.show();
			});
		}

		if (feedbackModalClose && bsModal) {
			feedbackModalClose.addEventListener("click", () => {
				bsModal.hide();
			});
		}

		function validateForm() {
			const programSelected =
				programSelect && programSelect.value && programSelect.value !== "";
			const programFeelingSelected = Array.from(programFeelingRadios()).some(
				(r) => r.checked
			);
			const lectorsFeelingSelected = Array.from(lectorsFeelingRadios()).some(
				(r) => r.checked
			);
			if (programSelected && programFeelingSelected && lectorsFeelingSelected) {
				submitBtn.disabled = false;
				submitBtn.classList.remove("disabled");
			} else {
				submitBtn.disabled = true;
				submitBtn.classList.add("disabled");
			}
		}

		// Initial state
		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.classList.add("disabled");
		}

		// Listen for changes
		if (programSelect) programSelect.addEventListener("change", validateForm);
		form.addEventListener("change", validateForm);
	}

	async function populateProgramSelect() {
		const select = document.getElementById("feedbackProgramSelect");
		if (!select) return;

		try {
			const response = await fetch("schedule.json");
			const schedule = await response.json();

			const now = new Date();
			const blocks = [];

			// Flatten and filter blocks
			schedule.forEach((day) => {
				const date = day.date;
				(day.blocks || []).forEach((block) => {
					if (["program", "ostatní"].includes(block.type)) {
						// Only past or started
						const startDateTime = new Date(date + "T" + block.start);
						if (startDateTime <= now) {
							blocks.push({
								date,
								start: block.start,
								title: block.title,
								lectors: block.lectors,
							});
						}
					}
				});
			});

			// Sort by date and time
			blocks.sort((a, b) => {
				const d1 = new Date(a.date + "T" + a.start);
				const d2 = new Date(b.date + "T" + b.start);
				return d1 - d2;
			});

			// Deduplicate by title+lectors
			const seen = new Set();
			const uniqueBlocks = [];
			blocks.forEach((block) => {
				const lectorsStr = (block.lectors || []).map((l) => l.name).join(",");
				const key = block.title + "|" + lectorsStr;
				if (!seen.has(key)) {
					seen.add(key);
					uniqueBlocks.push(block);
				}
			});

			// Clear and add options
			select.innerHTML = "";
			// Add placeholder option
			const placeholderOption = document.createElement("option");
			placeholderOption.value = "";
			placeholderOption.textContent = "Vyber, k čemu chceš ZV dát...";
			placeholderOption.disabled = true;
			placeholderOption.selected = true;
			select.appendChild(placeholderOption);

			uniqueBlocks.forEach((block) => {
				const lectors = (block.lectors || []).map((l) => l.name).join(", ");
				const label = `${block.title}${lectors ? " — " + lectors : ""}`;
				const option = document.createElement("option");
				option.value = block.title + "|" + block.date + "|" + block.start;
				option.textContent = label;
				select.appendChild(option);
			});

			// Add "Jiné" at the bottom
			const otherOption = document.createElement("option");
			otherOption.value = "other";
			otherOption.textContent = "Jiné";
			select.appendChild(otherOption);

			// If nothing to select, show disabled
			if (uniqueBlocks.length === 0) {
				select.innerHTML = "";
				const emptyOption = document.createElement("option");
				emptyOption.value = "";
				emptyOption.textContent = "Žádné bloky k výběru";
				emptyOption.disabled = true;
				emptyOption.selected = true;
				select.appendChild(emptyOption);
			}
		} catch (e) {
			select.innerHTML =
				'<option value="" disabled selected>Chyba načítání</option>';
		}
	}
});
