/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Database,
  Download,
  Edit3,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  ListChecks,
  Lock,
  LogOut,
  Menu,
  Moon,
  Package,
  PackagePlus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  UploadCloud,
  Warehouse,
  X,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type Role = "admin" | "user";
type StatusAktif = "aktif" | "nonaktif";
type MenuKey =
  | "dashboard"
  | "master"
  | "upload"
  | "kartu"
  | "mutasi"
  | "cek"
  | "klaim"
  | "report"
  | "admin";
type UploadType =
  | "rekapBeli"
  | "detailBeli"
  | "detailJual"
  | "saldoAwal"
  | "klaim";
type DateBasis = "fp" | "gudang";
type UploadMode = "append" | "replace";

interface AppUser {
  id: string;
  username: string;
  password: string;
  role: Role;
  active: boolean;
  allowInput: boolean;
  allowExport: boolean;
}

interface MasterBarang {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  satuan: string;
  kategori: string;
  barcode: string;
  status: StatusAktif;
}

interface MasterGudang {
  id: string;
  kodeGudang: string;
  namaGudang: string;
  lokasi: string;
  status: StatusAktif;
}

interface MasterVendor {
  id: string;
  kodeVendor: string;
  namaVendor: string;
  alamat: string;
  npwp: string;
  status: StatusAktif;
}

interface MasterPihak {
  id: string;
  kodePihak: string;
  namaPihak: string;
  tipe: string;
  status: StatusAktif;
}

interface MasterJenisKlaim {
  id: string;
  jenisKlaim: string;
  defaultDivisi: string;
  catatan: string;
  status: StatusAktif;
}

interface RekapBeli {
  id: string;
  no: string;
  namaPt: string;
  tglFp: string;
  noFp: string;
  sjVendor: string;
  dpp: number;
  grNo: string;
  catatan: string;
  statusMatch: "Match" | "Belum Match";
  batchId: string;
  sourceRow: number;
  validationStatus: string;
}

interface DetailBeli {
  id: string;
  no: string;
  grNo: string;
  tanggalTerimaGudang: string;
  gudang: string;
  poNo: string;
  sjVendor: string;
  keterangan: string;
  vendor: string;
  kodeBarang: string;
  namaBarang: string;
  qtyPurchase: number;
  satuan: string;
  qtyStock: number;
  harga: number;
  dpp: number;
  noFakturPajak: string;
  statusMatch: "Match" | "Belum Match";
  batchId: string;
  sourceRow: number;
  validationStatus: string;
}

interface DetailJual {
  id: string;
  no: string;
  tanggalKeluarGudang: string;
  gudang: string;
  noDokumen: string;
  customer: string;
  kodeBarang: string;
  namaBarang: string;
  qty: number;
  satuan: string;
  harga: number;
  jumlah: number;
  keterangan: string;
  batchId: string;
  sourceRow: number;
  validationStatus: string;
}

interface SaldoAwal {
  id: string;
  no: string;
  kodeBarang: string;
  namaBarang: string;
  gudang: string;
  satuan: string;
  saldoAwalQty: number;
  hargaAwal: number;
  nilaiAwal: number;
  batchId: string;
  sourceRow: number;
  validationStatus: string;
}

interface MonitoringKlaim {
  id: string;
  tanggalPengajuan: string;
  divisi: string;
  yangMengajukan: string;
  jenisKlaim: string;
  noKlaim: string;
  noFakturPajak: string;
  tanggalFakturPajak: string;
  dpp: number;
  ppn: number;
  status: "Draft" | "Diajukan" | "Diproses" | "Selesai" | "Ditolak";
  keterangan: string;
  attachment: string;
  batchId?: string;
  sourceRow?: number;
  validationStatus?: string;
}

interface RekonsiliasiBeli {
  id: string;
  sjVendor: string;
  noFp: string;
  grNo: string;
  namaPt: string;
  vendor: string;
  tglFp: string;
  tanggalTerimaGudang: string;
  dppRekap: number;
  dppDetail: number;
  selisihDpp: number;
  status: "Match" | "Belum Match";
  catatan: string;
}

interface UploadBatch {
  id: string;
  template: string;
  fileName: string;
  sheetName: string;
  rowsSaved: number;
  uploadedBy: string;
  uploadedAt: string;
  status: "Berhasil" | "Gagal";
  mode: UploadMode;
  message: string;
}

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  detail: string;
}

interface DbState {
  users: AppUser[];
  masterBarang: MasterBarang[];
  masterGudang: MasterGudang[];
  masterVendor: MasterVendor[];
  masterPihak: MasterPihak[];
  masterJenisKlaim: MasterJenisKlaim[];
  stockRekapBeli: RekapBeli[];
  stockDetailBeli: DetailBeli[];
  stockDetailJual: DetailJual[];
  stockSaldoAwal: SaldoAwal[];
  stockRekonsiliasiBeli: RekonsiliasiBeli[];
  monitoringKlaim: MonitoringKlaim[];
  uploadBatches: UploadBatch[];
  auditLogs: AuditLog[];
}

interface FiltersState {
  year: string;
  month: string;
  startDate: string;
  endDate: string;
  gudang: string;
  vendor: string;
  search: string;
  dateBasis: DateBasis;
}

interface StockCardRow {
  id: string;
  tanggal: string;
  gudang: string;
  kodeBarang: string;
  namaBarang: string;
  noDokumen: string;
  pihak: string;
  masukQty: number;
  keluarQty: number;
  saldoQty: number;
  harga: number;
  nilai: number;
  keterangan: string;
}

interface MutasiRow {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  saldoAwal: number;
  qtyMasuk: number;
  qtyKeluar: number;
  saldoAkhir: number;
  nilaiAwal: number;
  nilaiMasuk: number;
  nilaiKeluar: number;
  nilaiAkhir: number;
}

interface UploadDefinition {
  label: string;
  fileName: string;
  stateKey:
    | "stockRekapBeli"
    | "stockDetailBeli"
    | "stockDetailJual"
    | "stockSaldoAwal"
    | "monitoringKlaim";
  requiredHeaders: string[];
  sample: Array<string | number>;
  mapRow: (
    row: Record<string, unknown>,
    batchId: string,
    sourceRow: number,
  ) => RekapBeli | DetailBeli | DetailJual | SaldoAwal | MonitoringKlaim;
}

interface TableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (row: T, index: number) => ReactNode;
  exportValue?: (row: T) => string | number;
}

interface SessionUser {
  id: string;
  username: string;
  role: Role;
  allowInput: boolean;
  allowExport: boolean;
  token: string;
}

const DB_KEY = "stok-klaim-bbm-db-v1";
const SESSION_KEY = "stok-klaim-bbm-session-v1";
const ACTIVE_SESSION_KEY = "stok-klaim-bbm-active-sessions-v1";

const currentYear = new Date().getFullYear().toString();

const initialFilters: FiltersState = {
  year: "",
  month: "",
  startDate: "",
  endDate: "",
  gudang: "",
  vendor: "",
  search: "",
  dateBasis: "gudang",
};

const claimStatuses: MonitoringKlaim["status"][] = [
  "Draft",
  "Diajukan",
  "Diproses",
  "Selesai",
  "Ditolak",
];

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function nowText() {
  return new Date().toISOString();
}

function normalizeHeader(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeExcelText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "";
    }
    return Number.isInteger(value)
      ? value.toFixed(0)
      : value.toLocaleString("en-US", {
          useGrouping: false,
          maximumFractionDigits: 20,
        }).replace(/0+$/, "").replace(/\.$/, "");
  }

  let text = String(value).trim();
  if (text.startsWith("'")) {
    text = text.slice(1);
  }
  text = text.replace(/\u00a0/g, " ").trim();

  if (/^-?\d+\.0+$/.test(text)) {
    return text.replace(/\.0+$/, "");
  }

  if (/^-?\d+(?:\.\d+)?e[+-]?\d+$/i.test(text)) {
    const numeric = Number(text);
    if (Number.isFinite(numeric)) {
      return Number.isInteger(numeric)
        ? numeric.toFixed(0)
        : numeric.toLocaleString("en-US", {
            useGrouping: false,
            maximumFractionDigits: 20,
          });
    }
  }

  return text;
}

function documentKey(value: unknown) {
  return normalizeExcelText(value).replace(/\s+/g, "").toUpperCase();
}

function getCell(row: Record<string, unknown>, header: string) {
  const wanted = normalizeHeader(header);
  const found = Object.keys(row).find((key) => normalizeHeader(key) === wanted);
  return normalizeExcelText(found ? row[found] : "");
}

