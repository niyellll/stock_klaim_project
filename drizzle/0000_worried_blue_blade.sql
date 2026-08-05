CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_at` ON `audit_logs` (`at`);--> statement-breakpoint
CREATE TABLE `lock_period_stock` (
	`id` text PRIMARY KEY NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`locked` integer DEFAULT false NOT NULL,
	`locked_by` text DEFAULT '' NOT NULL,
	`locked_at` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lock_period_stock_period` ON `lock_period_stock` (`year`,`month`);--> statement-breakpoint
CREATE TABLE `master_barang` (
	`id` text PRIMARY KEY NOT NULL,
	`kode_barang` text NOT NULL,
	`nama_barang` text NOT NULL,
	`satuan` text NOT NULL,
	`kategori` text DEFAULT '' NOT NULL,
	`barcode` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'aktif' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_master_barang_kode` ON `master_barang` (`kode_barang`);--> statement-breakpoint
CREATE INDEX `idx_master_barang_nama` ON `master_barang` (`nama_barang`);--> statement-breakpoint
CREATE TABLE `master_gudang` (
	`id` text PRIMARY KEY NOT NULL,
	`kode_gudang` text NOT NULL,
	`nama_gudang` text NOT NULL,
	`lokasi` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'aktif' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_master_gudang_kode` ON `master_gudang` (`kode_gudang`);--> statement-breakpoint
CREATE TABLE `master_jenis_klaim` (
	`id` text PRIMARY KEY NOT NULL,
	`jenis_klaim` text NOT NULL,
	`default_divisi` text DEFAULT '' NOT NULL,
	`catatan` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'aktif' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_master_jenis_klaim_nama` ON `master_jenis_klaim` (`jenis_klaim`);--> statement-breakpoint
CREATE TABLE `master_pihak` (
	`id` text PRIMARY KEY NOT NULL,
	`kode_pihak` text NOT NULL,
	`nama_pihak` text NOT NULL,
	`tipe` text DEFAULT 'Customer' NOT NULL,
	`status` text DEFAULT 'aktif' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_master_pihak_kode` ON `master_pihak` (`kode_pihak`);--> statement-breakpoint
CREATE TABLE `master_vendor` (
	`id` text PRIMARY KEY NOT NULL,
	`kode_vendor` text NOT NULL,
	`nama_vendor` text NOT NULL,
	`alamat` text DEFAULT '' NOT NULL,
	`npwp` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'aktif' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_master_vendor_kode` ON `master_vendor` (`kode_vendor`);--> statement-breakpoint
CREATE INDEX `idx_master_vendor_nama` ON `master_vendor` (`nama_vendor`);--> statement-breakpoint
CREATE TABLE `monitoring_klaim` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text,
	`source_row` integer,
	`validation_status` text DEFAULT 'Valid' NOT NULL,
	`tanggal_pengajuan` text NOT NULL,
	`divisi` text NOT NULL,
	`yang_mengajukan` text NOT NULL,
	`jenis_klaim` text NOT NULL,
	`no_klaim` text NOT NULL,
	`no_faktur_pajak` text DEFAULT '' NOT NULL,
	`tanggal_faktur_pajak` text DEFAULT '' NOT NULL,
	`dpp` real DEFAULT 0 NOT NULL,
	`ppn` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	`attachment` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_monitoring_klaim_no_klaim` ON `monitoring_klaim` (`no_klaim`);--> statement-breakpoint
CREATE INDEX `idx_monitoring_klaim_no_fp` ON `monitoring_klaim` (`no_faktur_pajak`);--> statement-breakpoint
CREATE INDEX `idx_monitoring_klaim_status` ON `monitoring_klaim` (`status`);--> statement-breakpoint
CREATE TABLE `stock_detail_beli` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`source_row` integer NOT NULL,
	`validation_status` text DEFAULT 'Valid' NOT NULL,
	`no` text DEFAULT '' NOT NULL,
	`gr_no` text DEFAULT '' NOT NULL,
	`tanggal_terima_gudang` text NOT NULL,
	`gudang` text NOT NULL,
	`po_no` text DEFAULT '' NOT NULL,
	`sj_vendor` text NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL,
	`vendor` text NOT NULL,
	`kode_barang` text NOT NULL,
	`nama_barang` text NOT NULL,
	`qty_purchase` real DEFAULT 0 NOT NULL,
	`satuan` text NOT NULL,
	`qty_stock` real DEFAULT 0 NOT NULL,
	`harga` real DEFAULT 0 NOT NULL,
	`dpp` real DEFAULT 0 NOT NULL,
	`no_faktur_pajak` text DEFAULT '' NOT NULL,
	`status_match` text DEFAULT 'Belum Match' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_stock_detail_beli_tanggal_gudang` ON `stock_detail_beli` (`tanggal_terima_gudang`);--> statement-breakpoint
CREATE INDEX `idx_stock_detail_beli_sj_vendor` ON `stock_detail_beli` (`sj_vendor`);--> statement-breakpoint
CREATE INDEX `idx_stock_detail_beli_barang_gudang` ON `stock_detail_beli` (`kode_barang`,`gudang`);--> statement-breakpoint
CREATE TABLE `stock_detail_jual` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`source_row` integer NOT NULL,
	`validation_status` text DEFAULT 'Valid' NOT NULL,
	`no` text DEFAULT '' NOT NULL,
	`tanggal_keluar_gudang` text NOT NULL,
	`gudang` text NOT NULL,
	`no_dokumen` text NOT NULL,
	`customer` text NOT NULL,
	`kode_barang` text NOT NULL,
	`nama_barang` text NOT NULL,
	`qty` real DEFAULT 0 NOT NULL,
	`satuan` text NOT NULL,
	`harga` real DEFAULT 0 NOT NULL,
	`jumlah` real DEFAULT 0 NOT NULL,
	`keterangan` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_stock_detail_jual_tanggal_gudang` ON `stock_detail_jual` (`tanggal_keluar_gudang`);--> statement-breakpoint
CREATE INDEX `idx_stock_detail_jual_barang_gudang` ON `stock_detail_jual` (`kode_barang`,`gudang`);--> statement-breakpoint
CREATE TABLE `stock_rekap_beli` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`source_row` integer NOT NULL,
	`validation_status` text DEFAULT 'Valid' NOT NULL,
	`no` text DEFAULT '' NOT NULL,
	`nama_pt` text NOT NULL,
	`tgl_fp` text NOT NULL,
	`no_fp` text NOT NULL,
	`sj_vendor` text NOT NULL,
	`dpp` real DEFAULT 0 NOT NULL,
	`gr_no` text DEFAULT '' NOT NULL,
	`catatan` text DEFAULT '' NOT NULL,
	`status_match` text DEFAULT 'Belum Match' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_stock_rekap_beli_tgl_fp` ON `stock_rekap_beli` (`tgl_fp`);--> statement-breakpoint
CREATE INDEX `idx_stock_rekap_beli_sj_vendor` ON `stock_rekap_beli` (`sj_vendor`);--> statement-breakpoint
CREATE INDEX `idx_stock_rekap_beli_no_fp` ON `stock_rekap_beli` (`no_fp`);--> statement-breakpoint
CREATE TABLE `stock_rekonsiliasi_beli` (
	`id` text PRIMARY KEY NOT NULL,
	`sj_vendor` text NOT NULL,
	`no_fp` text DEFAULT '' NOT NULL,
	`gr_no` text DEFAULT '' NOT NULL,
	`nama_pt` text DEFAULT '' NOT NULL,
	`vendor` text DEFAULT '' NOT NULL,
	`tgl_fp` text DEFAULT '' NOT NULL,
	`tanggal_terima_gudang` text DEFAULT '' NOT NULL,
	`dpp_rekap` real DEFAULT 0 NOT NULL,
	`dpp_detail` real DEFAULT 0 NOT NULL,
	`selisih_dpp` real DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`catatan` text DEFAULT '' NOT NULL,
	`processed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_stock_rekonsiliasi_sj_vendor` ON `stock_rekonsiliasi_beli` (`sj_vendor`);--> statement-breakpoint
CREATE TABLE `stock_saldo_awal` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`source_row` integer NOT NULL,
	`validation_status` text DEFAULT 'Valid' NOT NULL,
	`no` text DEFAULT '' NOT NULL,
	`kode_barang` text NOT NULL,
	`nama_barang` text NOT NULL,
	`gudang` text NOT NULL,
	`satuan` text NOT NULL,
	`saldo_awal_qty` real DEFAULT 0 NOT NULL,
	`harga_awal` real DEFAULT 0 NOT NULL,
	`nilai_awal` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_stock_saldo_awal_barang` ON `stock_saldo_awal` (`kode_barang`);--> statement-breakpoint
CREATE INDEX `idx_stock_saldo_awal_gudang` ON `stock_saldo_awal` (`gudang`);--> statement-breakpoint
CREATE TABLE `upload_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`template` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`uploaded_at` text NOT NULL,
	`source_file_name` text NOT NULL,
	`source_sheet` text NOT NULL,
	`rows_saved` integer DEFAULT 0 NOT NULL,
	`mode` text DEFAULT 'append' NOT NULL,
	`status` text NOT NULL,
	`message` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_upload_batches_template` ON `upload_batches` (`template`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`active_session_token` text,
	`allow_input` integer DEFAULT false NOT NULL,
	`allow_export` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_username` ON `users` (`username`);