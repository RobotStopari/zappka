import { blockTypeStyles, MATERIAL_ICONS, FEEDBACK_ICON } from "./config.js";

window.showLegend = function () {
	const legendContent = document.getElementById("legendContent");
	if (!legendContent) return;
	import("./config.js").then(({ TEXTS }) => {
		legendContent.innerHTML = `
			<div style="display: flex; flex-direction: column; gap: 2.2em;">
				<section>
					<div style="font-size: 1.13em; font-weight: 600; margin-bottom: 0.7em; color: #1976d2; display: flex; align-items: center; gap: 0.5em;">
						<i class="bi bi-grid-3x3-gap" style="font-size:1.3em;"></i> Typy bloků
					</div>
					<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1.2em 2.2em; width: 100%;">
    ${Object.entries(blockTypeStyles)
					.map(
						([type, { color, icon }]) => `
				<div style="flex: 1 1 250px; max-width: 70%; min-width: 100px; display: flex; flex-direction: column; align-items: center;">
                    <div style="background: ${color}; border-radius: 1em; box-shadow: 0 2px 10px rgba(0,0,0,0.10); padding: 0.7em 1.3em 0.6em 1.3em; min-width: 100px; min-height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1.5px solid #e0e0e0; width: 100%; color: #fff;">
                        <span style="font-size: 1.6em; color: #fff;">${icon}</span>
                        <span style="font-size: 1em; font-weight: 600; color: #fff; margin-top: 0.18em;">${
																									type.charAt(0).toUpperCase() + type.slice(1)
																								}</span>
                    </div>
                </div>
            `
					)
					.join("")}
</div>
				</section>
				<section>
					<div style="font-size: 1.13em; font-weight: 600; margin-bottom: 0.7em; color: #1976d2; display: flex; align-items: center; gap: 0.5em;">
						<i class="bi bi-info-circle" style="font-size:1.3em;"></i> Význam ikonek
					</div>
					<ul style="margin-bottom: 0; padding-left: 1.1em; list-style: disc; color: #222;">
					<div style="margin-bottom: 0; padding-left: 0; color: #222; display: flex; flex-direction: column; gap: 0.4em; width: 100%; align-items: flex-start; margin-left: -1.3em;">
						<div><span style="font-size:1.2em; vertical-align:middle;">${
							MATERIAL_ICONS.unlocked
						}</span> <span>${TEXTS.sources.unlocked}</span></div>
						<div><span style="font-size:1.2em; vertical-align:middle;">${
							MATERIAL_ICONS.locked
						}</span> <span>${TEXTS.sources.locked}</span></div>
						<div><span style="font-size:1.2em; vertical-align:middle;">${
							MATERIAL_ICONS.none
						}</span> <span>${TEXTS.sources.none}</span></div>
						<div><span style="font-size:1.2em; vertical-align:middle;">ℹ️</span> <span>${
							TEXTS.infoIconDescription
						}</span></div>
						<div><span style="font-size:1.2em; vertical-align:middle;">${
							FEEDBACK_ICON.icon
						}</span> <span>${FEEDBACK_ICON.tooltip}</span></div>
					</div>
				</section>
				<section>
					<div style="font-size: 1.13em; font-weight: 600; margin-bottom: 0.7em; color: #1976d2; display: flex; align-items: center; gap: 0.5em;">
						<i class="bi bi-menu-button-wide" style="font-size:1.3em;"></i> Hlavní tlačítka
					</div>
					<ul style="margin-bottom: 0; padding-left: 0; list-style: none; color: #222; width: 100%; display: flex; flex-direction: column; align-items: center;">
  <li style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.3em; margin-bottom: 1em;">
    <span class="btn btn-nav btn-history-toggle" style="pointer-events: none; min-width: 90px; font-size: 0.95em; padding: 0.3em 0.8em; box-shadow: none; cursor: default; opacity: 1; margin-bottom: 0.1em;">
      <i class="bi bi-clock-history"></i>
      <span>Historie</span>
    </span>
    <span style="text-align: center; font-size: 0.97em;">Zobrazí na hlavní stránce programy, které již proběhly.</span>
  </li>
  <li style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.3em; margin-bottom: 1em;">
    <span class="btn btn-nav btn-primary" style="pointer-events: none; min-width: 90px; font-size: 0.95em; padding: 0.3em 0.8em; box-shadow: none; cursor: default; opacity: 1; margin-bottom: 0.1em;">
      <i class="bi bi-journal-text"></i>
      <span>Programy</span>
    </span>
    <span style="text-align: center; font-size: 0.97em;">Zobrazí přehled všech programů na kurzu.</span>
  </li>
  <li style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.3em; margin-bottom: 1em;">
    <span class="btn btn-nav btn-materials" style="pointer-events: none; min-width: 90px; font-size: 0.95em; padding: 0.3em 0.8em; box-shadow: none; cursor: default; opacity: 1; margin-bottom: 0.1em;">
      <i class="bi bi-folder2-open"></i>
      <span>Materiály</span>
    </span>
    <span style="text-align: center; font-size: 0.97em;">Zobrazí kompletní seznam všech souborů a odkazů ze všech programů.</span>
  </li>
  <li style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.3em; margin-bottom: 1em;">
    <span class="btn btn-nav btn-lector" style="pointer-events: none; min-width: 90px; font-size: 0.95em; padding: 0.3em 0.8em; box-shadow: none; cursor: default; opacity: 1; margin-bottom: 0.1em;">
      <i class="bi bi-mortarboard"></i>
      <span>Lektorstvo</span>
    </span>
    <span style="text-align: center; font-size: 0.97em;">Zobrazí seznam všech lektorů a programů, jež mají na starosti.</span>
  </li>
  <li style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.3em; margin-bottom: 1em;">
    <span class="btn btn-nav btn-feedback" style="pointer-events: none; min-width: 90px; font-size: 0.95em; padding: 0.3em 0.8em; box-shadow: none; cursor: default; opacity: 1; margin-bottom: 0.1em;">
      <i class="bi bi-chat-dots"></i>
      <span>Zpětná&nbsp;vazba</span>
    </span>
    <span style="text-align: center; font-size: 0.97em;">Zobrazí formulář pro odeslání zpětné vazby.</span>
  </li>
</ul>

<h4 style="margin-top: 2.2em; margin-bottom: 0.7em; text-align: left; font-size: 1.18em; font-weight: 600; letter-spacing: 0.01em; color: #1976d2; display: flex; align-items: center; gap: 0.5em;">
  <i class="bi bi-lightbulb" style="font-size: 1.15em; color: #1976d2;"></i>
  Tipy a triky
</h4>
<ul style="margin: 0 auto 1.2em auto; padding-left: 1.2em; max-width: 600px; font-size: 1.01em; color: #222; text-align: left;">
  <li>Zpětnou vazbu můžete poskytnout přímo k danému bloku v historii nebo v seznamu všech programů po kliknutí na příslušnou ikonu.</li>
  <li>Celý harmonogram si můžete stáhnout do svého kalendáře pomocí tlačítka v menu.</li>
  <li>Při kliknutí na jméno lektora u bloku zobrazíte pouze programy daného lektora.</li>
</ul>
			</div>
			`;
		const legendModal = new bootstrap.Modal(
			document.getElementById("legendModal")
		);
		legendModal.show();
	});
	const legendModal = new bootstrap.Modal(
		document.getElementById("legendModal")
	);
	legendModal.show();
};

// Attach event after nav and modals are loaded
document.addEventListener("DOMContentLoaded", () => {
	const tryAttach = () => {
		const btn = document.getElementById("legendBtn");
		if (btn) {
			btn.addEventListener("click", window.showLegend);
		} else {
			setTimeout(tryAttach, 200);
		}
	};
	tryAttach();
});