function parseAmount(value: unknown) {
  const raw = normalizeExcelText(value)
    .replace(/rp/gi, "")
    .replace(/[^\d,.-]/g, "")
    .trim();
  if (!raw) {
    return 0;
  }

  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  let normalized = raw;

  if (lastComma > -1 && lastDot > -1) {
    normalized =
      lastComma > lastDot
        ? raw.replace(/\./g, "").replace(",", ".")
        : raw.replace(/,/g, "");
  } else if (lastComma > -1) {
    normalized = raw.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = raw.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateText(value: unknown) {
  const text = normalizeExcelText(value);
  if (!text) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return text;
}

function dateParts(value: string) {
  const date = parseDateText(value);
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  return {
    year: match[1],
    month: match[2],
    day: match[3],
    key: `${match[1]}-${match[2]}-${match[3]}`,
  };
}

function matchesDate(value: string, filters: FiltersState, skipDate = false) {
  if (skipDate) {
    return true;
  }
  const parts = dateParts(value);
  if (filters.year && parts?.year !== filters.year) {
    return false;
  }
  if (filters.month && parts?.month !== filters.month.padStart(2, "0")) {
    return false;
  }
  if (filters.startDate && (!parts || parts.key < filters.startDate)) {
    return false;
  }
  if (filters.endDate && (!parts || parts.key > filters.endDate)) {
    return false;
  }
  return true;
}

function includesSearch(values: Array<string | number>, search: string) {
  if (!search.trim()) {
    return true;
  }
  const needle = search.toLowerCase();
  return values.some((value) => String(value).toLowerCase().includes(needle));
}

function formatQty(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function readStoredJson<T>(key: string, fallback: T) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getActiveSessions() {
  return readStoredJson<Record<string, string>>(ACTIVE_SESSION_KEY, {});
}

function setActiveSessions(value: Record<string, string>) {
  writeStoredJson(ACTIVE_SESSION_KEY, value);
}

function normalizeDefaultUsers(users: AppUser[] | undefined) {
  const seedUsers = seedDb().users;
  const storedUsers = users?.length ? users : seedUsers;
  let hasDefaultAdmin = false;
  const normalized = storedUsers.map((user) => {
    if (
      user.id === "usr_admin" ||
      user.username === "admin" ||
      user.username === "admin321"
    ) {
      hasDefaultAdmin = true;
      return {
        ...user,
        username: "admin321",
        password: "654321",
        role: "admin" as const,
        active: true,
        allowInput: true,
        allowExport: true,
      };
    }
    return user;
  });

  if (!hasDefaultAdmin) {
    normalized.unshift(seedUsers[0]);
  }

  return normalized;
}

function seedDb(): DbState {
  const batchId = "seed_batch";
  return {
    users: [
      {
        id: "usr_admin",
        username: "admin321",
        password: "654321",
        role: "admin",
        active: true,
        allowInput: true,
        allowExport: true,
      },
      {
        id: "usr_user",
        username: "user",
        password: "user123",
        role: "user",
        active: true,
        allowInput: true,
        allowExport: true,
      },
    ],
    masterBarang: [
      {
        id: "brg_001",
        kodeBarang: "BRG-001",
        namaBarang: "Panel Listrik 20A",
        satuan: "PCS",
        kategori: "Elektrikal",
        barcode: "8991001001",
        status: "aktif",
      },
      {
        id: "brg_002",
        kodeBarang: "BRG-002",
        namaBarang: "Kabel NYY 2x1.5",
        satuan: "ROLL",
        kategori: "Kabel",
        barcode: "8991001002",
        status: "aktif",
      },
      {
        id: "brg_003",
        kodeBarang: "BRG-003",
        namaBarang: "MCB 10A",
        satuan: "PCS",
        kategori: "Elektrikal",
        barcode: "",
        status: "aktif",
      },
    ],
    masterGudang: [
      {
        id: "gdg_sby",
        kodeGudang: "GDG-SBY",
        namaGudang: "Gudang Surabaya",
        lokasi: "Surabaya",
        status: "aktif",
      },
      {
        id: "gdg_jkt",
        kodeGudang: "GDG-JKT",
        namaGudang: "Gudang Jakarta",
        lokasi: "Jakarta",
        status: "aktif",
      },
    ],
    masterVendor: [
      {
        id: "ven_001",
        kodeVendor: "VND-001",
        namaVendor: "PT Sumber Terang",
        alamat: "Jakarta",
        npwp: "01.234.567.8-999.000",
        status: "aktif",
      },
      {
        id: "ven_002",
        kodeVendor: "VND-002",
        namaVendor: "PT Logam Sentosa",
        alamat: "Sidoarjo",
        npwp: "",
        status: "aktif",
      },
    ],
    masterPihak: [
      {
        id: "phk_001",
        kodePihak: "CST-001",
        namaPihak: "Proyek Surabaya Barat",
        tipe: "Customer",
        status: "aktif",
      },
      {
        id: "phk_002",
        kodePihak: "INT-001",
        namaPihak: "Divisi Operasional",
        tipe: "Internal",
        status: "aktif",
      },
    ],
    masterJenisKlaim: [
      {
        id: "jkl_001",
        jenisKlaim: "Selisih Harga",
        defaultDivisi: "Purchasing",
        catatan: "Klaim atas DPP atau harga beli.",
        status: "aktif",
      },
      {
        id: "jkl_002",
        jenisKlaim: "Barang Rusak",
        defaultDivisi: "Gudang",
        catatan: "Klaim fisik barang dan dokumen pendukung.",
        status: "aktif",
      },
    ],
    stockSaldoAwal: [
      {
        id: "saldo_001",
        no: "1",
        kodeBarang: "BRG-001",
        namaBarang: "Panel Listrik 20A",
        gudang: "Gudang Surabaya",
        satuan: "PCS",
        saldoAwalQty: 12,
        hargaAwal: 450000,
        nilaiAwal: 5400000,
        batchId,
        sourceRow: 2,
        validationStatus: "Valid",
      },
      {
        id: "saldo_002",
        no: "2",
        kodeBarang: "BRG-002",
        namaBarang: "Kabel NYY 2x1.5",
        gudang: "Gudang Surabaya",
        satuan: "ROLL",
        saldoAwalQty: 7,
        hargaAwal: 320000,
        nilaiAwal: 2240000,
        batchId,
        sourceRow: 3,
        validationStatus: "Valid",
      },
    ],
    stockRekapBeli: [
      {
        id: "rekap_001",
        no: "1",
        namaPt: "PT Berdikari Berkah Mulia",
        tglFp: "2026-02-28",
        noFp: "0100012600012345",
        sjVendor: "1301430599",
        dpp: 9000000,
        grNo: "",
        catatan: "Faktur Februari, barang datang Maret",
        statusMatch: "Belum Match",
        batchId,
        sourceRow: 2,
        validationStatus: "Valid",
      },
      {
        id: "rekap_002",
        no: "2",
        namaPt: "PT Berdikari Berkah Mulia",
        tglFp: "2026-03-05",
        noFp: "0100012600012399",
        sjVendor: "SJ-4450",
        dpp: 2750000,
        grNo: "",
        catatan: "",
        statusMatch: "Belum Match",
        batchId,
        sourceRow: 3,
        validationStatus: "Valid",
      },
    ],
    stockDetailBeli: [
      {
        id: "dbeli_001",
        no: "1",
        grNo: "GR-SBY-260301",
        tanggalTerimaGudang: "2026-03-02",
        gudang: "Gudang Surabaya",
        poNo: "PO-2602-001",
        sjVendor: "1.301430599E+09",
        keterangan: "Barang dikirim akhir Februari",
        vendor: "PT Sumber Terang",
        kodeBarang: "BRG-001",
        namaBarang: "Panel Listrik 20A",
        qtyPurchase: 20,
        satuan: "PCS",
        qtyStock: 20,
        harga: 450000,
        dpp: 9000000,
        noFakturPajak: "",
        statusMatch: "Belum Match",
        batchId,
        sourceRow: 2,
        validationStatus: "Valid",
      },
      {
        id: "dbeli_002",
        no: "2",
        grNo: "GR-SBY-260306",
        tanggalTerimaGudang: "2026-03-06",
        gudang: "Gudang Surabaya",
        poNo: "PO-2603-004",
        sjVendor: "SJ-4450",
        keterangan: "",
        vendor: "PT Logam Sentosa",
        kodeBarang: "BRG-003",
        namaBarang: "MCB 10A",
        qtyPurchase: 25,
        satuan: "PCS",
        qtyStock: 25,
        harga: 110000,
        dpp: 2750000,
        noFakturPajak: "",
        statusMatch: "Belum Match",
        batchId,
        sourceRow: 3,
        validationStatus: "Valid",
      },
      {
        id: "dbeli_003",
        no: "3",
        grNo: "GR-SBY-260310",
        tanggalTerimaGudang: "2026-03-10",
        gudang: "Gudang Surabaya",
        poNo: "PO-2603-010",
        sjVendor: "SJ-NA-1",
        keterangan: "Belum ada faktur pajak",
        vendor: "PT Vendor Baru",
        kodeBarang: "BRG-002",
        namaBarang: "Kabel NYY 2x1.5",
        qtyPurchase: 4,
        satuan: "ROLL",
        qtyStock: 4,
        harga: 340000,
        dpp: 1360000,
        noFakturPajak: "",
        statusMatch: "Belum Match",
        batchId,
        sourceRow: 4,
        validationStatus: "Valid",
      },
    ],
    stockDetailJual: [
      {
        id: "djual_001",
        no: "1",
        tanggalKeluarGudang: "2026-03-12",
        gudang: "Gudang Surabaya",
        noDokumen: "DO-2603-008",
        customer: "Proyek Surabaya Barat",
        kodeBarang: "BRG-001",
        namaBarang: "Panel Listrik 20A",
        qty: 8,
        satuan: "PCS",
        harga: 520000,
        jumlah: 4160000,
        keterangan: "Pemakaian proyek",
        batchId,
        sourceRow: 2,
        validationStatus: "Valid",
      },
    ],
    stockRekonsiliasiBeli: [],
    monitoringKlaim: [
      {
        id: "klaim_001",
        tanggalPengajuan: "2026-03-14",
        divisi: "Purchasing",
        yangMengajukan: "Rina",
        jenisKlaim: "Selisih Harga",
        noKlaim: "KLM-2603-001",
        noFakturPajak: "0100012600012345",
        tanggalFakturPajak: "2026-02-28",
        dpp: 9000000,
        ppn: 990000,
        status: "Diproses",
        keterangan: "Menunggu konfirmasi vendor",
        attachment: "fp-0100012600012345.pdf, sj-1301430599.pdf",
        batchId,
        sourceRow: 2,
        validationStatus: "Valid",
      },
    ],
    uploadBatches: [
      {
        id: batchId,
        template: "Data awal",
        fileName: "seed-data",
        sheetName: "seed",
        rowsSaved: 10,
        uploadedBy: "system",
        uploadedAt: nowText(),
        status: "Berhasil",
        mode: "append",
        message: "Contoh data lintas bulan untuk verifikasi awal.",
      },
    ],
    auditLogs: [
      {
        id: "audit_seed",
        actor: "system",
        action: "seed",
        target: "database",
        at: nowText(),
        detail: "Initial Stok dan Klaim data created.",
      },
    ],
  };
}

const uploadDefinitions: Record<UploadType, UploadDefinition> = {
  rekapBeli: {
    label: "Template Rekap Beli",
    fileName: "REKAP_BELI.xlsx",
    stateKey: "stockRekapBeli",
    requiredHeaders: [
      "NO",
      "NAMA PT",
      "TGL FP",
      "NO FP",
      "SJ VENDOR",
      "DPP",
      "GR NO",
      "CATATAN",
    ],
    sample: [
      "1",
      "PT Berdikari Berkah Mulia",
      "2026-02-28",
      "0100012600012345",
      "1301430599",
      9000000,
      "",
      "Faktur beda bulan dengan gudang",
    ],
    mapRow: (row, batchId, sourceRow): RekapBeli => ({
      id: createId("rekap"),
      no: getCell(row, "NO"),
      namaPt: getCell(row, "NAMA PT"),
      tglFp: parseDateText(getCell(row, "TGL FP")),
      noFp: normalizeExcelText(getCell(row, "NO FP")),
      sjVendor: normalizeExcelText(getCell(row, "SJ VENDOR")),
      dpp: parseAmount(getCell(row, "DPP")),
      grNo: normalizeExcelText(getCell(row, "GR NO")),
      catatan: getCell(row, "CATATAN"),
      statusMatch: "Belum Match",
      batchId,
      sourceRow,
      validationStatus: "Valid",
    }),
  },
  detailBeli: {
    label: "Template Detail Beli",
    fileName: "DETAIL_BELI.xlsx",
    stateKey: "stockDetailBeli",
    requiredHeaders: [
      "NO",
      "GR NO",
      "TANGGAL TERIMA GUDANG",
      "GUDANG",
      "PO NO",
      "SJ VENDOR",
      "KETERANGAN",
      "VENDOR",
      "KODE BARANG",
      "NAMA BARANG",
      "QTY PURCHASE",
      "SATUAN",
      "QTY STOCK",
      "HARGA",
      "DPP",
      "NO FAKTUR PAJAK",
    ],
    sample: [
      "1",
      "GR-SBY-260301",
      "2026-03-02",
      "Gudang Surabaya",
      "PO-2602-001",
      "1.301430599E+09",
      "Barang diterima awal Maret",
      "PT Sumber Terang",
      "BRG-001",
      "Panel Listrik 20A",
      20,
      "PCS",
      20,
      450000,
      9000000,
      "",
    ],
    mapRow: (row, batchId, sourceRow): DetailBeli => ({
      id: createId("dbeli"),
      no: getCell(row, "NO"),
      grNo: normalizeExcelText(getCell(row, "GR NO")),
      tanggalTerimaGudang: parseDateText(getCell(row, "TANGGAL TERIMA GUDANG")),
      gudang: getCell(row, "GUDANG"),
      poNo: normalizeExcelText(getCell(row, "PO NO")),
      sjVendor: normalizeExcelText(getCell(row, "SJ VENDOR")),
      keterangan: getCell(row, "KETERANGAN"),
      vendor: getCell(row, "VENDOR"),
      kodeBarang: getCell(row, "KODE BARANG"),
      namaBarang: getCell(row, "NAMA BARANG"),
      qtyPurchase: parseAmount(getCell(row, "QTY PURCHASE")),
      satuan: getCell(row, "SATUAN"),
      qtyStock: parseAmount(getCell(row, "QTY STOCK")),
      harga: parseAmount(getCell(row, "HARGA")),
      dpp: parseAmount(getCell(row, "DPP")),
      noFakturPajak: normalizeExcelText(getCell(row, "NO FAKTUR PAJAK")),
      statusMatch: "Belum Match",
      batchId,
      sourceRow,
      validationStatus: "Valid",
    }),
  },
  detailJual: {
    label: "Template Detail Jual",
    fileName: "DETAIL_JUAL.xlsx",
    stateKey: "stockDetailJual",
    requiredHeaders: [
      "NO",
      "TANGGAL KELUAR GUDANG",
      "GUDANG",
      "NO DOKUMEN",
      "CUSTOMER",
      "KODE BARANG",
      "NAMA BARANG",
      "QTY",
      "SATUAN",
      "HARGA",
      "JUMLAH",
      "KETERANGAN",
    ],
    sample: [
      "1",
      "2026-03-12",
      "Gudang Surabaya",
      "DO-2603-008",
      "Proyek Surabaya Barat",
      "BRG-001",
      "Panel Listrik 20A",
      8,
      "PCS",
      520000,
      4160000,
      "Pemakaian proyek",
    ],
    mapRow: (row, batchId, sourceRow): DetailJual => {
      const qty = parseAmount(getCell(row, "QTY"));
      const harga = parseAmount(getCell(row, "HARGA"));
      const jumlah = parseAmount(getCell(row, "JUMLAH")) || qty * harga;
      return {
        id: createId("djual"),
        no: getCell(row, "NO"),
        tanggalKeluarGudang: parseDateText(getCell(row, "TANGGAL KELUAR GUDANG")),
        gudang: getCell(row, "GUDANG"),
        noDokumen: normalizeExcelText(getCell(row, "NO DOKUMEN")),
        customer: getCell(row, "CUSTOMER"),
        kodeBarang: getCell(row, "KODE BARANG"),
        namaBarang: getCell(row, "NAMA BARANG"),
        qty,
        satuan: getCell(row, "SATUAN"),
        harga,
        jumlah,
        keterangan: getCell(row, "KETERANGAN"),
        batchId,
        sourceRow,
        validationStatus: "Valid",
      };
    },
  },
  saldoAwal: {
    label: "Template Saldo Awal Stok",
    fileName: "SALDO_AWAL_STOK.xlsx",
    stateKey: "stockSaldoAwal",
    requiredHeaders: [
      "NO",
      "KODE BARANG",
      "NAMA BARANG",
      "GUDANG",
      "SATUAN",
      "SALDO AWAL QTY",
      "HARGA AWAL",
      "NILAI AWAL",
    ],
    sample: [
      "1",
      "BRG-001",
      "Panel Listrik 20A",
      "Gudang Surabaya",
      "PCS",
      12,
      450000,
      5400000,
    ],
    mapRow: (row, batchId, sourceRow): SaldoAwal => {
      const qty = parseAmount(getCell(row, "SALDO AWAL QTY"));
      const harga = parseAmount(getCell(row, "HARGA AWAL"));
      const nilai = parseAmount(getCell(row, "NILAI AWAL")) || qty * harga;
      return {
        id: createId("saldo"),
        no: getCell(row, "NO"),
        kodeBarang: getCell(row, "KODE BARANG"),
        namaBarang: getCell(row, "NAMA BARANG"),
        gudang: getCell(row, "GUDANG"),
        satuan: getCell(row, "SATUAN"),
        saldoAwalQty: qty,
        hargaAwal: harga,
        nilaiAwal: nilai,
        batchId,
        sourceRow,
        validationStatus: "Valid",
      };
    },
  },
  klaim: {
    label: "Template Monitoring Klaim",
    fileName: "MONITORING_KLAIM.xlsx",
    stateKey: "monitoringKlaim",
    requiredHeaders: [
      "NO",
      "TANGGAL PENGAJUAN",
      "DIVISI",
      "YANG MENGAJUKAN",
      "JENIS KLAIM",
      "NO KLAIM",
      "NO FAKTUR PAJAK",
      "TANGGAL FAKTUR PAJAK",
      "DPP",
      "PPN",
      "STATUS",
      "KETERANGAN",
      "ATTACHMENT",
    ],
    sample: [
      "1",
      "2026-03-14",
      "Purchasing",
      "Rina",
      "Selisih Harga",
      "KLM-2603-001",
      "0100012600012345",
      "2026-02-28",
      9000000,
      990000,
      "Diajukan",
      "Menunggu vendor",
      "fp.pdf, sj.pdf",
    ],
    mapRow: (row, batchId, sourceRow): MonitoringKlaim => {
      const rawStatus = getCell(row, "STATUS") as MonitoringKlaim["status"];
      return {
        id: createId("klaim"),
        tanggalPengajuan: parseDateText(getCell(row, "TANGGAL PENGAJUAN")),
        divisi: getCell(row, "DIVISI"),
        yangMengajukan: getCell(row, "YANG MENGAJUKAN"),
        jenisKlaim: getCell(row, "JENIS KLAIM"),
        noKlaim: normalizeExcelText(getCell(row, "NO KLAIM")),
        noFakturPajak: normalizeExcelText(getCell(row, "NO FAKTUR PAJAK")),
        tanggalFakturPajak: parseDateText(getCell(row, "TANGGAL FAKTUR PAJAK")),
        dpp: parseAmount(getCell(row, "DPP")),
        ppn: parseAmount(getCell(row, "PPN")),
        status: claimStatuses.includes(rawStatus) ? rawStatus : "Draft",
        keterangan: getCell(row, "KETERANGAN"),
        attachment: getCell(row, "ATTACHMENT"),
        batchId,
        sourceRow,
        validationStatus: "Valid",
      };
    },
  },
};

const masterConfigs = {
  barang: {
    label: "Master Barang",
    stateKey: "masterBarang",
    primary: "kodeBarang",
    fields: [
      ["kodeBarang", "Kode Barang"],
      ["namaBarang", "Nama Barang"],
      ["satuan", "Satuan"],
      ["kategori", "Kategori"],
      ["barcode", "Barcode"],
    ],
    empty: {
      kodeBarang: "",
      namaBarang: "",
      satuan: "",
      kategori: "",
      barcode: "",
      status: "aktif",
    },
  },
  gudang: {
    label: "Master Gudang",
    stateKey: "masterGudang",
    primary: "kodeGudang",
    fields: [
      ["kodeGudang", "Kode Gudang"],
      ["namaGudang", "Nama Gudang"],
      ["lokasi", "Lokasi"],
    ],
    empty: {
      kodeGudang: "",
      namaGudang: "",
      lokasi: "",
      status: "aktif",
    },
  },
  vendor: {
    label: "Master Vendor",
    stateKey: "masterVendor",
    primary: "kodeVendor",
    fields: [
      ["kodeVendor", "Kode Vendor"],
      ["namaVendor", "Nama Vendor"],
      ["alamat", "Alamat"],
      ["npwp", "NPWP"],
    ],
    empty: {
      kodeVendor: "",
      namaVendor: "",
      alamat: "",
      npwp: "",
      status: "aktif",
    },
  },
  pihak: {
    label: "Master Customer/Pihak",
    stateKey: "masterPihak",
    primary: "kodePihak",
    fields: [
      ["kodePihak", "Kode Pihak"],
      ["namaPihak", "Nama Pihak"],
      ["tipe", "Tipe"],
    ],
    empty: {
      kodePihak: "",
      namaPihak: "",
      tipe: "Customer",
      status: "aktif",
    },
  },
  jenisKlaim: {
    label: "Master Jenis Klaim",
    stateKey: "masterJenisKlaim",
    primary: "jenisKlaim",
    fields: [
      ["jenisKlaim", "Jenis Klaim"],
      ["defaultDivisi", "Default Divisi"],
      ["catatan", "Catatan"],
    ],
    empty: {
      jenisKlaim: "",
      defaultDivisi: "",
      catatan: "",
      status: "aktif",
    },
  },
} as const;

type MasterKey = keyof typeof masterConfigs;
type MasterStateKey = (typeof masterConfigs)[MasterKey]["stateKey"];
type MasterForm = Record<string, string>;

const menuItems: Array<{
  key: MenuKey;
  label: string;
  icon: ComponentType<{ size?: number }>;
}> = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "master", label: "Master Data", icon: Database },
  { key: "upload", label: "Upload Data", icon: UploadCloud },
  { key: "kartu", label: "Kartu Stok", icon: ClipboardList },
  { key: "mutasi", label: "Mutasi Stok", icon: Package },
  { key: "cek", label: "Cek Detail Beli", icon: ClipboardCheck },
  { key: "klaim", label: "Monitoring Klaim", icon: ListChecks },
  { key: "report", label: "Report", icon: FileText },
  { key: "admin", label: "Admin & Kontrol", icon: Settings },
];

function hasHeader(headers: string[], required: string) {
  const normalized = normalizeHeader(required);
  return headers.some((header) => normalizeHeader(header) === normalized);
}

function parseSheet(file: File) {
  return file.arrayBuffer().then((buffer) => {
    const workbook = XLSX.read(buffer, {
      type: "array",
      raw: false,
      cellDates: false,
    });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });
    const headers =
      XLSX.utils.sheet_to_json<string[]>(sheet, {
        header: 1,
        blankrows: false,
      })[0] ?? Object.keys(rows[0] ?? {});
    return { rows, headers: headers.map(String), sheetName };
  });
}

