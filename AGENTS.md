- always use exasearch to check the docs for anything before starting, especially SvelteKit

## Code Style

- always use axios and try/catch for http requests: try {axios.method...} catch (e) {console.error(e.response?.data || e.message)} 
- Naming: snake_case for vars/functions; db payload keys single letters (e.g., i=id, t=tag/text, u=user, d=desc/date, a=age/created, g=gender, l=lat/lon)
- Types: Define in src/lib/types/index.ts; single character fields; export interfaces with comments (e.g., export interface Room { n: string; // room name })
- Styling: Tailwind utilities only; no inline styles/style blocks
- Data Loading: Fetch all in +page.server.ts load; return single-letter keys (e.g., { r: room })
- DB/Qdrant: Single collection 'i'; filter by 's' (type); use scroll/search_by_payload; embeddings via src/lib/util/embed.ts
- Auth: 403 errors for doesn't own resource, 401 for not logged in
- in page.svelte, get page data and current user from page.data.user. expect page.data.user to already have the current user { i, t } and use to check authorization
- server Errors: error(status, message) from @sveltejs/kit or json(..., { status })
- Toasts: src/lib/util/toast.ts
- Security: Always use qdrant.setpayload for edits
- Conciseness: Avoid vars for single-use; code minimally
- Never run npm run dev/build/start unless user explicitly instructs (avoids interfering with local dev server).
- event handlers without have colon e.g `onclick` not `on:click`
- when styling, always look at src/styles/_variables.css. ALWAYS use Tailwind ONLY. DON'T USE STYLEBLOCKS OR INLINE STYLES.
- never run any npm commands unless asked to
- always send data to server in JSON or formdata w/ single character fields
- always use all lowercase for all UI text

# multi variable declaration
```svelte
	let { data } = $props(), post: Post = data.p;
```

# genai

- always use gemini-2.5-flash for all text genai

# page.svelte

- use svelte:window to add event handlers to window, e.g <svelte:window onkeydown>
- always import {page} from '$app/state', cuz Svelte5