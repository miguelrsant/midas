/** Situação em que o Midas não calcula (data fora das tabelas, dados impossíveis). */
export class LaborInputError extends Error {
  override name = "LaborInputError";
}
