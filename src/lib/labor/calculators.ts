import {
  addDays,
  type DateOnly,
  formatDayMonth,
  lastDay as lastDayOfMonth,
  makeDate,
  monthOf,
  parseDate,
} from "@/lib/dates";
import { formatWholeMoney, MAX_CENTS, mulDivRound } from "@/lib/money";

import { LaborInputError } from "./errors";
import { inssFor } from "./inss";
import { irrfFor } from "./irrf";
import { fullMonths, fullYears, thirteenthMonths, vacationMonths } from "./periods";
import type {
  NetSalaryInput,
  TerminationInput,
  ThirteenthInput,
  UnemploymentInput,
  VacationInput,
} from "./schemas";
import { pickTable } from "./tables/select";
import { UNEMPLOYMENT_TABLES } from "./tables/unemployment";
import type { LaborResult, PlannedPayment, ResultLine } from "./types";

/**
 * Calculadoras trabalhistas. Módulos puros: recebem as respostas já validadas
 * (./schemas.ts) e devolvem cada verba com sinal, as rendas previstas e avisos.
 * Tudo em centavos inteiros, com arredondamento meio para cima em cada verba.
 * O resultado é sempre uma estimativa.
 */

const yearOf = (d: DateOnly) => parseDate(d).year;

function guard(result: LaborResult): LaborResult {
  for (const p of result.payments) {
    if (!Number.isSafeInteger(p.cents) || p.cents > MAX_CENTS) {
      throw new LaborInputError("Esse valor parece alto demais. Confira os números.");
    }
  }
  return result;
}

const plus = (label: string, cents: number, note?: string): ResultLine => ({
  label,
  cents,
  sign: "+",
  note,
});
const minus = (label: string, cents: number, note?: string): ResultLine => ({
  label,
  cents,
  sign: "-",
  note,
});
const total = (label: string, cents: number): ResultLine => ({ label, cents, sign: "=" });

function taxNote(reduction: number): string | undefined {
  return reduction > 0 ? "Com a redução do Imposto de Renda de 2026." : undefined;
}

// ——— Férias (CLT, arts. 129 a 145) ———

export function calculateVacation(input: VacationInput): LaborResult {
  const base = input.grossCents + input.extrasCents;
  const vacation = mulDivRound(base, input.days, 30);
  const third = mulDivRound(vacation, 1, 3);
  const bonus = input.sellTen ? mulDivRound(base, 10, 30) : 0;
  const bonusThird = mulDivRound(bonus, 1, 3);
  // Pagamento até 2 dias antes do início (art. 145).
  const payDate = addDays(input.startDate, -2);
  const inss = inssFor(vacation + third, input.startDate);
  const irrf = irrfFor({
    grossCents: vacation + third,
    inssCents: inss.cents,
    dependents: input.dependents,
    paidOn: payDate,
  });
  const net = vacation + third + bonus + bonusThird - inss.cents - irrf.cents;

  const lines: ResultLine[] = [
    plus(`Férias (${input.days} dias)`, vacation),
    plus("Um terço a mais", third),
  ];
  if (input.sellTen) {
    lines.push(plus("Venda de 10 dias", bonus, "Sem desconto de INSS nem de Imposto de Renda."));
    lines.push(plus("Um terço da venda", bonusThird));
  }
  lines.push(minus("INSS", inss.cents));
  lines.push(minus("Imposto de Renda", irrf.cents, taxNote(irrf.reductionCents)));
  lines.push(total("Você recebe", net));

  return guard({
    headlineCents: net,
    headlineNote: `até ${formatDayMonth(payDate)}`,
    sections: [{ title: "De onde vem esse valor", lines }],
    payments: [{ labelKey: "ferias", categoryId: "ferias", cents: net, dueDate: payDate }],
    notes: [
      "O salário do mês das férias vem menor, porque parte dele foi paga adiantada.",
      "O INSS das férias foi calculado como se fosse um mês sozinho; na folha ele se junta ao salário do mês.",
    ],
    tableYear: yearOf(inss.table.validFrom),
    outdated: inss.outdated || irrf.outdated,
  });
}

// ——— 13º salário (Lei 4.090/1962; Lei 4.749/1965) ———

