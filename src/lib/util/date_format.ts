import { SvelteDate } from 'svelte/reactivity';
export const date_format = (date: number) => {
	const now = new Date(); // Current date for comparison
	const inputDate = new Date(date); // The date to format

	// Normalize to midnight for accurate day comparison for "Today" and "Yesterday"
	const todayMidnight = new SvelteDate(now);
	todayMidnight.setHours(0, 0, 0, 0);
	const inputDateMidnight = new SvelteDate(inputDate);
	inputDateMidnight.setHours(0, 0, 0, 0);

	const diffTime = inputDateMidnight.getTime() - todayMidnight.getTime();
	const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return 'Today';
	} else if (diffDays === -1) {
		return 'Yesterday';
	} else {
		const dateParts = [];

		// Always include the weekday
		dateParts.push(inputDate.toLocaleDateString(undefined, { weekday: 'long' }));

		// Check if month and day need to be displayed (if month is different or year is different)
		const isSameMonth = inputDate.getMonth() === now.getMonth();
		const isSameYear = inputDate.getFullYear() === now.getFullYear();

		if (!isSameMonth || !isSameYear) {
			dateParts.push(inputDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }));
		}

		// Check if year needs to be displayed (if year is different)
		if (!isSameYear) {
			dateParts.push(inputDate.toLocaleDateString(undefined, { year: 'numeric' }));
		}

		// Combine the date parts
		const formattedDate = dateParts.join(', ');

		// Get the time in 24-hour format (HH:mm)
		const formattedTime = inputDate.toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit',
			hourCycle: 'h23' // For 24-hour format
		});

		return `${formattedDate} ${formattedTime}`;
	}
};
