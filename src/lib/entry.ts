/** Tipo de lançamento. No banco, o enum `EntryKind` (EXPENSE, INCOME). */
export type EntryKind = "expense" | "income";

export const ENTRY_KINDS: readonly EntryKind[] = ["expense", "income"];

export function toDbKind(kind: EntryKind): "EXPENSE" | "INCOME" {
  return kind === "income" ? "INCOME" : "EXPENSE";
}

export function fromDbKind(kind: "EXPENSE" | "INCOME"): EntryKind {
  return kind === "INCOME" ? "income" : "expense";
}

/** Tamanho máximo da descrição de um lançamento ou do nome de um fixo. */
export const DESCRIPTION_MAX_LENGTH = 60;
