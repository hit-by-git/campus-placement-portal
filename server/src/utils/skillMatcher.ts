/** Matches skill dictionary names against free text (word-boundary aware, case-insensitive). */
export const matchSkillsInText = (text: string, candidateSkillNames: string[]): string[] => {
  const normalizedText = text.toLowerCase();
  return candidateSkillNames.filter((name) => {
    const escaped = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i");
    return pattern.test(normalizedText) || normalizedText.includes(escaped);
  });
};