export function calculateThirteenth(input: ThirteenthInput): LaborResult {
  const base = input.grossCents + input.extrasCents;
  const yearStart = makeDate(input.year, 1, 1);
  const yearEnd = makeDate(input.year, 12, 31);
  if (input.admissionDate > yearEnd) {
    throw new LaborInputError(`Quem entrou depois de ${input.year} não tem 13º desse ano.`);
  }
  const start = input.admissionDate > yearStart ? input.admissionDate : yearStart;
  const months = thirteenthMonths(input.year, start, yearEnd);
  if (months === 0) {
    throw new LaborInputError("Com menos de 15 dias de trabalho no ano, ainda não há 13º.");
  }
  const whole = mulDivRound(base, months, 12);
  // 1ª parcela: metade, sem descontos, até 30 de novembro (Lei 4.749/1965, art. 2º).
  const first = mulDivRound(whole, 1, 2);
  const firstDate = makeDate(input.year, 11, 30);
  // 2ª parcela até 20 de dezembro (art. 1º), com INSS e IR sobre o 13º inteiro.
  const secondDate = makeDate(input.year, 12, 20);
  const inss = inssFor(whole, makeDate(input.year, 12, 1));
  const irrf = irrfFor({
    grossCents: whole,
    inssCents: inss.cents,
    dependents: input.dependents,
    paidOn: secondDate,
    exclusive: true,
  });
  const second = whole - first - inss.cents - irrf.cents;

  return guard({
    headlineCents: first + second,
    headlineNote: "em duas parcelas",
    sections: [
      {
        title: "1ª parcela, até 30 de novembro",
        lines: [
          plus(`Metade do 13º (${months} de 12 meses)`, first, "Sem descontos."),
          total("Você recebe", first),
        ],
      },
      {
        title: "2ª parcela, até 20 de dezembro",
        lines: [
          plus(`13º integral (${months} de 12 meses)`, whole),
          minus("1ª parcela já paga", first),
          minus("INSS do 13º", inss.cents),
          minus("Imposto de Renda do 13º", irrf.cents, taxNote(irrf.reductionCents)),
          total("Você recebe", second),
        ],
      },
    ],
    payments: [
      {
        labelKey: "decimo-terceiro-1",
        categoryId: "decimo-terceiro",
        cents: first,
        dueDate: firstDate,
      },
      {
        labelKey: "decimo-terceiro-2",
        categoryId: "decimo-terceiro",
        cents: second,
        dueDate: secondDate,
      },
    ],
    notes: [
      "Faltas e afastamentos não entram na conta: cada mês com 15 dias ou mais de trabalho vale 1/12.",
    ],
    tableYear: yearOf(inss.table.validFrom),
    outdated: inss.outdated || irrf.outdated,
  });
}

// ——— Rescisão ———

/** Dias de aviso prévio: 30 + 3 por ano completo, até 90 (Lei 12.506/2011). */
export function noticeDays(admission: DateOnly, date: DateOnly): number {
  return Math.min(90, 30 + 3 * fullYears(admission, date));
}

