// Custom popup for feedback success/error
// Usage: showFeedbackPopup(message, isError)
(function () {
	if (document.getElementById("feedbackPopup")) return;
	const popup = document.createElement("div");
	popup.id = "feedbackPopup";
	popup.innerHTML = `
		<div class="feedback-popup-content">
			<span id="feedbackPopupMessage"></span>
			<button id="feedbackPopupClose" aria-label="Zavřít">&times;</button>
		</div>
	`;
	popup.style.display = "none";
	document.body.appendChild(popup);

	window.showFeedbackPopup = function (message, isError) {
		const el = document.getElementById("feedbackPopup");
		const msg = document.getElementById("feedbackPopupMessage");
		const close = document.getElementById("feedbackPopupClose");
		if (!el || !msg || !close) return;
		msg.textContent = message;
		el.className = isError ? "feedback-popup error" : "feedback-popup success";
		el.style.display = "block";
		// Handler for close button
		close.onclick = function () {
			el.style.display = "none";
			document.removeEventListener("mousedown", outsideClickHandler, true);
		};
		// Handler for outside click
		function outsideClickHandler(e) {
			if (!el.contains(e.target)) {
				el.style.display = "none";
				document.removeEventListener("mousedown", outsideClickHandler, true);
			}
		}
		setTimeout(() => {
			el.style.display = "none";
			document.removeEventListener("mousedown", outsideClickHandler, true);
		}, 3500);
		// Add outside click listener
		setTimeout(() => {
			document.addEventListener("mousedown", outsideClickHandler, true);
		}, 0);
	};
})();