function exportExcel<T>(
  fileName: string,
  sheetName: string,
  columns: TableColumn<T>[],
  rows: T[],
) {
  const data = rows.map((row) => {
    const record: Record<string, string | number> = {};
    columns.forEach((column) => {
      const value =
        column.exportValue?.(row) ??
        (row as Record<string, string | number | undefined>)[column.key] ??
        "";
      record[column.label] = value;
    });
    return record;
  });
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, `${fileName}.xlsx`, { bookType: "xlsx" });
}

function exportPdf<T>(
  fileName: string,
  title: string,
  columns: TableColumn<T>[],
  rows: T[],
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(title, 32, 32);
  autoTable(doc, {
    startY: 48,
    head: [columns.map((column) => column.label)],
    body: rows.map((row) =>
      columns.map((column) => {
        const value =
          column.exportValue?.(row) ??
          (row as Record<string, string | number | undefined>)[column.key] ??
          "";
        return String(value);
      }),
    ),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [16, 76, 150] },
    margin: { left: 32, right: 32 },
  });
  doc.save(`${fileName}.pdf`);
}

function makeAudit(actor: string, action: string, target: string, detail: string) {
  return {
    id: createId("audit"),
    actor,
    action,
    target,
    at: nowText(),
    detail,
  };
}

function buildReconciliation(
  rekapRows: RekapBeli[],
  detailRows: DetailBeli[],
) {
  const detailBySj = new Map<string, DetailBeli[]>();
  detailRows.forEach((detail) => {
    const key = documentKey(detail.sjVendor);
    if (!key) {
      return;
    }
    const existing = detailBySj.get(key) ?? [];
    existing.push(detail);
    detailBySj.set(key, existing);
  });

  const rekapBySj = new Map<string, RekapBeli>();
  rekapRows.forEach((rekap) => {
    const key = documentKey(rekap.sjVendor);
    if (key) {
      rekapBySj.set(key, rekap);
    }
  });

  const updatedRekap = rekapRows.map((rekap) => {
    const matches = detailBySj.get(documentKey(rekap.sjVendor)) ?? [];
    const first = matches[0];
    return {
      ...rekap,
      grNo: first?.grNo || rekap.grNo,
      statusMatch: first ? "Match" : ("Belum Match" as RekapBeli["statusMatch"]),
    };
  });

  const updatedDetail = detailRows.map((detail) => {
    const rekap = rekapBySj.get(documentKey(detail.sjVendor));
    return {
      ...detail,
      noFakturPajak: rekap?.noFp || detail.noFakturPajak,
      statusMatch: rekap ? "Match" : ("Belum Match" as DetailBeli["statusMatch"]),
    };
  });

  const matchedRows: RekonsiliasiBeli[] = updatedRekap.flatMap((rekap) => {
    const matches = detailBySj.get(documentKey(rekap.sjVendor)) ?? [];
    if (!matches.length) {
      return [
        {
          id: createId("rekon"),
          sjVendor: rekap.sjVendor,
          noFp: rekap.noFp,
          grNo: rekap.grNo,
          namaPt: rekap.namaPt,
          vendor: "",
          tglFp: rekap.tglFp,
          tanggalTerimaGudang: "",
          dppRekap: rekap.dpp,
          dppDetail: 0,
          selisihDpp: rekap.dpp,
          status: "Belum Match",
          catatan: "SJ Vendor belum ditemukan di Detail Beli.",
        },
      ];
    }

    return matches.map((detail) => ({
      id: createId("rekon"),
      sjVendor: rekap.sjVendor,
      noFp: rekap.noFp,
      grNo: detail.grNo,
      namaPt: rekap.namaPt,
      vendor: detail.vendor,
      tglFp: rekap.tglFp,
      tanggalTerimaGudang: detail.tanggalTerimaGudang,
      dppRekap: rekap.dpp,
      dppDetail: detail.dpp,
      selisihDpp: rekap.dpp - detail.dpp,
      status: "Match",
      catatan: "Match berdasarkan SJ Vendor, lintas bulan diizinkan.",
    }));
  });

  const unmatchedDetails = updatedDetail
    .filter((detail) => detail.statusMatch !== "Match")
    .map((detail) => ({
      id: createId("rekon"),
      sjVendor: detail.sjVendor,
      noFp: detail.noFakturPajak,
      grNo: detail.grNo,
      namaPt: "",
      vendor: detail.vendor,
      tglFp: "",
      tanggalTerimaGudang: detail.tanggalTerimaGudang,
      dppRekap: 0,
      dppDetail: detail.dpp,
      selisihDpp: -detail.dpp,
      status: "Belum Match" as const,
      catatan: "Detail Beli tersimpan, tetapi belum ada Rekap Beli yang cocok.",
    }));

  return {
    updatedRekap,
    updatedDetail,
    rekonsiliasi: [...matchedRows, ...unmatchedDetails],
  };
}

