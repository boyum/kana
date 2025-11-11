import { getExampleLists } from "$lib/utils/db-storage";

export async function load() {
  const exampleLists = await getExampleLists();

  return {
    exampleLists,
  };
}
