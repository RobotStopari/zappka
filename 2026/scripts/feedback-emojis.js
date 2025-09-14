// Render emoji radio buttons for a given group and emoji set
function renderEmojiRadios(groupId, inputName) {
	const group = document.getElementById(groupId);
	if (!group) return;
	group.innerHTML = "";
	const row = document.createElement("div");
	row.className = "emoji-row mb-2";
	// Choose emoji set based on inputName, from window
	const emojis =
		inputName === "programFeeling"
			? window.FEEDBACK_EMOJIS_PROGRAM
			: window.FEEDBACK_EMOJIS_LECTORS;
	emojis.forEach((emoji, i) => {
		const id = `${inputName}${i + 1}`;
		const input = document.createElement("input");
		input.type = "radio";
		input.className = "btn-check";
		input.name = inputName;
		input.id = id;
		input.value = emoji;
		input.autocomplete = "off";
		const label = document.createElement("label");
		label.className = "btn btn-outline-secondary fs-3";
		label.htmlFor = id;
		label.textContent = emoji;
		row.appendChild(input);
		row.appendChild(label);
	});
	group.appendChild(row);
}
