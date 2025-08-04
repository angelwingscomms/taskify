export async function embed(input: string): Promise<number[]> {
  const response = await fetch('https://fastembedserver.shuttleapp.rs/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  return response.json();
}