function stockIdentityMatches(
  values: {
    gudang?: string;
    vendor?: string;
    customer?: string;
    kodeBarang?: string;
    namaBarang?: string;
    noDokumen?: string;
  },
  filters: FiltersState,
) {
  if (filters.gudang && values.gudang !== filters.gudang) {
    return false;
  }
  if (
    filters.vendor &&
    values.vendor !== filters.vendor &&
    values.customer !== filters.vendor
  ) {
    return false;
  }
  return includesSearch(
    [
      values.kodeBarang ?? "",
      values.namaBarang ?? "",
      values.noDokumen ?? "",
      values.vendor ?? "",
      values.customer ?? "",
    ],
    filters.search,
  );
}

function buildStockCardRows(db: DbState, filters: FiltersState) {
  const movements: Array<Omit<StockCardRow, "saldoQty"> & { sortDate: string }> =
    [];

  db.stockSaldoAwal.forEach((row) => {
    if (
      !stockIdentityMatches(
        {
          gudang: row.gudang,
          kodeBarang: row.kodeBarang,
          namaBarang: row.namaBarang,
          noDokumen: "SALDO AWAL",
        },
        filters,
      )
    ) {
      return;
    }
    movements.push({
      id: row.id,
      tanggal: "Saldo Awal",
      sortDate: "0000-00-00",
      gudang: row.gudang,
      kodeBarang: row.kodeBarang,
      namaBarang: row.namaBarang,
      noDokumen: "SALDO AWAL",
      pihak: "-",
      masukQty: row.saldoAwalQty,
      keluarQty: 0,
      harga: row.hargaAwal,
      nilai: row.nilaiAwal,
      keterangan: "Saldo awal stok",
    });
  });

  db.stockDetailBeli.forEach((row) => {
    if (
      !matchesDate(row.tanggalTerimaGudang, filters) ||
      !stockIdentityMatches(
        {
          gudang: row.gudang,
          vendor: row.vendor,
          kodeBarang: row.kodeBarang,
          namaBarang: row.namaBarang,
          noDokumen: row.grNo || row.sjVendor,
        },
        filters,
      )
    ) {
      return;
    }
    movements.push({
      id: row.id,
      tanggal: row.tanggalTerimaGudang,
      sortDate: row.tanggalTerimaGudang,
      gudang: row.gudang,
      kodeBarang: row.kodeBarang,
      namaBarang: row.namaBarang,
      noDokumen: row.grNo || row.sjVendor,
      pihak: row.vendor,
      masukQty: row.qtyStock,
      keluarQty: 0,
      harga: row.harga,
      nilai: row.qtyStock * row.harga,
      keterangan: row.keterangan,
    });
  });

  db.stockDetailJual.forEach((row) => {
    if (
      !matchesDate(row.tanggalKeluarGudang, filters) ||
      !stockIdentityMatches(
        {
          gudang: row.gudang,
          customer: row.customer,
          kodeBarang: row.kodeBarang,
          namaBarang: row.namaBarang,
          noDokumen: row.noDokumen,
        },
        filters,
      )
    ) {
      return;
    }
    movements.push({
      id: row.id,
      tanggal: row.tanggalKeluarGudang,
      sortDate: row.tanggalKeluarGudang,
      gudang: row.gudang,
      kodeBarang: row.kodeBarang,
      namaBarang: row.namaBarang,
      noDokumen: row.noDokumen,
      pihak: row.customer,
      masukQty: 0,
      keluarQty: row.qty,
      harga: row.harga,
      nilai: row.qty * row.harga,
      keterangan: row.keterangan,
    });
  });

  const balances = new Map<string, number>();
  return movements
    .sort((a, b) =>
      `${a.gudang}|${a.kodeBarang}|${a.sortDate}|${a.id}`.localeCompare(
        `${b.gudang}|${b.kodeBarang}|${b.sortDate}|${b.id}`,
      ),
    )
    .map((row) => {
      const key = `${row.gudang}|${row.kodeBarang}`;
      const saldo = (balances.get(key) ?? 0) + row.masukQty - row.keluarQty;
      balances.set(key, saldo);
      return {
        id: row.id,
        tanggal: row.tanggal,
        gudang: row.gudang,
        kodeBarang: row.kodeBarang,
        namaBarang: row.namaBarang,
        noDokumen: row.noDokumen,
        pihak: row.pihak,
        masukQty: row.masukQty,
        keluarQty: row.keluarQty,
        saldoQty: saldo,
        harga: row.harga,
        nilai: row.nilai,
        keterangan: row.keterangan,
      };
    });
}

function buildMutasiRows(db: DbState, filters: FiltersState) {
  const groups = new Map<string, MutasiRow>();

  function ensure(kodeBarang: string, namaBarang: string) {
    const key = `${kodeBarang}|${namaBarang}`;
    const current = groups.get(key);
    if (current) {
      return current;
    }
    const next: MutasiRow = {
      id: key,
      kodeBarang,
      namaBarang,
      saldoAwal: 0,
      qtyMasuk: 0,
      qtyKeluar: 0,
      saldoAkhir: 0,
      nilaiAwal: 0,
      nilaiMasuk: 0,
      nilaiKeluar: 0,
      nilaiAkhir: 0,
    };
    groups.set(key, next);
    return next;
  }

  db.stockSaldoAwal.forEach((row) => {
    if (
      !stockIdentityMatches(
        {
          gudang: row.gudang,
          kodeBarang: row.kodeBarang,
          namaBarang: row.namaBarang,
        },
        filters,
      )
    ) {
      return;
    }
    const group = ensure(row.kodeBarang, row.namaBarang);
    group.saldoAwal += row.saldoAwalQty;
    group.nilaiAwal += row.nilaiAwal;
  });

  db.stockDetailBeli.forEach((row) => {
    if (
      !matchesDate(row.tanggalTerimaGudang, filters) ||
      !stockIdentityMatches(
        {
          gudang: row.gudang,
          vendor: row.vendor,
          kodeBarang: row.kodeBarang,
          namaBarang: row.namaBarang,
        },
        filters,
      )
    ) {
      return;
    }
    const group = ensure(row.kodeBarang, row.namaBarang);
    group.qtyMasuk += row.qtyStock;
    group.nilaiMasuk += row.qtyStock * row.harga;
  });

  db.stockDetailJual.forEach((row) => {
    if (
      !matchesDate(row.tanggalKeluarGudang, filters) ||
      !stockIdentityMatches(
        {
          gudang: row.gudang,
          customer: row.customer,
          kodeBarang: row.kodeBarang,
          namaBarang: row.namaBarang,
        },
        filters,
      )
    ) {
      return;
    }
    const group = ensure(row.kodeBarang, row.namaBarang);
    group.qtyKeluar += row.qty;
    group.nilaiKeluar += row.qty * row.harga;
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    saldoAkhir: group.saldoAwal + group.qtyMasuk - group.qtyKeluar,
    nilaiAkhir: group.nilaiAwal + group.nilaiMasuk - group.nilaiKeluar,
  }));
}

