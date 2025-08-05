Let your speech always be short and consice, focusing more on the code edits.

start every task by creating a telegraphic speech list that details the task into many small micro-tasks, then do each micro-task.

- all db data stored in single Qdrant collection `'i'`, `s` payload field isolates data types (e.g., 'u` for user id).
- always use single/double letter field names for db (`t` user tag, `u` user id, `s` tenant id)
- always use `snake_case` for variable/function names
- define all types in `src/lib/types`.
- always get all data for a page in load function in page.server.ts

- always use in src/lib/db/index.ts for db ops
- always use api routes to get data from client to server, e.g routes/search/+server.ts
- always use src/lib/toast.ts for toast notifs

- in server files(e.g endpoint or page load), use error from '@sveltejs/kit': throw error(404, 'Resource not found')
- get logged in user on server from locals.user
- always write 100% coverage unit and e2e tests for all features implemented. always unit tests all features after adding
- always Cover "happy path", error scenarios/edge cases for testing.
- always include `s` field in db search queries for correct data type.
- always do sensitive ops server side
- always validate input client-side and server-side
- always provide user-friendly errors
- always use Typescript
- always use Svelte5 syntax - runes, onclick instead of on:click, and all such things
- always use embed src/lib/embed.ts for embedding text
