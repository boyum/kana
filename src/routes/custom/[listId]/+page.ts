// Load list by ID
export const ssr = false;

export async function load({ params }: { params: { listId: string } }) {
  return {
    listId: params.listId,
  };
}
