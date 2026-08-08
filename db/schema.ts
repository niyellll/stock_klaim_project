import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    activeSessionToken: text("active_session_token"),
    allowInput: integer("allow_input", { mode: "boolean" }).notNull().default(false),
    allowExport: integer("allow_export", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_users_username").on(table.username)],
);

export const masterBarang = sqliteTable(
  "master_barang",
  {
    id: text("id").primaryKey(),
    kodeBarang: text("kode_barang").notNull(),
    namaBarang: text("nama_barang").notNull(),
    satuan: text("satuan").notNull(),
    kategori: text("kategori").notNull().default(""),
    barcode: text("barcode").notNull().default(""),
    status: text("status", { enum: ["aktif", "nonaktif"] }).notNull().default("aktif"),
  },
  (table) => [
    uniqueIndex("idx_master_barang_kode").on(table.kodeBarang),
    index("idx_master_barang_nama").on(table.namaBarang),
  ],
);

export const masterGudang = sqliteTable(
  "master_gudang",
  {
    id: text("id").primaryKey(),
    kodeGudang: text("kode_gudang").notNull(),
    namaGudang: text("nama_gudang").notNull(),
    lokasi: text("lokasi").notNull().default(""),
    status: text("status", { enum: ["aktif", "nonaktif"] }).notNull().default("aktif"),
  },
  (table) => [uniqueIndex("idx_master_gudang_kode").on(table.kodeGudang)],
);

export const masterVendor = sqliteTable(
  "master_vendor",
  {
    id: text("id").primaryKey(),
    kodeVendor: text("kode_vendor").notNull(),
    namaVendor: text("nama_vendor").notNull(),
    alamat: text("alamat").notNull().default(""),
    npwp: text("npwp").notNull().default(""),
    status: text("status", { enum: ["aktif", "nonaktif"] }).notNull().default("aktif"),
  },
  (table) => [
    uniqueIndex("idx_master_vendor_kode").on(table.kodeVendor),
    index("idx_master_vendor_nama").on(table.namaVendor),
  ],
);

export const masterPihak = sqliteTable(
  "master_pihak",
  {
    id: text("id").primaryKey(),
    kodePihak: text("kode_pihak").notNull(),
    namaPihak: text("nama_pihak").notNull(),
    tipe: text("tipe").notNull().default("Customer"),
    status: text("status", { enum: ["aktif", "nonaktif"] }).notNull().default("aktif"),
  },
  (table) => [uniqueIndex("idx_master_pihak_kode").on(table.kodePihak)],
);

export const masterJenisKlaim = sqliteTable(
  "master_jenis_klaim",
  {
    id: text("id").primaryKey(),
    jenisKlaim: text("jenis_klaim").notNull(),
    defaultDivisi: text("default_divisi").notNull().default(""),
    catatan: text("catatan").notNull().default(""),
    status: text("status", { enum: ["aktif", "nonaktif"] }).notNull().default("aktif"),
  },
  (table) => [uniqueIndex("idx_master_jenis_klaim_nama").on(table.jenisKlaim)],
);

export const uploadBatches = sqliteTable(
  "upload_batches",
  {
    id: text("id").primaryKey(),
    template: text("template").notNull(),
    uploadedBy: text("uploaded_by").notNull(),
    uploadedAt: text("uploaded_at").notNull(),
    sourceFileName: text("source_file_name").notNull(),
    sourceSheet: text("source_sheet").notNull(),
    rowsSaved: integer("rows_saved").notNull().default(0),
    mode: text("mode", { enum: ["append", "replace"] }).notNull().default("append"),
    status: text("status", { enum: ["Berhasil", "Gagal"] }).notNull(),
    message: text("message").notNull().default(""),
  },
  (table) => [index("idx_upload_batches_template").on(table.template)],
);

