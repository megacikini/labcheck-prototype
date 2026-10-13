
const app = document.querySelector("#app");
const notice = document.querySelector("#notice");

let page = "home";
let selectedLab = "Lab RPL 1";
let selectedPC = "RPL-03";
let selectedAnnouncement = 0;
let loggedIn = false;
let demoUser = null;
let reports = [];
let search = "";

const computers = [
  { id: "RPL-01", status: "Normal", description: "Berfungsi dengan baik" },
  { id: "RPL-02", status: "Normal", description: "Siap digunakan" },
  { id: "RPL-03", status: "Rusak", description: "Tidak bisa booting" },
  { id: "RPL-04", status: "Normal", description: "Berfungsi dengan baik" },
  { id: "RPL-05", status: "Perawatan", description: "Sedang diperiksa" },
  { id: "RPL-06", status: "Normal", description: "Siap digunakan" }
];

const announcements = [
  {
    title: "Jadwal Praktikum RPL",
    date: "12 Oktober 2026",
    body: "Periksa kembali jadwal praktikum kelompok sebelum memasuki laboratorium."
  },
  {
    title: "Pemeliharaan Laboratorium",
    date: "10 Oktober 2026",
    body: "Beberapa komputer akan menjalani pemeriksaan rutin."
  },
  {
    title: "Informasi Kegiatan Sekolah",
    date: "8 Oktober 2026",
    body: "Perhatikan informasi terbaru dari sekolah."
  }
];

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function notify(message) {
  notice.textContent = message;
  notice.hidden = false;
}

