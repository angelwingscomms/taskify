import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Server-only token count. Falls back to heuristic if API key/model unavailable.
export const token_count = async (
	t: string
): Promise<number> => {
	if (!t) return 0;
	try {
		if (GEMINI) {
			const ai = new GoogleGenerativeAI(GEMINI);
			const model = ai.getGenerativeModel({
				model: 'gemini-1.5-flash'
			});
			const res = await model.countTokens({
				contents: [
					{ role: 'user', parts: [{ text: t }] }
				]
			});
			return typeof res.totalTokens === 'number'
				? res.totalTokens
				: heuristic(t);
		}
		return heuristic(t);
	} catch {
		return heuristic(t);
	}
};

const heuristic = (s: string): number => {
	// Rough tokenization heuristic similar to GPT-3.5: ~4 chars/token baseline
	const words = s
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
	const chars = s.length;
	return Math.max(
		1,
		Math.round(chars / 4) + Math.round(words * 0.2)
	);
};
