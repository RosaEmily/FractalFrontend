import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { parseDelimited, toCsv } from "../src/shared/utils/csv";
import {
  STUDENT_IMPORT_COLUMNS,
  studentImportSchema,
} from "../src/modules/admin/modules/people/modules/students/constants/import";
import {
  TEACHER_IMPORT_COLUMNS,
  teacherImportSchema,
} from "../src/modules/admin/modules/people/modules/teachers/constants/import";
import { analyzeGrid } from "../src/modules/admin/modules/people/shared/import/analyze";
import {
  checkXlsxArchive,
  readImportFile,
} from "../src/modules/admin/modules/people/shared/import/read-file";

const student = (
  email = "ana@example.test",
  document = "01234567",
): unknown[] => [
  "Ana María",
  "Quispe Rojas",
  email,
  "Femenino",
  "DNI",
  document,
  "987654321",
  "Universitario",
  "Arquitectura",
  "",
  "25/03/1995",
  "Av. Lima 123",
];
const analyze = (grid: unknown[][]) =>
  analyzeGrid(grid, STUDENT_IMPORT_COLUMNS, studentImportSchema);

describe("people import", () => {
  it("reads quoted CSV, embedded delimiters, BOM and multiline cells", () => {
    expect(
      parseDelimited(
        '\uFEFF"Nombre; completo",Correo\r\n"Ana\nMaría",ana@example.test',
      ),
    ).toEqual([
      ["Nombre; completo", "Correo"],
      ["Ana\nMaría", "ana@example.test"],
    ]);
    expect(
      parseDelimited('Nombre;Correo\n"Ana, María";ana@example.test'),
    ).toEqual([
      ["Nombre", "Correo"],
      ["Ana, María", "ana@example.test"],
    ]);
  });
  it("rejects malformed CSV and stops at the configured resource limits", () => {
    expect(() => parseDelimited('"sin cerrar')).toThrow(/comillas/);
    expect(() => parseDelimited("a\nb", { maxRows: 1 })).toThrow(/registros/);
    expect(() => parseDelimited("a,b", { maxColumns: 1 })).toThrow(/columnas/);
    expect(() => parseDelimited("abcdef", { maxCellLength: 3 })).toThrow(
      /celda/,
    );
  });
  it("maps reordered headers, dates and phone numbers without losing document zeroes", () => {
    const header = STUDENT_IMPORT_COLUMNS.map((c) => c.label).reverse();
    const [row] = analyze([header, student(" ANA@example.test ").reverse()]);
    expect(row?.status).toBe("pending");
    expect(row?.n).toBe(2);
    expect(row?.values).toMatchObject({
      email: "ana@example.test",
      document_number: "01234567",
      birth_date: "1995-03-25",
      phone: "+51987654321",
    });
  });
  it("rejects missing and repeated header columns", () => {
    expect(() => analyze([["Nombres", "Correo"], student()])).toThrow(
      /Faltan columnas/,
    );
    expect(() =>
      analyze([
        [...STUDENT_IMPORT_COLUMNS.map((c) => c.label), "Correo"],
        student(),
      ]),
    ).toThrow(/repetidas/);
  });
  it("does not let invalid rows reserve identifiers belonging to valid rows", () => {
    const invalid = student();
    invalid[6] = "123";
    const rows = analyze([
      invalid,
      student(),
      student("ana@example.test", "12345678"),
      student("otra@example.test", "12345678"),
    ]);
    expect(rows.map((r) => r.status)).toEqual([
      "invalid",
      "pending",
      "invalid",
      "pending",
    ]);
    expect(rows[2]?.detail).toMatch(/repetido/);
  });
  it("validates teachers with their own required fields", () => {
    const rows = analyzeGrid(
      [
        [
          "Luis",
          "Paredes",
          "luis@example.test",
          "Masculino",
          "DNI",
          "12345678",
          "987654321",
          "BIM",
          8,
          "Arquitectura",
          "",
          "Docente de BIM",
        ],
      ],
      TEACHER_IMPORT_COLUMNS,
      teacherImportSchema,
    );
    expect(rows[0]?.status).toBe("pending");
    expect(rows[0]?.values.experience_years).toBe(8);
  });
  it("reads actual XLSX numeric identifiers and Excel date cells", async () => {
    const buffer = await readFile("tests/fixtures/people-import.xlsx");
    const bytes = Uint8Array.from(buffer).buffer;
    const file = {
      name: "personas.xlsx",
      size: bytes.byteLength,
      arrayBuffer: async () => bytes,
    } as File;
    const grid = await readImportFile(file);
    const [row] = analyze(grid);
    expect(row?.status).toBe("pending");
    expect(row?.values.document_number).toBe("01234567");
    expect(row?.values.birth_date).toBe("1995-03-25");
  });
  it("bounds expanded XLSX data before invoking the reader", async () => {
    const buffer = Uint8Array.from(
      await readFile("tests/fixtures/people-import.xlsx"),
    ).buffer;
    const view = new DataView(buffer);
    for (let i = 0; i < buffer.byteLength - 46; i++) {
      if (view.getUint32(i, true) === 0x02014b50) {
        view.setUint32(i + 24, 200 * 1024 * 1024, true);
        break;
      }
    }
    expect(() => checkXlsxArchive(buffer)).toThrow(/demasiado grande/);
  });
  it("rejects oversized input and keeps exported observations safe for Excel", async () => {
    await expect(
      readImportFile({ name: "grande.xlsx", size: 3 * 1024 * 1024 } as File),
    ).rejects.toThrow(/2 MB/);
    expect(toCsv([["=CMD()", "nombre, apellido"]])).toBe(
      `'=CMD(),"nombre, apellido"`,
    );
  });
  it("accepts 1,000 records and rejects an extra record", () => {
    const grid = Array.from({ length: 1000 }, (_, i) =>
      student(`persona${i}@example.test`, String(i + 10000000)),
    );
    const rows = analyze(grid);
    expect(rows.length).toBe(1000);
    expect(rows.every((r) => r.status === "pending")).toBe(true);
    grid.push(student("extra@example.test", "90000000"));
    expect(() => analyze(grid)).toThrow(/1[.,]?000/);
  });
});