function DataTable<T>({
  columns,
  rows,
  pageSize = 20,
  emptyText = "Data belum tersedia.",
}: {
  columns: TableColumn<T>[];
  rows: T[];
  pageSize?: number;
  emptyText?: string;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [rows.length, pageSize]);

  return (
    <div className="table-frame">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.align ?? "left"}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? (
              pageRows.map((row, rowIndex) => (
                <tr key={(row as { id?: string }).id ?? `${start}-${rowIndex}`}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.align ?? "left"}>
                      {column.render
                        ? column.render(row, start + rowIndex)
                        : String(
                            (row as Record<string, string | number | undefined>)[
                              column.key
                            ] ?? "",
                          )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-cell">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          {rows.length ? start + 1 : 0}-{Math.min(start + pageSize, rows.length)} dari{" "}
          {rows.length} baris
        </span>
        <div className="pager">
          <button
            className="icon-button"
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            aria-label="Sebelumnya"
            title="Sebelumnya"
          >
            Prev
          </button>
          <span>
            {currentPage}/{totalPages}
          </span>
          <button
            className="icon-button"
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            aria-label="Berikutnya"
            title="Berikutnya"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function BrandLogo() {
  return (
    <span
      className="brand-logo"
      role="img"
      aria-label="Logo PT. Berdikari Berkah Mulia"
    />
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: ComponentType<{ size?: number }>;
  tone: string;
}) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-icon">
        <Icon size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </article>
  );
}

export function StockClaimApp() {
  const [loaded, setLoaded] = useState(false);
  const [db, setDb] = useState<DbState>(() => seedDb());
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [menu, setMenu] = useState<MenuKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [filters, setFilters] = useState<FiltersState>({
    ...initialFilters,
    year: currentYear,
  });
  const [uploadMode, setUploadMode] = useState<UploadMode>("append");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadPreview, setUploadPreview] = useState<{
    title: string;
    rows: Array<Record<string, string | number>>;
  }>({ title: "", rows: [] });
  const [processingRekon, setProcessingRekon] = useState(false);
  const [activeMaster, setActiveMaster] = useState<MasterKey>("barang");
  const [masterForm, setMasterForm] = useState<MasterForm>(
    masterConfigs.barang.empty,
  );
  const [editingMasterId, setEditingMasterId] = useState("");
  const [claimForm, setClaimForm] = useState<Omit<MonitoringKlaim, "id">>({
    tanggalPengajuan: new Date().toISOString().slice(0, 10),
    divisi: "",
    yangMengajukan: "",
    jenisKlaim: "",
    noKlaim: "",
    noFakturPajak: "",
    tanggalFakturPajak: "",
    dpp: 0,
    ppn: 0,
    status: "Draft",
    keterangan: "",
    attachment: "",
  });
  const [editingClaimId, setEditingClaimId] = useState("");
  const [claimError, setClaimError] = useState("");
  const [reportKey, setReportKey] = useState<
    "kartu" | "mutasi" | "rekap" | "detail" | "rekon" | "klaim" | "dashboard"
  >("kartu");

  useEffect(() => {
    const storedDb = readStoredJson<DbState | null>(DB_KEY, null);
    if (storedDb) {
      setDb({
        ...seedDb(),
        ...storedDb,
        users: normalizeDefaultUsers(storedDb.users),
      });
    }

    const storedSession = readStoredJson<SessionUser | null>(SESSION_KEY, null);
    const activeSessions = getActiveSessions();
    if (activeSessions.admin) {
      delete activeSessions.admin;
      setActiveSessions(activeSessions);
    }
    if (
      storedSession &&
      activeSessions[storedSession.username] === storedSession.token
    ) {
      setSession(storedSession);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }

    const storedTheme = localStorage.getItem("stok-klaim-theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      writeStoredJson(DB_KEY, db);
    }
  }, [db, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("stok-klaim-theme", theme);
    }
  }, [theme, loaded]);

  useEffect(() => {
    setMasterForm(masterConfigs[activeMaster].empty);
    setEditingMasterId("");
  }, [activeMaster]);

  const addAudit = (action: string, target: string, detail: string) => {
    setDb((current) => ({
      ...current,
      auditLogs: [
        makeAudit(session?.username ?? "system", action, target, detail),
        ...current.auditLogs,
      ].slice(0, 100),
    }));
  };

  const canEdit = session?.role === "admin" || session?.allowInput;
  const canExport = session?.role === "admin" || session?.allowExport;
  const isAdmin = session?.role === "admin";

  const gudangOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...db.masterGudang.map((row) => row.namaGudang),
          ...db.stockDetailBeli.map((row) => row.gudang),
          ...db.stockDetailJual.map((row) => row.gudang),
          ...db.stockSaldoAwal.map((row) => row.gudang),
        ]),
      ).filter(Boolean),
    [db],
  );

  const partyOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...db.masterVendor.map((row) => row.namaVendor),
          ...db.masterPihak.map((row) => row.namaPihak),
          ...db.stockDetailBeli.map((row) => row.vendor),
          ...db.stockDetailJual.map((row) => row.customer),
        ]),
      ).filter(Boolean),
    [db],
  );

  const filteredRekap = useMemo(
    () =>
      db.stockRekapBeli.filter((row) => {
        const dateField = filters.dateBasis === "fp" ? row.tglFp : "";
        const dateOk =
          filters.dateBasis === "fp"
            ? matchesDate(dateField, filters)
            : matchesDate(row.tglFp, { ...filters, year: "", month: "" }, true);
        return (
          dateOk &&
          (!filters.vendor || row.namaPt === filters.vendor) &&
          includesSearch(
            [row.namaPt, row.noFp, row.sjVendor, row.grNo, row.catatan],
            filters.search,
          )
        );
      }),
    [db.stockRekapBeli, filters],
  );

  const filteredDetailBeli = useMemo(
    () =>
      db.stockDetailBeli.filter(
        (row) =>
          matchesDate(row.tanggalTerimaGudang, filters) &&
          stockIdentityMatches(
            {
              gudang: row.gudang,
              vendor: row.vendor,
              kodeBarang: row.kodeBarang,
              namaBarang: row.namaBarang,
              noDokumen: row.grNo || row.sjVendor,
            },
            filters,
          ),
      ),
    [db.stockDetailBeli, filters],
  );

  const filteredKlaim = useMemo(
    () =>
      db.monitoringKlaim.filter(
        (row) =>
          matchesDate(row.tanggalPengajuan, filters) &&
          includesSearch(
            [
              row.noKlaim,
              row.noFakturPajak,
              row.divisi,
              row.yangMengajukan,
              row.jenisKlaim,
              row.status,
            ],
            filters.search,
          ),
      ),
    [db.monitoringKlaim, filters],
  );

  const stockCardRows = useMemo(
    () => buildStockCardRows(db, filters),
    [db, filters],
  );

  const mutasiRows = useMemo(() => buildMutasiRows(db, filters), [db, filters]);

  const dashboard = useMemo(() => {
    const totalMasuk = filteredDetailBeli.reduce(
      (sum, row) => sum + row.qtyStock,
      0,
    );
    const totalKeluar = db.stockDetailJual
      .filter(
        (row) =>
          matchesDate(row.tanggalKeluarGudang, filters) &&
          stockIdentityMatches(
            {
              gudang: row.gudang,
              customer: row.customer,
              kodeBarang: row.kodeBarang,
              namaBarang: row.namaBarang,
              noDokumen: row.noDokumen,
            },
            filters,
          ),
      )
      .reduce((sum, row) => sum + row.qty, 0);
    const nilaiStok = mutasiRows.reduce((sum, row) => sum + row.nilaiAkhir, 0);
    const match = db.stockRekonsiliasiBeli.filter(
      (row) => row.status === "Match",
    ).length;
    const belumMatch = db.stockRekonsiliasiBeli.filter(
      (row) => row.status !== "Match",
    ).length;
    return {
      totalItem: db.masterBarang.filter((row) => row.status === "aktif").length,
      totalMasuk,
      totalKeluar,
      saldoQty: mutasiRows.reduce((sum, row) => sum + row.saldoAkhir, 0),
      nilaiStok,
      rekapCount: filteredRekap.length,
      detailCount: filteredDetailBeli.length,
      match,
      belumMatch,
      klaimAktif: filteredKlaim.filter(
        (row) => !["Selesai", "Ditolak"].includes(row.status),
      ).length,
      klaimSelesai: filteredKlaim.filter((row) => row.status === "Selesai")
        .length,
      klaimDokumenKurang: filteredKlaim.filter(
        (row) => !row.attachment.trim(),
      ).length,
    };
  }, [db, filteredDetailBeli, filteredKlaim, filteredRekap, filters, mutasiRows]);

  const rekapColumns: TableColumn<RekapBeli>[] = [
    { key: "no", label: "NO" },
    { key: "namaPt", label: "NAMA PT" },
    { key: "tglFp", label: "TGL FP" },
    { key: "noFp", label: "NO FP" },
    { key: "sjVendor", label: "SJ VENDOR" },
    {
      key: "dpp",
      label: "DPP",
      align: "right",
      render: (row) => formatMoney(row.dpp),
      exportValue: (row) => row.dpp,
    },
    { key: "grNo", label: "GR NO" },
    {
      key: "statusMatch",
      label: "STATUS",
      render: (row) => (
        <Badge tone={row.statusMatch === "Match" ? "success" : "warning"}>
          {row.statusMatch}
        </Badge>
      ),
    },
  ];

  const detailBeliColumns: TableColumn<DetailBeli>[] = [
    { key: "tanggalTerimaGudang", label: "TGL GUDANG" },
    { key: "gudang", label: "GUDANG" },
    { key: "grNo", label: "GR NO" },
    { key: "poNo", label: "PO NO" },
    { key: "sjVendor", label: "SJ VENDOR" },
    { key: "vendor", label: "VENDOR" },
    { key: "kodeBarang", label: "KODE" },
    { key: "namaBarang", label: "BARANG" },
    {
      key: "qtyStock",
      label: "QTY STOCK",
      align: "right",
      render: (row) => formatQty(row.qtyStock),
      exportValue: (row) => row.qtyStock,
    },
    {
      key: "harga",
      label: "HARGA",
      align: "right",
      render: (row) => formatMoney(row.harga),
      exportValue: (row) => row.harga,
    },
    { key: "noFakturPajak", label: "NO FP" },
    {
      key: "statusMatch",
      label: "STATUS",
      render: (row) => (
        <Badge tone={row.statusMatch === "Match" ? "success" : "warning"}>
          {row.statusMatch}
        </Badge>
      ),
    },
  ];

  const rekonsiliasiColumns: TableColumn<RekonsiliasiBeli>[] = [
    { key: "sjVendor", label: "SJ VENDOR" },
    { key: "noFp", label: "NO FP" },
    { key: "grNo", label: "GR NO" },
    { key: "tglFp", label: "TGL FP" },
    { key: "tanggalTerimaGudang", label: "TGL GUDANG" },
    { key: "vendor", label: "VENDOR" },
    {
      key: "dppRekap",
      label: "DPP REKAP",
      align: "right",
      render: (row) => formatMoney(row.dppRekap),
      exportValue: (row) => row.dppRekap,
    },
    {
      key: "dppDetail",
      label: "DPP DETAIL",
      align: "right",
      render: (row) => formatMoney(row.dppDetail),
      exportValue: (row) => row.dppDetail,
    },
    {
      key: "selisihDpp",
      label: "SELISIH",
      align: "right",
      render: (row) => formatMoney(row.selisihDpp),
      exportValue: (row) => row.selisihDpp,
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <Badge tone={row.status === "Match" ? "success" : "warning"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  const stockCardColumns: TableColumn<StockCardRow>[] = [
    { key: "tanggal", label: "TANGGAL" },
    { key: "gudang", label: "GUDANG" },
    { key: "kodeBarang", label: "KODE" },
    { key: "namaBarang", label: "BARANG" },
    { key: "noDokumen", label: "NO DOKUMEN" },
    { key: "pihak", label: "PIHAK" },
    {
      key: "masukQty",
      label: "MASUK",
      align: "right",
      render: (row) => formatQty(row.masukQty),
      exportValue: (row) => row.masukQty,
    },
    {
      key: "keluarQty",
      label: "KELUAR",
      align: "right",
      render: (row) => formatQty(row.keluarQty),
      exportValue: (row) => row.keluarQty,
    },
    {
      key: "saldoQty",
      label: "SALDO",
      align: "right",
      render: (row) => formatQty(row.saldoQty),
      exportValue: (row) => row.saldoQty,
    },
    {
      key: "harga",
      label: "HARGA",
      align: "right",
      render: (row) => formatMoney(row.harga),
      exportValue: (row) => row.harga,
    },
    {
      key: "nilai",
      label: "NILAI",
      align: "right",
      render: (row) => formatMoney(row.nilai),
      exportValue: (row) => row.nilai,
    },
    { key: "keterangan", label: "KETERANGAN" },
  ];

  const mutasiColumns: TableColumn<MutasiRow>[] = [
    { key: "kodeBarang", label: "KODE" },
    { key: "namaBarang", label: "BARANG" },
    {
      key: "saldoAwal",
      label: "SALDO AWAL",
      align: "right",
      render: (row) => formatQty(row.saldoAwal),
      exportValue: (row) => row.saldoAwal,
    },
    {
      key: "qtyMasuk",
      label: "MASUK",
      align: "right",
      render: (row) => formatQty(row.qtyMasuk),
      exportValue: (row) => row.qtyMasuk,
    },
    {
      key: "qtyKeluar",
      label: "KELUAR",
      align: "right",
      render: (row) => formatQty(row.qtyKeluar),
      exportValue: (row) => row.qtyKeluar,
    },
    {
      key: "saldoAkhir",
      label: "SALDO AKHIR",
      align: "right",
      render: (row) => formatQty(row.saldoAkhir),
      exportValue: (row) => row.saldoAkhir,
    },
    {
      key: "nilaiAwal",
      label: "NILAI AWAL",
      align: "right",
      render: (row) => formatMoney(row.nilaiAwal),
      exportValue: (row) => row.nilaiAwal,
    },
    {
      key: "nilaiMasuk",
      label: "NILAI MASUK",
      align: "right",
      render: (row) => formatMoney(row.nilaiMasuk),
      exportValue: (row) => row.nilaiMasuk,
    },
    {
      key: "nilaiKeluar",
      label: "NILAI KELUAR",
      align: "right",
      render: (row) => formatMoney(row.nilaiKeluar),
      exportValue: (row) => row.nilaiKeluar,
    },
    {
      key: "nilaiAkhir",
      label: "NILAI AKHIR",
      align: "right",
      render: (row) => formatMoney(row.nilaiAkhir),
      exportValue: (row) => row.nilaiAkhir,
    },
  ];

  const klaimColumns: TableColumn<MonitoringKlaim>[] = [
    { key: "tanggalPengajuan", label: "TGL PENGAJUAN" },
    { key: "divisi", label: "DIVISI" },
    { key: "yangMengajukan", label: "PENGAJU" },
    { key: "jenisKlaim", label: "JENIS" },
    { key: "noKlaim", label: "NO KLAIM" },
    { key: "noFakturPajak", label: "NO FP" },
    {
      key: "dpp",
      label: "DPP",
      align: "right",
      render: (row) => formatMoney(row.dpp),
      exportValue: (row) => row.dpp,
    },
    {
      key: "ppn",
      label: "PPN",
      align: "right",
      render: (row) => formatMoney(row.ppn),
      exportValue: (row) => row.ppn,
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <Badge
          tone={
            row.status === "Selesai"
              ? "success"
              : row.status === "Ditolak"
                ? "danger"
                : "info"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    { key: "attachment", label: "ATTACHMENT" },
    {
      key: "actions",
      label: "AKSI",
      render: (row) => (
        <button
          className="icon-button"
          type="button"
          onClick={() => editClaim(row)}
          disabled={!canEdit}
          aria-label={`Edit ${row.noKlaim}`}
          title="Edit klaim"
        >
          <Edit3 size={14} />
        </button>
      ),
    },
  ];

  function handleLogin() {
    const username = loginUsername.trim();
    const user = db.users.find(
      (item) =>
        item.username.toLowerCase() === username.toLowerCase() &&
        item.active,
    );
    if (!user || user.password !== loginPassword) {
      setLoginError("Username atau password tidak sesuai.");
      return;
    }
    const active = getActiveSessions();
    if (active[user.username]) {
      setLoginError("Username ini masih aktif di device lain. Logout dulu atau reset sesi dari admin.");
      return;
    }
    const token = createId("session");
    active[user.username] = token;
    setActiveSessions(active);
    const nextSession: SessionUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      allowInput: user.allowInput,
      allowExport: user.allowExport,
      token,
    };
    writeStoredJson(SESSION_KEY, nextSession);
    setSession(nextSession);
    setLoginError("");
  }

  function logout() {
    if (session) {
      const active = getActiveSessions();
      if (active[session.username] === session.token) {
        delete active[session.username];
        setActiveSessions(active);
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  function resetFilters() {
    setFilters({ ...initialFilters, year: currentYear });
  }

  function updateFilter(key: keyof FiltersState, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function downloadTemplate(type: UploadType) {
    const definition = uploadDefinitions[type];
    const rows = [definition.requiredHeaders, definition.sample];
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!cols"] = definition.requiredHeaders.map((header) => ({
      wch: Math.max(14, header.length + 4),
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, definition.label.slice(0, 31));
    XLSX.writeFile(workbook, definition.fileName, { bookType: "xlsx" });
  }

  async function handleUpload(type: UploadType, file: File | null) {
    if (!file) {
      return;
    }
    if (!canEdit) {
      setUploadStatus("User ini tidak punya akses upload/input.");
      return;
    }

    const definition = uploadDefinitions[type];
    const batchId = createId("batch");
    setUploadStatus(`Membaca ${file.name}...`);
    try {
      const parsed = await parseSheet(file);
      const missing = definition.requiredHeaders.filter(
        (header) => !hasHeader(parsed.headers, header),
      );
      if (missing.length) {
        throw new Error(`Kolom wajib belum ada: ${missing.join(", ")}`);
      }

      let mappedRows = parsed.rows
        .filter((row) =>
          Object.values(row).some((value) => normalizeExcelText(value).trim()),
        )
        .map((row, index) => definition.mapRow(row, batchId, index + 2));

      let duplicateMessage = "";
      if (type === "klaim") {
        const seen = new Set(
          (uploadMode === "replace" ? [] : db.monitoringKlaim).map((row) =>
            documentKey(row.noKlaim),
          ),
        );
        const uniqueRows: MonitoringKlaim[] = [];
        const duplicates: string[] = [];
        (mappedRows as MonitoringKlaim[]).forEach((row) => {
          const key = documentKey(row.noKlaim);
          if (!key || seen.has(key)) {
            duplicates.push(row.noKlaim || `row ${row.sourceRow ?? ""}`);
            return;
          }
          seen.add(key);
          uniqueRows.push(row);
        });
        mappedRows = uniqueRows;
        if (duplicates.length) {
          duplicateMessage = ` Duplikat No Klaim dilewati: ${duplicates.join(", ")}.`;
        }
      }

      const batch: UploadBatch = {
        id: batchId,
        template: definition.label,
        fileName: file.name,
        sheetName: parsed.sheetName,
        rowsSaved: mappedRows.length,
        uploadedBy: session?.username ?? "-",
        uploadedAt: nowText(),
        status: "Berhasil",
        mode: uploadMode,
        message: `Upload ${uploadMode === "replace" ? "replace" : "append"} berhasil.${duplicateMessage}`,
      };

      setDb((current) => {
        const currentRows = current[definition.stateKey] as Array<
          RekapBeli | DetailBeli | DetailJual | SaldoAwal | MonitoringKlaim
        >;
        const nextRows =
          uploadMode === "replace" ? mappedRows : [...currentRows, ...mappedRows];
        const nextState = {
          ...current,
          [definition.stateKey]: nextRows,
          uploadBatches: [batch, ...current.uploadBatches],
          auditLogs: [
            makeAudit(
              session?.username ?? "system",
              "upload",
              definition.label,
              `${mappedRows.length} rows from ${file.name}`,
            ),
            ...current.auditLogs,
          ],
        } as DbState;

        if (type === "rekapBeli" || type === "detailBeli") {
          nextState.stockRekonsiliasiBeli = [];
        }
        return nextState;
      });

      setUploadPreview({
        title: `${definition.label} - ${mappedRows.length} baris`,
        rows: mappedRows.slice(0, 500).map((row) => row as Record<string, string | number>),
      });
      setUploadStatus(batch.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload gagal.";
      const batch: UploadBatch = {
        id: batchId,
        template: definition.label,
        fileName: file.name,
        sheetName: "-",
        rowsSaved: 0,
        uploadedBy: session?.username ?? "-",
        uploadedAt: nowText(),
        status: "Gagal",
        mode: uploadMode,
        message,
      };
      setDb((current) => ({
        ...current,
        uploadBatches: [batch, ...current.uploadBatches],
      }));
      setUploadStatus(message);
    }
  }

  function deleteUploadData(type: UploadType) {
    if (!isAdmin) {
      setUploadStatus("Hapus data hanya untuk admin.");
      return;
    }
    const definition = uploadDefinitions[type];
    setDb((current) => {
      const next = {
        ...current,
        [definition.stateKey]: [],
        auditLogs: [
          makeAudit(
            session?.username ?? "system",
            "delete",
            definition.label,
            "Data template dikosongkan oleh admin.",
          ),
          ...current.auditLogs,
        ],
      } as DbState;
      if (type === "rekapBeli" || type === "detailBeli") {
        next.stockRekonsiliasiBeli = [];
      }
      return next;
    });
    setUploadStatus(`${definition.label} dikosongkan.`);
  }

  function processReconciliation() {
    if (processingRekon) {
      return;
    }
    setProcessingRekon(true);
    window.setTimeout(() => {
      setDb((current) => {
        const result = buildReconciliation(
          current.stockRekapBeli,
          current.stockDetailBeli,
        );
        return {
          ...current,
          stockRekapBeli: result.updatedRekap,
          stockDetailBeli: result.updatedDetail,
          stockRekonsiliasiBeli: result.rekonsiliasi,
          auditLogs: [
            makeAudit(
              session?.username ?? "system",
              "process",
              "rekonsiliasi beli",
              `${result.rekonsiliasi.length} rows processed by SJ Vendor`,
            ),
            ...current.auditLogs,
          ],
        };
      });
      setProcessingRekon(false);
    }, 300);
  }

  function saveMaster() {
    if (!canEdit) {
      return;
    }
    const config = masterConfigs[activeMaster];
    const stateKey = config.stateKey as MasterStateKey;
    const payload = {
      ...masterForm,
      status: (masterForm.status || "aktif") as StatusAktif,
    };
    const primaryValue = payload[config.primary];
    if (!primaryValue?.trim()) {
      return;
    }
    setDb((current) => {
      const rows = current[stateKey] as Array<Record<string, string>>;
      const nextRows = editingMasterId
        ? rows.map((row) =>
            row.id === editingMasterId ? { ...row, ...payload } : row,
          )
        : [{ id: createId(activeMaster), ...payload }, ...rows];
      return {
        ...current,
        [stateKey]: nextRows,
        auditLogs: [
          makeAudit(
            session?.username ?? "system",
            editingMasterId ? "edit" : "create",
            config.label,
            primaryValue,
          ),
          ...current.auditLogs,
        ],
      } as DbState;
    });
    setMasterForm(config.empty);
    setEditingMasterId("");
  }

  function editMaster(row: Record<string, string>) {
    setMasterForm({ ...masterConfigs[activeMaster].empty, ...row });
    setEditingMasterId(row.id);
  }

  function toggleMasterStatus(row: Record<string, string>) {
    if (!isAdmin) {
      return;
    }
    const config = masterConfigs[activeMaster];
    const stateKey = config.stateKey as MasterStateKey;
    setDb((current) => {
      const rows = current[stateKey] as Array<Record<string, string>>;
      return {
        ...current,
        [stateKey]: rows.map((item) =>
          item.id === row.id
            ? {
                ...item,
                status: item.status === "aktif" ? "nonaktif" : "aktif",
              }
            : item,
        ),
        auditLogs: [
          makeAudit(
            session?.username ?? "system",
            "toggle",
            config.label,
            row[config.primary] ?? row.id,
          ),
          ...current.auditLogs,
        ],
      } as DbState;
    });
  }

  async function importMaster(file: File | null) {
    if (!file || !canEdit) {
      return;
    }
    const config = masterConfigs[activeMaster];
    const parsed = await parseSheet(file);
    const rows = parsed.rows.map((row) => {
      const item: Record<string, string> = {
        id: createId(activeMaster),
        status: getCell(row, "STATUS") || "aktif",
      };
      config.fields.forEach(([key, label]) => {
        item[key] = getCell(row, label);
      });
      return item;
    });
    setDb((current) => {
      const stateKey = config.stateKey as MasterStateKey;
      const currentRows = current[stateKey] as Array<Record<string, string>>;
      return {
        ...current,
        [stateKey]: [...rows, ...currentRows],
        auditLogs: [
          makeAudit(
            session?.username ?? "system",
            "import",
            config.label,
            `${rows.length} rows from ${file.name}`,
          ),
          ...current.auditLogs,
        ],
      } as DbState;
    });
  }

  function saveClaim() {
    if (!canEdit) {
      return;
    }
    const noKlaimKey = documentKey(claimForm.noKlaim);
    if (!noKlaimKey) {
      setClaimError("No Klaim wajib diisi.");
      return;
    }
    const duplicate = db.monitoringKlaim.some(
      (row) => row.id !== editingClaimId && documentKey(row.noKlaim) === noKlaimKey,
    );
    if (duplicate) {
      setClaimError("No Klaim sudah ada. Data tidak disimpan dobel.");
      return;
    }
    setDb((current) => ({
      ...current,
      monitoringKlaim: editingClaimId
        ? current.monitoringKlaim.map((row) =>
            row.id === editingClaimId ? { ...row, ...claimForm } : row,
          )
        : [{ id: createId("klaim"), ...claimForm }, ...current.monitoringKlaim],
      auditLogs: [
        makeAudit(
          session?.username ?? "system",
          editingClaimId ? "edit" : "create",
          "monitoring klaim",
          claimForm.noKlaim,
        ),
        ...current.auditLogs,
      ],
    }));
    setClaimForm({
      tanggalPengajuan: new Date().toISOString().slice(0, 10),
      divisi: "",
      yangMengajukan: "",
      jenisKlaim: "",
      noKlaim: "",
      noFakturPajak: "",
      tanggalFakturPajak: "",
      dpp: 0,
      ppn: 0,
      status: "Draft",
      keterangan: "",
      attachment: "",
    });
    setEditingClaimId("");
    setClaimError("");
  }

  function editClaim(row: MonitoringKlaim) {
    setClaimForm({
      tanggalPengajuan: row.tanggalPengajuan,
      divisi: row.divisi,
      yangMengajukan: row.yangMengajukan,
      jenisKlaim: row.jenisKlaim,
      noKlaim: row.noKlaim,
      noFakturPajak: row.noFakturPajak,
      tanggalFakturPajak: row.tanggalFakturPajak,
      dpp: row.dpp,
      ppn: row.ppn,
      status: row.status,
      keterangan: row.keterangan,
      attachment: row.attachment,
    });
    setEditingClaimId(row.id);
    setMenu("klaim");
  }

  function lookupClaimFp() {
    const rekap = db.stockRekapBeli.find(
      (row) => documentKey(row.noFp) === documentKey(claimForm.noFakturPajak),
    );
    if (!rekap) {
      setClaimError("No Faktur Pajak belum ditemukan di Rekap Beli.");
      return;
    }
    setClaimForm((current) => ({
      ...current,
      tanggalFakturPajak: rekap.tglFp,
      dpp: rekap.dpp,
      ppn: Math.round(rekap.dpp * 0.11),
    }));
    setClaimError("");
  }

  function resetAllData() {
    if (!isAdmin) {
      return;
    }
    const fresh = seedDb();
    setDb({
      ...fresh,
      auditLogs: [
        makeAudit(session?.username ?? "system", "reset", "database", "Seed data restored."),
        ...fresh.auditLogs,
      ],
    });
  }

  function resetActiveSessions() {
    if (!isAdmin) {
      return;
    }
    const next: Record<string, string> = {};
    if (session) {
      next[session.username] = session.token;
    }
    setActiveSessions(next);
    addAudit("reset", "active sessions", "Admin cleared stale login sessions.");
  }

  function exportCurrentReport(asPdf = false) {
    if (!canExport) {
      return;
    }
    const report = getReportRows();
    if (asPdf) {
      exportPdf(report.fileName, report.title, report.columns, report.rows);
      return;
    }
    exportExcel(report.fileName, report.title, report.columns, report.rows);
  }

  function getReportRows() {
    if (reportKey === "mutasi") {
      return {
        title: "Mutasi Stok",
        fileName: "MUTASI_STOK",
        columns: mutasiColumns,
        rows: mutasiRows,
      };
    }
    if (reportKey === "rekap") {
      return {
        title: "Rekap Beli",
        fileName: "REKAP_BELI_REPORT",
        columns: rekapColumns,
        rows: filteredRekap,
      };
    }
    if (reportKey === "detail") {
      return {
        title: "Detail Beli",
        fileName: "DETAIL_BELI_REPORT",
        columns: detailBeliColumns,
        rows: filteredDetailBeli,
      };
    }
    if (reportKey === "rekon") {
      return {
        title: "Rekonsiliasi Beli",
        fileName: "REKONSILIASI_BELI",
        columns: rekonsiliasiColumns,
        rows: db.stockRekonsiliasiBeli,
      };
    }
    if (reportKey === "klaim") {
      return {
        title: "Monitoring Klaim",
        fileName: "MONITORING_KLAIM",
        columns: klaimColumns.filter((column) => column.key !== "actions"),
        rows: filteredKlaim,
      };
    }
    if (reportKey === "dashboard") {
      const rows = [
        { id: "totalItem", metric: "Total item/barang", value: dashboard.totalItem },
        { id: "totalMasuk", metric: "Total qty stok masuk", value: dashboard.totalMasuk },
        { id: "totalKeluar", metric: "Total qty stok keluar", value: dashboard.totalKeluar },
        { id: "saldoQty", metric: "Saldo qty stok", value: dashboard.saldoQty },
        { id: "nilaiStok", metric: "Total nilai stok", value: dashboard.nilaiStok },
        { id: "rekapCount", metric: "Jumlah rekap beli", value: dashboard.rekapCount },
        { id: "detailCount", metric: "Jumlah detail beli", value: dashboard.detailCount },
        { id: "match", metric: "Faktur/SJ match", value: dashboard.match },
        { id: "belumMatch", metric: "Faktur/SJ belum match", value: dashboard.belumMatch },
        { id: "klaimAktif", metric: "Klaim aktif", value: dashboard.klaimAktif },
        { id: "klaimSelesai", metric: "Klaim selesai", value: dashboard.klaimSelesai },
        {
          id: "klaimDokumenKurang",
          metric: "Klaim dokumen belum lengkap",
          value: dashboard.klaimDokumenKurang,
        },
      ];
      return {
        title: "Summary Dashboard",
        fileName: "SUMMARY_DASHBOARD",
        columns: [
          { key: "metric", label: "METRIC" },
          { key: "value", label: "VALUE", align: "right" as const },
        ],
        rows,
      };
    }
    return {
      title: "Kartu Stok",
      fileName: "KARTU_STOK",
      columns: stockCardColumns,
      rows: stockCardRows,
    };
  }

  function renderFilters() {
    return (
      <section className="filter-band" aria-label="Filter data">
        <div className="filter-title">
          <Filter size={16} />
          <span>Filter</span>
        </div>
        <label>
          Tahun
          <input
            value={filters.year}
            onChange={(event) => updateFilter("year", event.target.value)}
            placeholder="Semua"
          />
        </label>
        <label>
          Bulan
          <select
            value={filters.month}
            onChange={(event) => updateFilter("month", event.target.value)}
          >
            <option value="">Semua</option>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={String(index + 1).padStart(2, "0")}>
                {String(index + 1).padStart(2, "0")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dari
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => updateFilter("startDate", event.target.value)}
          />
        </label>
        <label>
          Sampai
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => updateFilter("endDate", event.target.value)}
          />
        </label>
        <label>
          Gudang
          <select
            value={filters.gudang}
            onChange={(event) => updateFilter("gudang", event.target.value)}
          >
            <option value="">Semua</option>
            {gudangOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vendor/Customer
          <select
            value={filters.vendor}
            onChange={(event) => updateFilter("vendor", event.target.value)}
          >
            <option value="">Semua</option>
            {partyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Basis Tanggal
          <select
            value={filters.dateBasis}
            onChange={(event) =>
              updateFilter("dateBasis", event.target.value as DateBasis)
            }
          >
            <option value="gudang">Tanggal Gudang</option>
            <option value="fp">Tanggal FP</option>
          </select>
        </label>
        <label className="search-field">
          Search
          <span>
            <Search size={14} />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Barang, dokumen, pihak"
            />
          </span>
        </label>
        <button className="icon-button" type="button" onClick={resetFilters}>
          <RefreshCw size={14} />
          Reset
        </button>
      </section>
    );
  }

  function renderDashboard() {
    const cards = [
      {
        label: "Total Item",
        value: String(dashboard.totalItem),
        detail: "master aktif",
        icon: Package,
        tone: "blue",
      },
      {
        label: "Qty Masuk",
        value: formatQty(dashboard.totalMasuk),
        detail: "Detail Beli",
        icon: PackagePlus,
        tone: "green",
      },
      {
        label: "Qty Keluar",
        value: formatQty(dashboard.totalKeluar),
        detail: "Detail Jual",
        icon: Activity,
        tone: "red",
      },
      {
        label: "Saldo Qty",
        value: formatQty(dashboard.saldoQty),
        detail: "stok akhir",
        icon: Warehouse,
        tone: "slate",
      },
      {
        label: "Nilai Stok",
        value: formatMoney(dashboard.nilaiStok),
        detail: "estimasi HPP",
        icon: Database,
        tone: "blue",
      },
      {
        label: "Rekap Beli",
        value: String(dashboard.rekapCount),
        detail: "baris filter",
        icon: FileSpreadsheet,
        tone: "slate",
      },
      {
        label: "Detail Beli",
        value: String(dashboard.detailCount),
        detail: "baris filter",
        icon: ClipboardList,
        tone: "green",
      },
      {
        label: "SJ/FP Match",
        value: String(dashboard.match),
        detail: `${dashboard.belumMatch} belum match`,
        icon: CheckCircle2,
        tone: dashboard.belumMatch ? "red" : "green",
      },
      {
        label: "Klaim Aktif",
        value: String(dashboard.klaimAktif),
        detail: `${dashboard.klaimSelesai} selesai`,
        icon: ListChecks,
        tone: "blue",
      },
      {
        label: "Dokumen Klaim",
        value: String(dashboard.klaimDokumenKurang),
        detail: "belum lengkap",
        icon: FileText,
        tone: dashboard.klaimDokumenKurang ? "red" : "green",
      },
    ];

    return (
      <>
        {renderFilters()}
        <section className="stats-grid">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>
        <section className="content-section split-grid">
          <div>
            <div className="section-heading">
              <h2>Rekonsiliasi Terakhir</h2>
              <button
                className="primary-button"
                type="button"
                onClick={processReconciliation}
                disabled={processingRekon}
              >
                <RefreshCw size={14} />
                {processingRekon ? "Proses..." : "Proses"}
              </button>
            </div>
            <DataTable
              columns={rekonsiliasiColumns}
              rows={db.stockRekonsiliasiBeli}
              pageSize={8}
            />
          </div>
          <div>
            <div className="section-heading">
              <h2>Klaim Aktif</h2>
              <button
                className="icon-button"
                type="button"
                onClick={() => setMenu("klaim")}
              >
                <ListChecks size={14} />
                Buka
              </button>
            </div>
            <DataTable
              columns={klaimColumns.filter((column) => column.key !== "actions")}
              rows={filteredKlaim.filter(
                (row) => !["Selesai", "Ditolak"].includes(row.status),
              )}
              pageSize={8}
            />
          </div>
        </section>
      </>
    );
  }

  function renderMaster() {
    const config = masterConfigs[activeMaster];
    const rows = db[config.stateKey] as Array<Record<string, string>>;
    const filteredRows = rows.filter((row) =>
      includesSearch(Object.values(row), filters.search),
    );
    const columns: TableColumn<Record<string, string>>[] = [
      ...config.fields.map(([key, label]) => ({ key, label })),
      {
        key: "status",
        label: "STATUS",
        render: (row) => (
          <Badge tone={row.status === "aktif" ? "success" : "muted"}>
            {row.status}
          </Badge>
        ),
      },
      {
        key: "actions",
        label: "AKSI",
        render: (row) => (
          <div className="row-actions">
            <button
              className="icon-button"
              type="button"
              onClick={() => editMaster(row)}
              disabled={!canEdit}
              title="Edit"
              aria-label="Edit master"
            >
              <Edit3 size={14} />
            </button>
            <button
              className="icon-button danger"
              type="button"
              onClick={() => toggleMasterStatus(row)}
              disabled={!isAdmin}
              title="Aktif/nonaktif"
              aria-label="Aktif nonaktif"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ];

    return (
      <>
        <section className="tabs-band">
          {Object.entries(masterConfigs).map(([key, item]) => (
            <button
              key={key}
              className={activeMaster === key ? "tab active" : "tab"}
              type="button"
              onClick={() => setActiveMaster(key as MasterKey)}
            >
              {item.label.replace("Master ", "")}
            </button>
          ))}
        </section>
        <section className="content-section">
          <div className="section-heading">
            <h2>{config.label}</h2>
            <div className="button-row">
              <label className="file-button">
                <UploadCloud size={14} />
                Import
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(event) => importMaster(event.target.files?.[0] ?? null)}
                  disabled={!canEdit}
                />
              </label>
              <button
                className="icon-button"
                type="button"
                onClick={() =>
                  exportExcel(config.label.replace(/\s+/g, "_").toUpperCase(), config.label, columns.filter((column) => column.key !== "actions"), filteredRows)
                }
                disabled={!canExport}
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>
          <div className="inline-form">
            {config.fields.map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  value={masterForm[key] ?? ""}
                  onChange={(event) =>
                    setMasterForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  disabled={!canEdit}
                />
              </label>
            ))}
            <label>
              Status
              <select
                value={masterForm.status ?? "aktif"}
                onChange={(event) =>
                  setMasterForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                disabled={!canEdit}
              >
                <option value="aktif">aktif</option>
                <option value="nonaktif">nonaktif</option>
              </select>
            </label>
            <button
              className="primary-button"
              type="button"
              onClick={saveMaster}
              disabled={!canEdit}
            >
              <Save size={14} />
              {editingMasterId ? "Update" : "Simpan"}
            </button>
            {editingMasterId ? (
              <button
                className="icon-button"
                type="button"
                onClick={() => {
                  setEditingMasterId("");
                  setMasterForm(config.empty);
                }}
              >
                <X size={14} />
                Batal
              </button>
            ) : null}
          </div>
          <DataTable columns={columns} rows={filteredRows} pageSize={18} />
        </section>
      </>
    );
  }

  function renderUpload() {
    return (
      <>
        <section className="upload-toolbar">
          <div className="segmented">
            <button
              className={uploadMode === "append" ? "active" : ""}
              type="button"
              onClick={() => setUploadMode("append")}
            >
              Tambah Batch
            </button>
            <button
              className={uploadMode === "replace" ? "active" : ""}
              type="button"
              onClick={() => setUploadMode("replace")}
            >
              Replace Data
            </button>
          </div>
          <span>{uploadStatus || "Upload siap. Preview memakai pagination 50 baris."}</span>
        </section>
        <section className="upload-grid">
          {(Object.keys(uploadDefinitions) as UploadType[]).map((key) => {
            const definition = uploadDefinitions[key];
            const rows = db[definition.stateKey] as unknown[];
            return (
              <article className="upload-card" key={key}>
                <div>
                  <FileSpreadsheet size={20} />
                  <strong>{definition.label}</strong>
                  <span>{rows.length} baris tersimpan</span>
                </div>
                <div className="button-row">
                  <label className="file-button">
                    <UploadCloud size={14} />
                    Pilih
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(event) =>
                        handleUpload(key, event.target.files?.[0] ?? null)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => downloadTemplate(key)}
                  >
                    <Download size={14} />
                    Template
                  </button>
                  <button
                    className="icon-button danger"
                    type="button"
                    onClick={() => deleteUploadData(key)}
                    disabled={!isAdmin}
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
                <Badge tone={rows.length ? "success" : "muted"}>
                  {rows.length ? "Berhasil" : "Belum ada data"}
                </Badge>
              </article>
            );
          })}
        </section>
        <section className="content-section">
          <div className="section-heading">
            <h2>{uploadPreview.title || "Preview Upload"}</h2>
            <Badge tone="info">50 baris per halaman</Badge>
          </div>
          <DataTable
            columns={
              uploadPreview.rows[0]
                ? Object.keys(uploadPreview.rows[0]).map((key) => ({
                    key,
                    label: normalizeHeader(key),
                  }))
                : [{ key: "blank", label: "DATA" }]
            }
            rows={
              uploadPreview.rows.length
                ? uploadPreview.rows
                : [{ id: "blank", blank: "Belum ada preview." }]
            }
            pageSize={50}
          />
        </section>
      </>
    );
  }

  function renderCekDetailBeli() {
    return (
      <>
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Cek Detail Beli</h2>
              <p>
                Basis match: SJ Vendor. TGL FP dan TGL Gudang disimpan terpisah.
              </p>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={processReconciliation}
              disabled={processingRekon}
            >
              <RefreshCw size={14} />
              {processingRekon ? "Memproses..." : "Proses"}
            </button>
          </div>
          <div className="summary-strip">
            <Badge tone="success">Match {dashboard.match}</Badge>
            <Badge tone={dashboard.belumMatch ? "warning" : "success"}>
              Belum Match {dashboard.belumMatch}
            </Badge>
            <Badge tone="info">Lintas bulan diizinkan</Badge>
          </div>
          <DataTable
            columns={rekonsiliasiColumns}
            rows={db.stockRekonsiliasiBeli}
            pageSize={20}
          />
        </section>
        <section className="content-section split-grid">
          <div>
            <div className="section-heading">
              <h2>Report Rekap Beli</h2>
            </div>
            <DataTable columns={rekapColumns} rows={filteredRekap} pageSize={10} />
          </div>
          <div>
            <div className="section-heading">
              <h2>Report Detail Beli</h2>
            </div>
            <DataTable
              columns={detailBeliColumns}
              rows={filteredDetailBeli}
              pageSize={10}
            />
          </div>
        </section>
      </>
    );
  }

  function renderKartuStok() {
    return (
      <>
        {renderFilters()}
        <section className="content-section">
          <div className="section-heading">
            <h2>Kartu Stok</h2>
            <button
              className="icon-button"
              type="button"
              onClick={() =>
                exportExcel("KARTU_STOK", "Kartu Stok", stockCardColumns, stockCardRows)
              }
              disabled={!canExport}
            >
              <Download size={14} />
              Excel
            </button>
          </div>
          <DataTable columns={stockCardColumns} rows={stockCardRows} pageSize={24} />
        </section>
      </>
    );
  }

  function renderMutasiStok() {
    return (
      <>
        {renderFilters()}
        <section className="content-section">
          <div className="section-heading">
            <h2>Mutasi Stok</h2>
            <div className="button-row">
              <button
                className="icon-button"
                type="button"
                onClick={() =>
                  exportExcel("MUTASI_STOK", "Mutasi Stok", mutasiColumns, mutasiRows)
                }
                disabled={!canExport}
              >
                <Download size={14} />
                Excel
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() =>
                  exportPdf("MUTASI_STOK", "Mutasi Stok", mutasiColumns, mutasiRows)
                }
                disabled={!canExport}
              >
                <Printer size={14} />
                PDF
              </button>
            </div>
          </div>
          <DataTable columns={mutasiColumns} rows={mutasiRows} pageSize={24} />
        </section>
      </>
    );
  }

  function renderKlaim() {
    const totalDpp = filteredKlaim.reduce((sum, row) => sum + row.dpp, 0);
    const totalPpn = filteredKlaim.reduce((sum, row) => sum + row.ppn, 0);
    return (
      <>
        {renderFilters()}
        <section className="content-section">
          <div className="section-heading">
            <h2>Monitoring Klaim</h2>
            <div className="summary-strip compact">
              <Badge tone="info">DPP {formatMoney(totalDpp)}</Badge>
              <Badge tone="info">PPN {formatMoney(totalPpn)}</Badge>
            </div>
          </div>
          <div className="inline-form claim-form">
            <label>
              Tanggal Pengajuan
              <input
                type="date"
                value={claimForm.tanggalPengajuan}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    tanggalPengajuan: event.target.value,
                  }))
                }
                disabled={!canEdit}
              />
            </label>
            <label>
              Divisi
              <input
                value={claimForm.divisi}
                onChange={(event) =>
                  setClaimForm((current) => ({ ...current, divisi: event.target.value }))
                }
                disabled={!canEdit}
              />
            </label>
            <label>
              Pengaju
              <input
                value={claimForm.yangMengajukan}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    yangMengajukan: event.target.value,
                  }))
                }
                disabled={!canEdit}
              />
            </label>
            <label>
              Jenis Klaim
              <select
                value={claimForm.jenisKlaim}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    jenisKlaim: event.target.value,
                  }))
                }
                disabled={!canEdit}
              >
                <option value="">Pilih</option>
                {db.masterJenisKlaim
                  .filter((row) => row.status === "aktif")
                  .map((row) => (
                    <option key={row.id} value={row.jenisKlaim}>
                      {row.jenisKlaim}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              No Klaim
              <input
                value={claimForm.noKlaim}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    noKlaim: normalizeExcelText(event.target.value),
                  }))
                }
                disabled={!canEdit}
              />
            </label>
            <label>
              No Faktur Pajak
              <input
                value={claimForm.noFakturPajak}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    noFakturPajak: normalizeExcelText(event.target.value),
                  }))
                }
                disabled={!canEdit}
              />
            </label>
            <button
              className="icon-button"
              type="button"
              onClick={lookupClaimFp}
              disabled={!canEdit || !claimForm.noFakturPajak}
            >
              <Search size={14} />
              Lookup FP
            </button>
            <label>
              Tanggal FP
              <input
                type="date"
                value={claimForm.tanggalFakturPajak}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    tanggalFakturPajak: event.target.value,
                  }))
                }
                disabled={!canEdit}
              />
            </label>
            <label>
              DPP
              <input
                value={claimForm.dpp}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    dpp: parseAmount(event.target.value),
                  }))
                }
                disabled={!canEdit}
              />
            </label>
            <label>
              PPN
              <input
                value={claimForm.ppn}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    ppn: parseAmount(event.target.value),
                  }))
                }
                disabled={!canEdit}
              />
            </label>
            <label>
              Status
              <select
                value={claimForm.status}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    status: event.target.value as MonitoringKlaim["status"],
                  }))
                }
                disabled={!canEdit}
              >
                {claimStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Attachment
              <input
                value={claimForm.attachment}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    attachment: event.target.value,
                  }))
                }
                disabled={!canEdit}
              />
            </label>
            <label className="wide-field">
              Keterangan
              <input
                value={claimForm.keterangan}
                onChange={(event) =>
                  setClaimForm((current) => ({
                    ...current,
                    keterangan: event.target.value,
                  }))
                }
                disabled={!canEdit}
              />
            </label>
            <button
              className="primary-button"
              type="button"
              onClick={saveClaim}
              disabled={!canEdit}
            >
              <Save size={14} />
              {editingClaimId ? "Update" : "Simpan"}
            </button>
          </div>
          {claimError ? <p className="form-error">{claimError}</p> : null}
          <div className="section-heading with-top">
            <h2>Daftar Klaim</h2>
            <div className="button-row">
              <button
                className="icon-button"
                type="button"
                onClick={() =>
                  exportExcel(
                    "MONITORING_KLAIM",
                    "Monitoring Klaim",
                    klaimColumns.filter((column) => column.key !== "actions"),
                    filteredKlaim,
                  )
                }
                disabled={!canExport}
              >
                <Download size={14} />
                Excel
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() =>
                  exportPdf(
                    "MONITORING_KLAIM",
                    "Monitoring Klaim",
                    klaimColumns.filter((column) => column.key !== "actions"),
                    filteredKlaim,
                  )
                }
                disabled={!canExport}
              >
                <Printer size={14} />
                PDF
              </button>
            </div>
          </div>
          <DataTable columns={klaimColumns} rows={filteredKlaim} pageSize={20} />
        </section>
      </>
    );
  }

  function renderReport() {
    const report = getReportRows();
    const canPdf = ["mutasi", "rekap", "klaim"].includes(reportKey);
    return (
      <>
        {renderFilters()}
        <section className="tabs-band">
          {[
            ["kartu", "Kartu Stok"],
            ["mutasi", "Mutasi Stok"],
            ["rekap", "Rekap Beli"],
            ["detail", "Detail Beli"],
            ["rekon", "Rekonsiliasi"],
            ["klaim", "Klaim"],
            ["dashboard", "Dashboard"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={reportKey === key ? "tab active" : "tab"}
              type="button"
              onClick={() => setReportKey(key as typeof reportKey)}
            >
              {label}
            </button>
          ))}
        </section>
        <section className="content-section">
          <div className="section-heading">
            <h2>{report.title}</h2>
            <div className="button-row">
              <button
                className="primary-button"
                type="button"
                onClick={() => exportCurrentReport(false)}
                disabled={!canExport}
              >
                <FileDown size={14} />
                Excel
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => exportCurrentReport(true)}
                disabled={!canExport || !canPdf}
              >
                <Printer size={14} />
                PDF
              </button>
            </div>
          </div>
          <DataTable columns={report.columns} rows={report.rows} pageSize={24} />
        </section>
      </>
    );
  }

  function renderAdmin() {
    const usersColumns: TableColumn<AppUser>[] = [
      { key: "username", label: "USERNAME" },
      { key: "role", label: "ROLE" },
      {
        key: "active",
        label: "AKTIF",
        render: (row) => (
          <Badge tone={row.active ? "success" : "muted"}>
            {row.active ? "aktif" : "nonaktif"}
          </Badge>
        ),
      },
      {
        key: "allowInput",
        label: "INPUT",
        render: (row) => (row.allowInput ? "Ya" : "Tidak"),
      },
      {
        key: "allowExport",
        label: "EXPORT",
        render: (row) => (row.allowExport ? "Ya" : "Tidak"),
      },
    ];
    const batchColumns: TableColumn<UploadBatch>[] = [
      { key: "uploadedAt", label: "UPLOADED AT" },
      { key: "template", label: "TEMPLATE" },
      { key: "fileName", label: "FILE" },
      { key: "sheetName", label: "SHEET" },
      { key: "rowsSaved", label: "ROWS", align: "right" },
      { key: "uploadedBy", label: "BY" },
      { key: "mode", label: "MODE" },
      {
        key: "status",
        label: "STATUS",
        render: (row) => (
          <Badge tone={row.status === "Berhasil" ? "success" : "danger"}>
            {row.status}
          </Badge>
        ),
      },
      { key: "message", label: "MESSAGE" },
    ];
    const auditColumns: TableColumn<AuditLog>[] = [
      { key: "at", label: "AT" },
      { key: "actor", label: "ACTOR" },
      { key: "action", label: "ACTION" },
      { key: "target", label: "TARGET" },
      { key: "detail", label: "DETAIL" },
    ];

    return (
      <>
        <section className="content-section">
          <div className="section-heading">
            <h2>Admin & Kontrol</h2>
            <div className="button-row">
              <button
                className="icon-button"
                type="button"
                onClick={resetActiveSessions}
                disabled={!isAdmin}
              >
                <ShieldCheck size={14} />
                Reset Sesi
              </button>
              <button
                className="icon-button danger"
                type="button"
                onClick={resetAllData}
                disabled={!isAdmin}
              >
                <Trash2 size={14} />
                Reset Data
              </button>
            </div>
          </div>
          <div className="summary-strip">
            <Badge tone="info">Database Stok dan Klaim terpisah</Badge>
            <Badge tone="muted">Tidak posting jurnal otomatis</Badge>
            <Badge tone="muted">Lock period Finance tidak dipakai</Badge>
          </div>
          <DataTable columns={usersColumns} rows={db.users} pageSize={8} />
        </section>
        <section className="content-section split-grid">
          <div>
            <div className="section-heading">
              <h2>Upload Batches</h2>
            </div>
            <DataTable columns={batchColumns} rows={db.uploadBatches} pageSize={12} />
          </div>
          <div>
            <div className="section-heading">
              <h2>Audit Logs</h2>
            </div>
            <DataTable columns={auditColumns} rows={db.auditLogs} pageSize={12} />
          </div>
        </section>
      </>
    );
  }

  function renderContent() {
    if (menu === "dashboard") {
      return renderDashboard();
    }
    if (menu === "master") {
      return renderMaster();
    }
    if (menu === "upload") {
      return renderUpload();
    }
    if (menu === "kartu") {
      return renderKartuStok();
    }
    if (menu === "mutasi") {
      return renderMutasiStok();
    }
    if (menu === "cek") {
      return renderCekDetailBeli();
    }
    if (menu === "klaim") {
      return renderKlaim();
    }
    if (menu === "report") {
      return renderReport();
    }
    return renderAdmin();
  }

  if (!loaded) {
    return (
      <main className="loading-screen">
        <BrandLogo />
        <span>Memuat Stok dan Klaim...</span>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={`login-screen theme-${theme}`}>
        <section className="login-panel">
          <div className="login-brand">
            <BrandLogo />
            <div>
              <span>PT. Berdikari Berkah Mulia</span>
              <h1>Stok dan Klaim</h1>
            </div>
          </div>
          <div className="login-form">
            <label>
              Username
              <input
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
                autoComplete="off"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                autoComplete="new-password"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleLogin();
                  }
                }}
              />
            </label>
            {loginError ? <p className="form-error">{loginError}</p> : null}
            <button className="primary-button full" type="button" onClick={handleLogin}>
              <Lock size={15} />
              Login
            </button>
          </div>
          <div className="login-footer">
            <button
              className="icon-button"
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={`app-layout theme-${theme}`}>
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="brand-block">
          <BrandLogo />
          <div>
            <span>PT. Berdikari Berkah Mulia</span>
            <strong>Stok dan Klaim</strong>
          </div>
        </div>
        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={menu === item.key ? "nav-item active" : "nav-item"}
                type="button"
                onClick={() => {
                  setMenu(item.key);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <button
            className="icon-only"
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label="Menu"
            title="Menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <span>{menuItems.find((item) => item.key === menu)?.label}</span>
            <h1>Stok dan Klaim</h1>
          </div>
          <div className="topbar-actions">
            <Badge tone={session.role === "admin" ? "danger" : "info"}>
              {session.role}
            </Badge>
            <button
              className="icon-only"
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="icon-button" type="button" onClick={logout}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>
        <div className="workspace-body">{renderContent()}</div>
      </section>
    </main>
  );
}
