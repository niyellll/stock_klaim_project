# Stok dan Klaim

Program web operasional untuk PT. Berdikari Berkah Mulia.

Scope aplikasi ini sengaja terpisah dari program Hutang Piutang/Finance. Data stok, rekonsiliasi beli, kartu stok, mutasi stok, dan monitoring klaim tidak mem-posting jurnal otomatis dan tidak memakai lock period Finance.

## Login Awal

- Admin: `admin321` / `654321`
- User: `user` / `user123`

Sistem menyimpan sesi aktif per username. Username yang sama tidak bisa login di device lain selama belum logout.

## Modul

- Dashboard
- Master Data
- Upload Data
- Kartu Stok
- Mutasi Stok
- Cek Detail Beli
- Monitoring Klaim
- Report
- Admin & Kontrol

## Upload Template

Template Excel tersedia dari menu Upload Data:

- `REKAP_BELI.xlsx`
- `DETAIL_BELI.xlsx`
- `DETAIL_JUAL.xlsx`
- `SALDO_AWAL_STOK.xlsx`
- `MONITORING_KLAIM.xlsx`

Nomor penting seperti No FP, SJ Vendor, GR No, PO No, dan No Klaim diperlakukan sebagai teks agar tidak berubah ke scientific format.

## Development

```bash
npm install
npm run dev
```

Build dan test:

```bash
npm run build
npm test
```

## Vercel

Project ini memakai Vite React SPA untuk Vercel.

- Build command: `npm run build`
- Output directory: `dist`
- Rewrite: semua route diarahkan ke `index.html`

## Database

Skema database mandiri ada di `db/schema.ts` dengan tabel:

- `users`
- `master_barang`
- `master_gudang`
- `master_vendor`
- `master_pihak`
- `master_jenis_klaim`
- `stock_saldo_awal`
- `stock_detail_beli`
- `stock_rekap_beli`
- `stock_detail_jual`
- `stock_rekonsiliasi_beli`
- `monitoring_klaim`
- `upload_batches`
- `audit_logs`
- `lock_period_stock`
