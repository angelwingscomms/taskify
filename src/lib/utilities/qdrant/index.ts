import { QDRANT_KEY, QDRANT_URL } from '$env/static/private';
import { QdrantClient } from '@qdrant/js-client-rest';

// Connect to Qdrant Cloud
export const client = new QdrantClient({
	url: QDRANT_URL,
	apiKey: QDRANT_KEY
});