export const stockSaldoAwal = sqliteTable(
  "stock_saldo_awal",
  {
    id: text("id").primaryKey(),
    batchId: text("batch_id").notNull(),
    sourceRow: integer("source_row").notNull(),
    validationStatus: text("validation_status").notNull().default("Valid"),
    no: text("no").notNull().default(""),
    kodeBarang: text("kode_barang").notNull(),
    namaBarang: text("nama_barang").notNull(),
    gudang: text("gudang").notNull(),
    satuan: text("satuan").notNull(),
    saldoAwalQty: real("saldo_awal_qty").notNull().default(0),
    hargaAwal: real("harga_awal").notNull().default(0),
    nilaiAwal: real("nilai_awal").notNull().default(0),
  },
  (table) => [
    index("idx_stock_saldo_awal_barang").on(table.kodeBarang),
    index("idx_stock_saldo_awal_gudang").on(table.gudang),
  ],
);

export const stockRekapBeli = sqliteTable(
  "stock_rekap_beli",
  {
    id: text("id").primaryKey(),
    batchId: text("batch_id").notNull(),
    sourceRow: integer("source_row").notNull(),
    validationStatus: text("validation_status").notNull().default("Valid"),
    no: text("no").notNull().default(""),
    namaPt: text("nama_pt").notNull(),
    tglFp: text("tgl_fp").notNull(),
    noFp: text("no_fp").notNull(),
    sjVendor: text("sj_vendor").notNull(),
    dpp: real("dpp").notNull().default(0),
    grNo: text("gr_no").notNull().default(""),
    catatan: text("catatan").notNull().default(""),
    statusMatch: text("status_match", { enum: ["Match", "Belum Match"] })
      .notNull()
      .default("Belum Match"),
  },
  (table) => [
    index("idx_stock_rekap_beli_tgl_fp").on(table.tglFp),
    index("idx_stock_rekap_beli_sj_vendor").on(table.sjVendor),
    index("idx_stock_rekap_beli_no_fp").on(table.noFp),
  ],
);

export const stockDetailBeli = sqliteTable(
  "stock_detail_beli",
  {
    id: text("id").primaryKey(),
    batchId: text("batch_id").notNull(),
    sourceRow: integer("source_row").notNull(),
    validationStatus: text("validation_status").notNull().default("Valid"),
    no: text("no").notNull().default(""),
    grNo: text("gr_no").notNull().default(""),
    tanggalTerimaGudang: text("tanggal_terima_gudang").notNull(),
    gudang: text("gudang").notNull(),
    poNo: text("po_no").notNull().default(""),
    sjVendor: text("sj_vendor").notNull(),
    keterangan: text("keterangan").notNull().default(""),
    vendor: text("vendor").notNull(),
    kodeBarang: text("kode_barang").notNull(),
    namaBarang: text("nama_barang").notNull(),
    qtyPurchase: real("qty_purchase").notNull().default(0),
    satuan: text("satuan").notNull(),
    qtyStock: real("qty_stock").notNull().default(0),
    harga: real("harga").notNull().default(0),
    dpp: real("dpp").notNull().default(0),
    noFakturPajak: text("no_faktur_pajak").notNull().default(""),
    statusMatch: text("status_match", { enum: ["Match", "Belum Match"] })
      .notNull()
      .default("Belum Match"),
  },
  (table) => [
    index("idx_stock_detail_beli_tanggal_gudang").on(table.tanggalTerimaGudang),
    index("idx_stock_detail_beli_sj_vendor").on(table.sjVendor),
    index("idx_stock_detail_beli_barang_gudang").on(table.kodeBarang, table.gudang),
  ],
);

