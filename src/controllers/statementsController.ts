import { NextFunction, Request, Response } from "express";
import { buildStatement, Statement } from "../services/statementService";
import { saveExport, readExport, isValidExportFilename } from "../services/exportStore";
import { toCsv } from "../lib/csv";

/** Both handlers must derive the same valid basename for every accepted account ID. */
function defaultExportFilename(accountId: string): string {
  return `statement-${accountId.replace(/[^A-Za-z0-9_.-]/g, "_")}.csv`;
}

/**
 * Lay a statement out as CSV rows: an opening row carrying the opening balance
 * first, one row per line, and a closing row carrying the closing balance last.
 * Columns are row_type, event_id, recorded_at, type, reference, memo, delta_cents,
 * balance_cents.
 */
function statementRows(statement: Statement): (string | number)[][] {
  const rows: (string | number)[][] = [
    ["opening", "", "", "", "", "", "", statement.openingBalanceCents],
  ];
  for (const line of statement.lines) {
    rows.push([
      "line",
      line.eventId,
      line.recordedAt,
      line.type,
      line.reference,
      line.memo ?? "",
      line.deltaCents,
      line.balanceCents,
    ]);
  }
  rows.push(["closing", "", "", "", "", "", "", statement.closingBalanceCents]);
  return rows;
}

/**
 * GET /api/accounts/:accountId/statement — build the account statement for the
 * from..to window and return it as JSON (the default) or CSV. A CSV response is
 * also saved through exportStore so it can be fetched again from the exports route.
 */
export async function getStatement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to, format, filename } = req.query;
    const outputFormat = format ?? "json";
    if (outputFormat !== "json" && outputFormat !== "csv") {
      res.status(400).json({ error: "unknown format" });
      return;
    }

    const statement = buildStatement(
      req.params.accountId,
      typeof from === "string" ? from : "",
      typeof to === "string" ? to : "",
    );
    if (!statement) {
      res.status(400).json({ error: "invalid from or to date" });
      return;
    }

    if (outputFormat === "json") {
      res.json(statement);
      return;
    }

    const name =
      typeof filename === "string" && filename.length > 0
        ? filename
        : defaultExportFilename(req.params.accountId);
    if (!isValidExportFilename(name) || (filename !== undefined && typeof filename !== "string")) {
      res.status(400).json({ error: "invalid export filename" });
      return;
    }
    const csv = toCsv(statementRows(statement));
    await saveExport(req.params.accountId, name, csv);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${name}`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accounts/:accountId/statement/exports — return a previously saved CSV
 * export by filename, or 404 when no export is stored under that name.
 */
export async function getStatementExport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { filename } = req.query;
    const name =
      typeof filename === "string" && filename.length > 0
        ? filename
        : defaultExportFilename(req.params.accountId);
    if (!isValidExportFilename(name) || (filename !== undefined && typeof filename !== "string")) {
      res.status(400).json({ error: "invalid export filename" });
      return;
    }
    const csv = await readExport(req.params.accountId, name);
    if (csv === null) {
      res.status(404).json({ error: "export not found" });
      return;
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${name}`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
