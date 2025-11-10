export function addIndexToName(names: string[], name: string): string {
  let newName = undefined;

  const [, existingNameWithoutIndex, existingIndexString] =
    name.match(/^(.+?) \((\d+)\)$/) ?? [];
  const existingIndex = existingIndexString
    ? Number.parseInt(existingIndexString)
    : null;

  const baseName = existingNameWithoutIndex ?? name;
  let index = existingIndex != null ? existingIndex + 1 : 0;

  do {
    index += 1;

    const n = baseName + (index > 1 ? ` (${index})` : "");
    if (!names.includes(n)) {
      newName = n;
    }
  } while (!newName);

  return newName;
}