export function calculateTermination(input: TerminationInput): LaborResult {
  const base = input.grossCents + input.extrasCents;
  const { type } = input;
  const notes: string[] = [];
  const employerNotice = type === "without_cause" || type === "agreement";

  // Saldo de salário: dias trabalhados no mês da saída; mês completo = salário cheio.
  const isLastDayOfMonth = input.lastDay === lastDayOfMonth(monthOf(input.lastDay));
  const workedDays = isLastDayOfMonth ? 30 : Math.min(30, parseDate(input.lastDay).day);
  const balance = isLastDayOfMonth ? base : mulDivRound(base, workedDays, 30);

  // Aviso prévio pago em dinheiro (indenizado).
  let paidNoticeDays = 0;
  if (employerNotice) {
    const days = noticeDays(input.admissionDate, input.lastDay);
    if (input.notice === "paid")
      paidNoticeDays = type === "agreement" ? Math.floor(days / 2) : days;
    // Trabalhado: até 30 dias de trabalho; os dias a mais do aviso proporcional são pagos.
    if (input.notice === "worked" && type === "without_cause") paidNoticeDays = days - 30;
  }
  const paidNotice = mulDivRound(base, paidNoticeDays, 30);
  // O aviso pago projeta o fim do contrato para contar 13º e férias (CLT, art. 487, § 1º).
  const projectedEnd = addDays(input.lastDay, paidNoticeDays);

  // Desconto do aviso não cumprido no pedido de demissão (CLT, art. 487, § 2º).
  const noticeDiscount = type === "resignation" && input.notice === "not_served" ? base : 0;

  // 13º proporcional (não é devido na justa causa).
  let thirteenth = 0;
  let thirteenthMonthsCount = 0;
  let firstInstallmentPaid = 0;
  if (type !== "with_cause") {
    const year = yearOf(projectedEnd);
    const start =
      input.admissionDate > makeDate(year, 1, 1) ? input.admissionDate : makeDate(year, 1, 1);
    thirteenthMonthsCount = thirteenthMonths(year, start, projectedEnd);
    thirteenth = mulDivRound(base, thirteenthMonthsCount, 12);
    if (input.lastDay > makeDate(year, 11, 30) && yearOf(input.lastDay) === year) {
      firstInstallmentPaid = mulDivRound(thirteenth, 1, 2);
      notes.push("Consideramos que a 1ª parcela do 13º já foi paga até 30 de novembro.");
    }
  }

  // Férias vencidas + 1/3 (todas as saídas); com 2 períodos, o mais antigo em dobro (art. 137).
  const onePeriod = base + mulDivRound(base, 1, 3);
  const overdue =
    input.overdueVacations === 0
      ? 0
      : input.overdueVacations === 1
        ? onePeriod
        : onePeriod + 2 * onePeriod;
  if (input.overdueVacations === 2) {
    notes.push("Com dois períodos vencidos, o mais antigo passou do prazo e é pago em dobro.");
  }

  // Férias proporcionais + 1/3 (Súmula 261 do TST; não na justa causa, Súmula 171).
  let proportionalMonths = 0;
  let proportional = 0;
  if (type !== "with_cause") {
    proportionalMonths = vacationMonths(input.admissionDate, projectedEnd);
    const value = mulDivRound(base, proportionalMonths, 12);
    proportional = value + mulDivRound(value, 1, 3);
  }

  // Impostos. Saldo de salário: INSS e IR do mês. 13º: cálculo à parte.
  // Isentos: aviso pago, férias indenizadas + 1/3, multa do FGTS.
  const payDate = addDays(input.lastDay, 10); // CLT, art. 477, § 6º
  const inssBalance = inssFor(balance, input.lastDay);
  const irrfBalance = irrfFor({
    grossCents: balance,
    inssCents: inssBalance.cents,
    dependents: input.dependents,
    paidOn: payDate,
  });
  const inss13 = thirteenth > 0 ? inssFor(thirteenth, input.lastDay).cents : 0;
  const irrf13 =
    thirteenth > 0
      ? irrfFor({
          grossCents: thirteenth,
          inssCents: inss13,
          dependents: input.dependents,
          paidOn: payDate,
          exclusive: true,
        }).cents
      : 0;

  const gross = balance + paidNotice + thirteenth + overdue + proportional;
  const deductions =
    inssBalance.cents + irrfBalance.cents + inss13 + irrf13 + firstInstallmentPaid + noticeDiscount;
  let employerNet = gross - deductions;
  if (employerNet < 0) {
    notes.push(
      "O desconto do aviso não cumprido ficou maior que as verbas; a conta não fica negativa.",
    );
    employerNet = 0;
  }

  const employerLines: ResultLine[] = [plus(`Saldo de salário (${workedDays} dias)`, balance)];
  if (paidNotice > 0) {
    employerLines.push(
      plus(
        `Aviso prévio pago (${paidNoticeDays} dias)`,
        paidNotice,
        "Sem desconto de INSS nem de Imposto de Renda.",
      ),
    );
  }
  if (type !== "with_cause") {
    employerLines.push(plus(`13º proporcional (${thirteenthMonthsCount}/12)`, thirteenth));
  }
  if (overdue > 0) {
    employerLines.push(
      plus(
        input.overdueVacations === 2
          ? "Férias vencidas (2 períodos) + 1/3"
          : "Férias vencidas + 1/3",
        overdue,
      ),
    );
  }
  if (type !== "with_cause") {
    employerLines.push(plus(`Férias proporcionais (${proportionalMonths}/12) + 1/3`, proportional));
  }
  if (firstInstallmentPaid > 0)
    employerLines.push(minus("1ª parcela do 13º já paga", firstInstallmentPaid));
  if (noticeDiscount > 0) {
    employerLines.push(
      minus("Desconto do aviso não cumprido", noticeDiscount, "A empresa pode descontar 30 dias."),
    );
  }
  employerLines.push(minus("INSS", inssBalance.cents + inss13));
  employerLines.push(minus("Imposto de Renda", irrfBalance.cents + irrf13));
  employerLines.push(total("A empresa paga", employerNet));

  // FGTS.
  const deposit = mulDivRound(balance + paidNotice + thirteenth, 8, 100);
  let fgtsBalance = input.fgtsBalanceCents;
  if (fgtsBalance === null) {
    // Estimativa: 8% do salário por mês, com 13º e o terço das férias, sem juros e sem saques.
    const months = fullMonths(input.admissionDate, input.lastDay);
    fgtsBalance = mulDivRound(mulDivRound(base, 8, 100) * months, 40, 36);
    notes.push(
      "Sem o saldo do FGTS, estimamos os depósitos pelo salário atual, sem juros e sem saques.",
    );
  }
  const fineRate = type === "without_cause" ? 40 : type === "agreement" ? 20 : 0;
  const fine = mulDivRound(fgtsBalance + deposit, fineRate, 100);
  let withdraw = 0;
  if (type === "without_cause" || type === "agreement" || type === "fixed_term_end") {
    if (input.anniversaryWithdrawal) {
      withdraw = fine;
      notes.push(
        "Com o saque-aniversário, na saída só a multa pode ser sacada; o saldo continua na conta.",
      );
    } else if (type === "agreement") {
      withdraw = mulDivRound(fgtsBalance + deposit, 80, 100) + fine;
    } else {
      withdraw = fgtsBalance + deposit + fine;
    }
  }

  const fgtsLines: ResultLine[] = [
    plus(input.fgtsBalanceCents === null ? "Saldo estimado" : "Saldo informado", fgtsBalance),
    plus("Depósito da rescisão (8%)", deposit),
  ];
  if (fine > 0) fgtsLines.push(plus(`Multa de ${fineRate}%`, fine));
  fgtsLines.push(total("Você pode sacar", withdraw));
  if (withdraw === 0) {
    notes.push(
      type === "with_cause"
        ? "Na justa causa, não há 13º nem férias proporcionais, e o FGTS não pode ser sacado."
        : "Quem pede demissão não saca o FGTS nem recebe a multa.",
    );
  }
  if (type === "fixed_term_end") {
    notes.push("Saída antes do fim do contrato de experiência ainda não é calculada pelo Midas.");
  }

  const payments: PlannedPayment[] = [];
  if (employerNet > 0)
    payments.push({
      labelKey: "rescisao",
      categoryId: "rescisao",
      cents: employerNet,
      dueDate: payDate,
    });
  if (withdraw > 0)
    payments.push({
      labelKey: "rescisao-fgts",
      categoryId: "rescisao",
      cents: withdraw,
      dueDate: payDate,
    });

  return guard({
    headlineCents: employerNet,
    headlineNote: `até ${formatDayMonth(payDate)}`,
    sections: [
      { title: "O que a empresa paga", lines: employerLines },
      { title: "FGTS para sacar na Caixa", lines: fgtsLines },
    ],
    payments,
    notes,
    tableYear: yearOf(inssBalance.table.validFrom),
    outdated: inssBalance.outdated || irrfBalance.outdated,
  });
}