export const stockDetailJual = sqliteTable(
  "stock_detail_jual",
  {
    id: text("id").primaryKey(),
    batchId: text("batch_id").notNull(),
    sourceRow: integer("source_row").notNull(),
    validationStatus: text("validation_status").notNull().default("Valid"),
    no: text("no").notNull().default(""),
    tanggalKeluarGudang: text("tanggal_keluar_gudang").notNull(),
    gudang: text("gudang").notNull(),
    noDokumen: text("no_dokumen").notNull(),
    customer: text("customer").notNull(),
    kodeBarang: text("kode_barang").notNull(),
    namaBarang: text("nama_barang").notNull(),
    qty: real("qty").notNull().default(0),
    satuan: text("satuan").notNull(),
    harga: real("harga").notNull().default(0),
    jumlah: real("jumlah").notNull().default(0),
    keterangan: text("keterangan").notNull().default(""),
  },
  (table) => [
    index("idx_stock_detail_jual_tanggal_gudang").on(table.tanggalKeluarGudang),
    index("idx_stock_detail_jual_barang_gudang").on(table.kodeBarang, table.gudang),
  ],
);

export const stockRekonsiliasiBeli = sqliteTable(
  "stock_rekonsiliasi_beli",
  {
    id: text("id").primaryKey(),
    sjVendor: text("sj_vendor").notNull(),
    noFp: text("no_fp").notNull().default(""),
    grNo: text("gr_no").notNull().default(""),
    namaPt: text("nama_pt").notNull().default(""),
    vendor: text("vendor").notNull().default(""),
    tglFp: text("tgl_fp").notNull().default(""),
    tanggalTerimaGudang: text("tanggal_terima_gudang").notNull().default(""),
    dppRekap: real("dpp_rekap").notNull().default(0),
    dppDetail: real("dpp_detail").notNull().default(0),
    selisihDpp: real("selisih_dpp").notNull().default(0),
    status: text("status", { enum: ["Match", "Belum Match"] }).notNull(),
    catatan: text("catatan").notNull().default(""),
    processedAt: text("processed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_stock_rekonsiliasi_sj_vendor").on(table.sjVendor)],
);

export const monitoringKlaim = sqliteTable(
  "monitoring_klaim",
  {
    id: text("id").primaryKey(),
    batchId: text("batch_id"),
    sourceRow: integer("source_row"),
    validationStatus: text("validation_status").notNull().default("Valid"),
    tanggalPengajuan: text("tanggal_pengajuan").notNull(),
    divisi: text("divisi").notNull(),
    yangMengajukan: text("yang_mengajukan").notNull(),
    jenisKlaim: text("jenis_klaim").notNull(),
    noKlaim: text("no_klaim").notNull(),
    noFakturPajak: text("no_faktur_pajak").notNull().default(""),
    namaCustomer: text("nama_customer").notNull().default(""),
    tanggalFakturPajak: text("tanggal_faktur_pajak").notNull().default(""),
    dpp: real("dpp").notNull().default(0),
    ppn: real("ppn").notNull().default(0),
    total: real("total").notNull().default(0),
    status: text("status", {
      enum: ["Draft", "Diajukan", "Diproses", "Selesai", "Ditolak"],
    })
      .notNull()
      .default("Draft"),
    keterangan: text("keterangan").notNull().default(""),
    attachment: text("attachment").notNull().default(""),
  },
  (table) => [
    uniqueIndex("idx_monitoring_klaim_no_klaim").on(table.noKlaim),
    index("idx_monitoring_klaim_no_fp").on(table.noFakturPajak),
    index("idx_monitoring_klaim_status").on(table.status),
  ],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    target: text("target").notNull(),
    detail: text("detail").notNull().default(""),
    at: text("at").notNull(),
  },
  (table) => [index("idx_audit_logs_at").on(table.at)],
);

export const lockPeriodStock = sqliteTable(
  "lock_period_stock",
  {
    id: text("id").primaryKey(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    locked: integer("locked", { mode: "boolean" }).notNull().default(false),
    lockedBy: text("locked_by").notNull().default(""),
    lockedAt: text("locked_at").notNull().default(""),
    note: text("note").notNull().default(""),
  },
  (table) => [uniqueIndex("idx_lock_period_stock_period").on(table.year, table.month)],
);
