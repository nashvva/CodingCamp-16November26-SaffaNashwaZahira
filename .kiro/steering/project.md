# To-Do List Life Dashboard — Project Steering

## Tujuan Website

To-Do List Life Dashboard adalah aplikasi web mandiri yang membantu pengguna mengorganisir hari mereka. Dashboard menampilkan jam dan tanggal secara real-time, sapaan berdasarkan waktu, daftar tugas harian, timer fokus (Pomodoro), dan tautan cepat ke situs favorit. Semua data disimpan di browser pengguna tanpa memerlukan server.

---

## Fitur Wajib (MVP)

### Greeting
- Tampilkan jam berjalan (HH:MM:SS) dan tanggal lengkap.
- Tampilkan sapaan otomatis berdasarkan waktu: Good Morning (05.00–11.59), Good Afternoon (12.00–16.59), Good Evening (17.00–20.59), Good Night (21.00–04.59).
- Dukung nama kustom pengguna yang tersimpan di Local Storage.

### Focus Timer
- Durasi default 25 menit (dapat diubah antara 1–90 menit).
- Tombol Start, Stop, dan Reset.
- Notifikasi saat sesi fokus selesai.

### To-Do List
- Tambah tugas baru.
- Edit tugas dengan double-click pada teks tugas.
- Tandai tugas sebagai selesai (centang).
- Hapus tugas.
- Semua tugas disimpan dan dimuat dari Local Storage.

### Quick Links
- Tambah tautan dengan nama dan URL.
- Hapus tautan.
- Tautan disimpan dan dimuat dari Local Storage.
- Default tersedia: Google, Gmail, Calendar.

---

## Challenges yang Diimplementasi

| Challenge | Deskripsi |
|---|---|
| Light / Dark Mode | Tombol toggle tema di pojok kanan atas; preferensi disimpan di Local Storage; deteksi preferensi OS otomatis. |
| Custom Name in Greeting | Pengguna dapat menyimpan nama yang muncul di baris sapaan; nama disimpan di Local Storage. |
| Prevent Duplicate Tasks | Penambahan dan pengeditan tugas dicek secara case-insensitive; tugas duplikat ditolak dengan peringatan toast. |
| Sort Tasks | Tombol sort mengurutkan tugas A→Z atau Z→A; tugas selesai selalu berada di bawah. |

---

## Teknologi yang Digunakan

| Layer | Teknologi |
|---|---|
| Struktur | HTML5 |
| Tampilan | CSS3 (satu file: `css/style.css`) |
| Logika | Vanilla JavaScript, tanpa framework (satu file: `js/app.js`) |
| Penyimpanan | Browser Local Storage API |
| Backend | Tidak ada — sepenuhnya client-side |

---

## Aturan Penyimpanan (Local Storage)

Semua data persisten disimpan di browser pengguna menggunakan `localStorage`. Tidak ada request ke server eksternal untuk data aplikasi.

| Key | Tipe | Isi |
|---|---|---|
| `tasks` | JSON Array | Daftar objek tugas `{ text: string, done: boolean }` |
| `quickLinks` | JSON Array | Daftar objek tautan `{ name: string, url: string }` |
| `userName` | JSON String | Nama kustom pengguna |
| `theme` | JSON String | Tema aktif: `"light"` atau `"dark"` |
| `timerDuration` | JSON Number | Durasi timer dalam menit |

Data dibaca saat halaman dimuat dan ditulis setiap kali ada perubahan. Jika data tidak ditemukan, aplikasi menggunakan nilai default bawaan.

---

## Aturan Struktur Folder

```
/
├── index.html          ← satu-satunya file HTML
├── css/
│   └── style.css       ← satu-satunya file CSS
├── js/
│   └── app.js          ← satu-satunya file JavaScript
└── .kiro/
    └── steering/
        └── project.md  ← file ini
```

- Hanya satu file CSS di dalam `css/`.
- Hanya satu file JavaScript di dalam `js/`.
- Tidak ada library eksternal, CDN, atau framework.
- Tidak ada perubahan pada file `index.html`, `css/style.css`, dan `js/app.js` kecuali diminta secara eksplisit.

---

## Kompatibilitas Browser

Aplikasi harus berjalan di browser modern:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

Dapat digunakan sebagai halaman web biasa maupun homepage browser.

---

## Non-Functional Requirements

- **NFR-1 Simplicity**: Antarmuka bersih dan minimal, tidak perlu konfigurasi tambahan.
- **NFR-2 Performance**: Load cepat, interaksi UI responsif, tidak ada lag saat memperbarui data.
- **NFR-3 Visual Design**: Hierarki visual jelas, tipografi mudah dibaca, estetika ramah pengguna.