// ——— Salário líquido ———

export function calculateNetSalary(input: NetSalaryInput): LaborResult {
  const inss = inssFor(input.grossCents, input.referenceDate);
  const irrf = irrfFor({
    grossCents: input.grossCents,
    inssCents: inss.cents,
    dependents: input.dependents,
    paidOn: input.referenceDate,
  });
  const net = Math.max(0, input.grossCents - inss.cents - irrf.cents - input.otherDiscountsCents);
  const lines: ResultLine[] = [
    plus("Salário bruto", input.grossCents),
    minus("INSS", inss.cents),
    minus("Imposto de Renda", irrf.cents, taxNote(irrf.reductionCents)),
  ];
  if (input.otherDiscountsCents > 0)
    lines.push(minus("Outros descontos", input.otherDiscountsCents));
  lines.push(total("Você recebe", net));
  return guard({
    headlineCents: net,
    headlineNote: "por mês",
    sections: [{ title: "De onde vem esse valor", lines }],
    payments: [],
    notes: [],
    tableYear: yearOf(inss.table.validFrom),
    outdated: inss.outdated || irrf.outdated,
  });
}

/**
 * Líquido de um salário bruto, para a renda fixa "Salário" quando a pessoa digita o bruto:
 * sem dependentes e sem outros descontos (a calculadora de salário líquido detalha).
 * O bruto só serve para esta conta; quem chama não guarda o bruto.
 */
