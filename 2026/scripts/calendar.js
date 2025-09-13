// Generates and downloads an .ics calendar file from the schedule
import { scheduleData } from "./schedule.js";

function pad(n) {
	return n < 10 ? "0" + n : n;
}

function formatDateTime(date, time) {
	// date: YYYY-MM-DD, time: HH:MM
	return date.replace(/-/g, "") + "T" + time.replace(":", "") + "00";
}

function escapeICS(text) {
	return (text || "")
		.replace(/\n/g, "\\n")
		.replace(/,/g, "\\,") // no extra space after comma
		.replace(/;/g, "\\;");
}

export function generateICSFromSchedule(schedule) {
	let ics = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Zappka//CZ//NONSGML v1.0//EN",
	];

	schedule.forEach((day) => {
		(day.blocks || []).forEach((block) => {
			if (block.type === "teploměr") return; // skip teploměr blocks
			const start = formatDateTime(day.date, block.start);
			const end = formatDateTime(day.date, block.end || block.start);
			let desc = "";
			if (block.tema && block.tema.trim()) desc += `Téma: ${block.tema}\n`;
			if (block.lectors && block.lectors.length) {
				desc += `Lektoruje: ${block.lectors.map((l) => l.name).join(", ")}\n`;
			}
			if (block.description && block.description.trim())
				desc += `\n${block.description}`;

			ics.push(
				"BEGIN:VEVENT",
				`SUMMARY:${escapeICS(block.title)}`,
				`DTSTART;TZID=Europe/Prague:${start}`,
				`DTEND;TZID=Europe/Prague:${end}`,
				`DESCRIPTION:${escapeICS(desc)}`,
				"END:VEVENT"
			);
		});
	});
	ics.push("END:VCALENDAR");
	return ics.join("\r\n");
}

export function downloadICSFile(icsString, filename = "zappka-programy.ics") {
	const blob = new Blob([icsString], { type: "text/calendar" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
