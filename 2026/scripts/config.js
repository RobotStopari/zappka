// Emoji arrays for feedback fields (attached to window for global access)
window.FEEDBACK_EMOJIS_PROGRAM = [
	"❤️",
	"😍",
	"😄",
	"😊",
	"😐",
	"😕",
	"😢",
	"😡",
	"🥱",
	"🤯",
	"⁉️",
];
window.FEEDBACK_EMOJIS_LECTORS = [
	"❤️",
	"😄",
	"🥰",
	"🤗",
	"😐",
	"😕",
	"😢",
	"😡",
	"🥱",
	"❓",
];
// Feedback icon and tooltip config
export const FEEDBACK_ICON = {
	icon: "📝",
	tooltip: "Dát k programu zpětnou vazbu",
};
// Current year for dynamic heading
export const CURRENT_YEAR = 2026;

// Block type styles
export const blockTypeStyles = {
	program: { color: "#0d6efd", icon: "📒" },
	jídlo: { color: "#28a745", icon: "🍽️" },
	"zpětná vazba": { color: "#ffc107", icon: "📝" },
	teploměr: { color: "#fd7e14", icon: "🌡️" },
	ostatní: { color: "#6c757d", icon: "⚪" },
};

// Material icons for sources
export const MATERIAL_ICONS = {
	unlocked: "👁️",
	locked: "🔒",
	none: "📁",
};

// Texts
export const TEXTS = {
	pause: "☕ Pauza",
	moreInfo: "ℹ️ Podrobnosti",
	infoIconDescription: "Podrobnosti k programu",
	sources: {
		unlocked: "Materiály jsou nyní dostupné.",
		locked: "Materiály budou zpřístupněny až po začátku bloku.",
		none: "Žádné materiály nejsou k tomuto bloku k dispozici.",
	},
};

// Date/locale settings
export const LOCALE = "cs-CZ";
