import { get, edit_point } from '$lib/db';
import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateColorPalette(
	user_i: string,
	desc?: string
): Promise<string[]> {
	const user = await get<{ d?: string }>(user_i, 'd');
	const effectiveDesc =
		desc ||
		user?.d ||
		'a dreamy purple/lavender/pink/lilac color palette';
	const genAI = new GoogleGenerativeAI(GEMINI);
	const model = genAI.getGenerativeModel({
		model: 'gemini-2.5-flash'
	});

	const prompt = `Generate 5 distinct 6-digit hex color codes (without #) inspired by this description: ${effectiveDesc}. Return ONLY the hex codes, without hashes, as a JSON array, wrapped in \`\`\`json\n...\n\`\`\`.\n e.g. \`\`\`json\n["000000", "333333", "666666", "999999", "cccccc"]\n\`\`\``;

	const result = await model.generateContent(prompt);

	const response = await result.response;
	const text = response.text().trim();
	const jsonMatch = text.match(
		new RegExp('```json\\n([\\s\\S]*?)\\n```')
	);
	let colors: string[];
	if (jsonMatch && jsonMatch[1]) {
		try {
			colors = JSON.parse(jsonMatch[1]);
		} catch (e) {
			console.error('JSON parsing error:', e);
			throw new Error(
				'Failed to parse color palette: Invalid JSON structure'
			);
		}
	} else {
		// Fallback for cases where the model doesn't wrap in ```json
		try {
			colors = JSON.parse(text);
		} catch (e) {
			console.error(
				'Fallback JSON parsing error:',
				e
			);
			throw new Error(
				'Failed to parse color palette: No JSON found or invalid format'
			);
		}
	}

	// Validate and normalize
	colors = colors.slice(0, 5).map((c) => {
		c = (c || '').replace('#', '').toLowerCase();
		if (!/^([0-9a-f]{6})$/.test(c)) {
			throw new Error('Invalid hex color generated');
		}
		return c;
	});

	while (colors.length < 5) {
		colors.push('000000');
	}

	return colors;
}

export async function get_user_colors(
	user_i: string
): Promise<string[]> {
	const user = await get<{ c?: string[] }>(
		user_i,
		'c'
	);
	if (
		user?.c &&
		Array.isArray(user.c) &&
		user.c.length === 5
	) {
		return user.c;
	}
	const colors = await generateColorPalette(user_i);
	await edit_point(user_i, { c: colors });
	return colors;
}