function navigate(nextPage) {
  page = nextPage;
  notice.hidden = true;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function heading(title, subtitle, eyebrow = "LABCHECK") {
  return `
    <div class="page-heading">
      <div class="eyebrow">${eyebrow}</div>
      <h1>${title}</h1>
      <p class="subtitle">${subtitle}</p>
    </div>`;
}

function card(icon, title, description, destination) {
  return `
    <button class="card card-button" data-page="${destination}">
      <div class="icon-box">${icon}</div>
      <h3>${title}</h3>
      <p class="muted">${description}</p>
    </button>`;
}

function statusPill(status) {
  const className = {
    Normal: "normal",
    Rusak: "rusak",
    Perawatan: "perawatan"
  }[status] || "";

  return `<span class="pill ${className}">${status}</span>`;
}

function computerRow(pc) {
  return `
    <button class="list-row" data-computer="${pc.id}">
      <span class="icon-box" style="margin:0">▣</span>
      <span class="row-content">
        <strong>${pc.id}</strong>
        <small>${pc.description}</small>
      </span>
      ${statusPill(pc.status)}
      <span>›</span>
    </button>`;
}

function renderHome() {
  const normal = computers.filter(pc => pc.status === "Normal").length;
  const broken = computers.filter(pc => pc.status === "Rusak").length;
  const maintenance = computers.filter(pc => pc.status === "Perawatan").length;

  return `
    ${heading("Halo, Pengguna!", "Apa yang ingin kamu lakukan hari ini?", "BERANDA")}

    <section class="hero">
      <div class="eyebrow">LABORATORIUM RPL</div>
      <h2>Cek Lab, Cek Solusi.</h2>
      <p>Pantau kondisi komputer dan laporkan masalah fasilitas laboratorium dengan mudah.</p>
      <button class="btn" data-page="status">Lihat status komputer →</button>
    </section>

    <div class="grid grid-3">
      <div class="card stat">
        <div class="icon-box">✓</div>
        <div><strong>${normal}</strong><span>Komputer normal</span></div>
      </div>
      <div class="card stat">
        <div class="icon-box" style="background:#fee2e2;color:#b91c1c">!</div>
        <div><strong>${broken}</strong><span>Komputer rusak</span></div>
      </div>
      <div class="card stat">
        <div class="icon-box" style="background:#fef3c7;color:#92400e">◷</div>
        <div><strong>${maintenance}</strong><span>Dalam perawatan</span></div>
      </div>
    </div>

    <div class="section-heading"><h2>Akses cepat</h2></div>
    <div class="grid grid-4">
      ${card("▣", "Status Komputer", "Periksa kondisi PC", "status")}
      ${card("＋", "Laporan Masalah", "Laporkan kendala", "report")}
      ${card("♧", "Pengumuman", "Informasi terbaru", "announcements")}
      ${card("ⓘ", "Panduan", "Cara menggunakan LabCheck", "guide")}
    </div>

    <div class="section-heading">
      <h2>Informasi terbaru</h2>
      <button class="btn btn-soft" data-page="announcements">Lihat semua →</button>
    </div>

    <div class="list">
      ${announcements.slice(0, 2).map((item, index) => `
        <button class="list-row" data-announcement="${index}">
          <span class="icon-box" style="margin:0">▤</span>
          <span class="row-content">
            <strong>${item.title}</strong>
            <small>${item.date}</small>
          </span>
          <span>›</span>
        </button>`).join("")}
    </div>`;
}

function renderStatus() {
  const filtered = computers.filter(pc =>
    pc.id.toLowerCase().includes(search.toLowerCase())
  );

  return `
    ${heading("Status Komputer", "Pilih laboratorium dan periksa kondisi komputer.")}
    <div class="card">
      <div class="field-group">
        <label for="lab-select">Pilih Laboratorium</label>
        <select id="lab-select" class="field">
          ${["Lab RPL 1", "Lab RPL 2", "Lab RPL 3", "Lab RPL 4"]
            .map(lab => `<option ${lab === selectedLab ? "selected" : ""}>${lab}</option>`)
            .join("")}
        </select>
      </div>

      <div class="field-group" style="margin-top:16px">
        <label for="pc-search">Cari nomor komputer</label>
        <input id="pc-search" class="field" type="search"
          placeholder="Contoh: RPL-03" value="${escapeHTML(search)}">
      </div>
    </div>

    <div class="section-heading">
      <h2>Daftar Komputer</h2>
      <span class="muted">${filtered.length} ditemukan</span>
    </div>

    <div id="computer-list" class="list">
      ${filtered.length
        ? filtered.map(computerRow).join("")
        : '<div class="card muted">Komputer tidak ditemukan.</div>'}
    </div>
    <p class="muted">Status perangkat merupakan data simulasi.</p>`;
}

function renderDetail() {
  const pc = computers.find(item => item.id === selectedPC) || computers[0];

  return `
    ${heading("Detail Komputer", `Informasi perangkat di ${selectedLab}.`)}
    <div class="card detail-header">
      <div class="pc-icon">▣</div>
      <div>
        <div class="eyebrow">ID KOMPUTER</div>
        <h2>${pc.id}</h2>
        <p>${statusPill(pc.status)}</p>
        <p class="muted">${pc.description}</p>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <h2>Informasi perangkat</h2>
      <div class="detail-grid">
        <div class="detail-item"><span>Laboratorium</span><strong>${selectedLab}</strong></div>
        <div class="detail-item"><span>Status</span><strong>${pc.status}</strong></div>
        <div class="detail-item"><span>Spesifikasi</span><strong>Intel Core i5 · RAM 8 GB</strong></div>
        <div class="detail-item"><span>Keterangan</span><strong>${pc.description}</strong></div>
      </div>
    </div>

    <div class="form-actions" style="margin-top:16px">
      <button class="btn btn-primary" data-action="report-pc">＋ Laporkan Masalah</button>
      <button class="btn" data-page="status">← Kembali</button>
    </div>`;
}

function renderReport() {
  return `
    ${heading("Laporan Masalah", "Jelaskan kendala yang kamu temukan.")}
    <form id="report-form" class="card form">
      <div class="field-group">
        <label for="report-lab">Laboratorium</label>
        <select id="report-lab" name="lab" class="field">
          ${["Lab RPL 1", "Lab RPL 2", "Lab RPL 3", "Lab RPL 4"]
            .map(lab => `<option ${lab === selectedLab ? "selected" : ""}>${lab}</option>`)
            .join("")}
        </select>
      </div>

      <div class="field-group">
        <label for="report-pc">Nomor Komputer</label>
        <select id="report-pc" name="computer" class="field">
          ${computers.map(pc =>
            `<option ${pc.id === selectedPC ? "selected" : ""}>${pc.id}</option>`
          ).join("")}
        </select>
      </div>

      <div class="field-group">
        <label for="report-kind">Jenis Masalah</label>
        <select id="report-kind" name="kind" class="field" required>
          <option value="">Pilih jenis masalah</option>
          <option>Komputer tidak menyala</option>
          <option>Gangguan jaringan</option>
          <option>Keyboard atau mouse rusak</option>
          <option>Aplikasi bermasalah</option>
          <option>Lainnya</option>
        </select>
      </div>

      <div class="field-group">
        <label for="report-description">Keterangan</label>
        <textarea id="report-description" name="description"
          class="field" required placeholder="Jelaskan masalah yang terjadi..."></textarea>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Kirim Laporan →</button>
        <button class="btn" type="reset">Kosongkan Form</button>
      </div>
      <p class="muted">Laporan hanya tersimpan selama sesi prototype ini.</p>
    </form>`;
}

function renderReportSuccess() {
  const report = reports[reports.length - 1];

  return `
    ${heading("Laporan Berhasil Dikirim", "Terima kasih sudah melaporkan kendala.", "BERHASIL")}
    <div class="card" style="max-width:650px;text-align:center">
      <div class="pc-icon" style="margin:0 auto 18px;background:#dcfce7;color:#166534">✓</div>
      <h2>Laporan berhasil dicatat</h2>
      <p class="muted">Nomor laporan demo: LC-${String(reports.length).padStart(3, "0")}</p>
      <div class="detail-item"><span>Komputer</span><strong>${report.computer}</strong></div>
      <div class="detail-item"><span>Jenis masalah</span><strong>${escapeHTML(report.kind)}</strong></div>
      <div class="detail-item"><span>Keterangan</span><strong>${escapeHTML(report.description)}</strong></div>
      <div class="form-actions" style="justify-content:center;margin-top:20px">
        <button class="btn btn-primary" data-page="status">Kembali ke Status</button>
        <button class="btn" data-page="home">Ke Beranda</button>
      </div>
    </div>`;
}

function renderAnnouncements() {
  return `
    ${heading("Pengumuman", "Informasi terbaru dari laboratorium.")}
    <div class="list">
      ${announcements.map((item, index) => `
        <button class="list-row" data-announcement="${index}">
          <span class="icon-box" style="margin:0">▤</span>
          <span class="row-content">
            <strong>${item.title}</strong>
            <small>${item.date} · ${item.body}</small>
          </span>
          <span>›</span>
        </button>`).join("")}
    </div>`;
}

function renderAnnouncementDetail() {
  const item = announcements[selectedAnnouncement];

  return `
    ${heading("Detail Pengumuman", item.date)}
    <div class="card">
      <h2>${item.title}</h2>
      <p class="subtitle">${item.body}</p>
      <button class="btn" style="margin-top:20px" data-page="announcements">← Kembali</button>
    </div>`;
}

function renderGuide() {
  const guides = [
    ["01", "Memeriksa status komputer", "Buka Status Komputer, pilih laboratorium, lalu pilih nomor komputer."],
    ["02", "Membuat laporan masalah", "Pilih komputer dan jenis masalah, isi keterangan, lalu kirim laporan."],
    ["03", "Memahami status", "Normal berarti siap digunakan. Rusak berarti ada kendala. Perawatan berarti perangkat sedang diperiksa."]
  ];

  return `
    ${heading("Panduan Penggunaan", "Langkah singkat menggunakan LabCheck.")}
    <div class="grid">
      ${guides.map(item => `
        <div class="card">
          <div class="icon-box">${item[0]}</div>
          <h3>${item[1]}</h3>
          <p class="muted">${item[2]}</p>
        </div>`).join("")}
    </div>`;
}

function renderProfile() {
  return `
    ${heading("Profil", "Informasi akun dan bantuan pengguna.")}
    <div class="card" style="max-width:650px">
      <div class="detail-header">
        <div class="pc-icon">♙</div>
        <div>
          <h2>${loggedIn ? escapeHTML(demoUser.name) : "Pengguna Tamu"}</h2>
          <p class="muted">${loggedIn ? escapeHTML(demoUser.email) : "Masuk untuk mencoba akun demo."}</p>
        </div>
      </div>
      <div class="form-actions" style="margin-top:20px">
        ${loggedIn
          ? '<button class="btn btn-danger" data-action="logout">Keluar</button>'
          : '<button class="btn btn-primary" data-page="login">Masuk / Daftar</button>'}
      </div>
    </div>
    <div class="list" style="margin-top:15px">
      <button class="list-row" data-page="announcements">♧ <span class="row-content"><strong>Pengumuman</strong></span> ›</button>
      <button class="list-row" data-page="guide">ⓘ <span class="row-content"><strong>Panduan</strong></span> ›</button>
    </div>`;
}

function renderLogin() {
  return `
    ${heading("Masuk ke LabCheck", "Masukkan data contoh untuk simulasi login.")}
    <form id="login-form" class="card form">
      <div class="field-group">
        <label for="username">Email atau username</label>
        <input id="username" name="username" class="field" required placeholder="Masukkan username">
      </div>
      <div class="field-group">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" class="field" required placeholder="Masukkan password">
      </div>
      <button class="btn btn-primary">Masuk</button>
      <p class="muted">Simulasi saja. Jangan masukkan password asli.</p>
      <button type="button" class="btn btn-soft" data-page="register">Belum punya akun? Daftar</button>
    </form>`;
}

function renderRegister() {
  return `
    ${heading("Buat Akun Demo", "Isi data contoh untuk simulasi registrasi.")}
    <form id="register-form" class="card form">
      <div class="field-group">
        <label for="reg-name">Nama lengkap</label>
        <input id="reg-name" name="name" class="field" required>
      </div>
      <div class="field-group">
        <label for="reg-email">Email</label>
        <input id="reg-email" name="email" type="email" class="field" required>
      </div>
      <div class="field-group">
        <label for="reg-username">Username</label>
        <input id="reg-username" name="username" class="field" required>
      </div>
      <div class="field-group">
        <label for="reg-password">Password demo</label>
        <input id="reg-password" name="password" type="password" minlength="4" class="field" required>
      </div>
      <button class="btn btn-primary">Daftar</button>
      <p class="muted">Data tidak dikirim ke server dan tidak disimpan permanen.</p>
      <button type="button" class="btn btn-soft" data-page="login">Sudah punya akun? Masuk</button>
    </form>`;
}

function render() {
  const pages = {
    home: renderHome,
    status: renderStatus,
    detail: renderDetail,
    report: renderReport,
    reportSuccess: renderReportSuccess,
    announcements: renderAnnouncements,
    announcementDetail: renderAnnouncementDetail,
    guide: renderGuide,
    profile: renderProfile,
    login: renderLogin,
    register: renderRegister
  };

  app.innerHTML = (pages[page] || renderHome)();

  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  // Pencarian tidak menggambar ulang seluruh halaman.
  const searchInput = document.querySelector("#pc-search");
  if (searchInput) {
    searchInput.addEventListener("input", event => {
      search = event.target.value;
      const filtered = computers.filter(pc =>
        pc.id.toLowerCase().includes(search.toLowerCase())
      );
      const list = document.querySelector("#computer-list");
      list.innerHTML = filtered.length
        ? filtered.map(computerRow).join("")
        : '<div class="card muted">Komputer tidak ditemukan.</div>';
    });
  }
}

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");

  if (pageButton) {
    if (pageButton.dataset.reportPc) selectedPC = pageButton.dataset.reportPc;
    navigate(pageButton.dataset.page);
    return;
  }

  const computerButton = event.target.closest("[data-computer]");
  if (computerButton) {
    selectedPC = computerButton.dataset.computer;
    navigate("detail");
    return;
  }

  const announcementButton = event.target.closest("[data-announcement]");
  if (announcementButton) {
    selectedAnnouncement = Number(announcementButton.dataset.announcement);
    navigate("announcementDetail");
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;

  if (action === "report-pc") {
    navigate("report");
  }

  if (action === "logout") {
    loggedIn = false;
    demoUser = null;
    navigate("profile");
    notify("Kamu sudah keluar dari akun demo.");
  }
});

document.addEventListener("change", event => {
  if (event.target.id === "lab-select" || event.target.id === "report-lab") {
    selectedLab = event.target.value;
  }

  if (event.target.id === "report-pc") {
    selectedPC = event.target.value;
  }
});

document.addEventListener("submit", event => {
  if (event.target.id === "report-form") {
    event.preventDefault();
    const data = new FormData(event.target);

    reports.push({
      lab: data.get("lab"),
      computer: data.get("computer"),
      kind: data.get("kind"),
      description: data.get("description")
    });

    navigate("reportSuccess");
  }

  if (event.target.id === "login-form") {
    event.preventDefault();
    const data = new FormData(event.target);

    demoUser = {
      name: "Pengguna Demo",
      email: data.get("username")
    };

    loggedIn = true;
    navigate("profile");
    notify("Login simulasi berhasil.");
  }

  if (event.target.id === "register-form") {
    event.preventDefault();
    const data = new FormData(event.target);

    demoUser = {
      name: data.get("name"),
      email: data.get("email")
    };

    loggedIn = true;
    navigate("profile");
    notify("Registrasi simulasi berhasil.");
  }
});

render();