export function netSalaryFromGross(
  grossCents: number,
  today: DateOnly,
): { netCents: number; outdated: boolean } {
  const result = calculateNetSalary({
    grossCents,
    dependents: 0,
    otherDiscountsCents: 0,
    referenceDate: today,
    payDay: 5,
  });
  return { netCents: result.headlineCents, outdated: result.outdated };
}

// ——— Seguro-desemprego (Lei 7.998/1990, com a Lei 13.134/2015) ———

export interface UnemploymentOutcome {
  eligible: boolean;
  reason?: string;
  installments: number;
  valueCents: number;
}

/** Número de parcelas pelo pedido (1º, 2º, 3º em diante) e meses trabalhados nos últimos 36. */
export function unemploymentInstallments(previousRequests: 0 | 1 | 2, months: number): number {
  const minimum = [12, 9, 6][previousRequests]!;
  if (months < minimum) return 0;
  if (months >= 24) return 5;
  if (months >= 12) return 4;
  return 3;
}

export function unemploymentValue(averageCents: number, date: DateOnly) {
  const pick = pickTable(UNEMPLOYMENT_TABLES, date);
  if (!pick) throw new LaborInputError("O Midas calcula o seguro-desemprego a partir de 2025.");
  const t = pick.table;
  let value: number;
  if (averageCents <= t.band1UpToCents) value = mulDivRound(averageCents, 80, 100);
  else if (averageCents <= t.band2UpToCents)
    value = t.band2BaseCents + mulDivRound(averageCents - t.band1UpToCents, 50, 100);
  else value = t.ceilingCents;
  return {
    cents: Math.min(t.ceilingCents, Math.max(t.floorCents, value)),
    table: t,
    outdated: pick.outdated,
  };
}

export function calculateUnemployment(input: UnemploymentInput): LaborResult {
  if (input.type !== "without_cause") {
    throw new LaborInputError(
      "Só quem é dispensado sem justa causa tem direito ao seguro-desemprego.",
    );
  }
  if (input.previousRequests > 0 && !input.lastBenefitOver16Months) {
    throw new LaborInputError(
      "Entre um seguro-desemprego e outro é preciso esperar 16 meses, contados do último pedido.",
    );
  }
  const installments = unemploymentInstallments(input.previousRequests, input.monthsWorked36);
  if (installments === 0) {
    const minimum = [12, 9, 6][input.previousRequests];
    throw new LaborInputError(
      `Para este pedido é preciso ter recebido salário em pelo menos ${minimum} meses antes da dispensa.`,
    );
  }
  const average = mulDivRound(
    input.salariesCents[0] + input.salariesCents[1] + input.salariesCents[2],
    1,
    3,
  );
  const value = unemploymentValue(average, input.lastDay);
  // Pedido a partir do 7º dia depois da saída; 1ª parcela cerca de 30 dias depois do pedido.
  const first = addDays(input.lastDay, 37);
  const payments: PlannedPayment[] = Array.from({ length: installments }, (_, i) => ({
    labelKey: `seguro-desemprego-${i + 1}`,
    categoryId: "seguro-desemprego" as const,
    cents: value.cents,
    dueDate: addDays(first, 30 * i),
  }));
  return guard({
    headlineCents: value.cents,
    headlineNote: `${installments} parcelas, a partir de ${formatDayMonth(first)}`,
    sections: [
      {
        title: "De onde vem esse valor",
        lines: [
          { label: "Média dos 3 últimos salários", cents: average, sign: "=" },
          total("Valor de cada parcela", value.cents),
          {
            label: "Total das parcelas",
            cents: value.cents * installments,
            sign: "=",
            note: `${installments} parcelas`,
          },
        ],
      },
    ],
    payments,
    notes: [
      "O pedido pode ser feito do 7º ao 120º dia depois da saída; as datas das parcelas são uma estimativa.",
      `Nenhuma parcela é menor que o salário mínimo (${formatWholeMoney(value.table.floorCents)}).`,
    ],
    tableYear: yearOf(value.table.validFrom),
    outdated: value.outdated,
  });
}
