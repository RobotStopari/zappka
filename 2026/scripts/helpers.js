// Helper functions for repeated code in scripts

export const renderLectors = (lectors = []) =>
	lectors.length
		? lectors
				.map(
					({ color, name }) =>
						`<span class="badge me-1 lector-block-name-tilt" style="background:${color}; cursor:pointer" onclick="showLectors(false, '${name}')">${name}</span>`
				)
				.join(" ")
		: "";

export const formatDuration = (minutes) => {
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins ? `${hours} h ${mins} min` : `${hours} h`;
};
