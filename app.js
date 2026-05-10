const GAS_URL = "https://script.google.com/macros/s/URL_WEB_APP_ANDA/exec"; // GANTI INI!
let currentUser = null;

function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  event.target.classList.add('active');
  if(name === 'rekap') loadRekap();
}

// 🔐 LOGIN (Enter otomatis OK karena pakai <form>)
async function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const msg = document.getElementById('login-msg');
  msg.textContent = "";

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "login", username: u, password: p }),
      headers: { "Content-Type": "text/plain" }
    });
    const data = await res.json();
    if(data.success) {
      currentUser = data;
      document.getElementById('login-page').classList.remove('active');
      document.getElementById('dashboard-page').classList.add('active');
      document.getElementById('user-role').textContent = data.role;
      loadSettings();
    } else {
      msg.textContent = "❌ " + data.error;
    }
  } catch(err) { msg.textContent = "❌ Gagal terhubung. Cek URL GAS."; }
}

function logout() {
  currentUser = null;
  document.getElementById('dashboard-page').classList.remove('active');
  document.getElementById('login-page').classList.add('active');
}

// 📝 ABSENSI (Enter otomatis OK)
async function simpanAbsen(e) {
  e.preventDefault();
  const nis = document.getElementById('scan-input').value.trim();
  const tgl = document.getElementById('tgl-absen').value;
  const sesi = document.querySelectorAll('.sesi-cb:checked');
  const status = document.getElementById('status-absen').value;

  if(!nis || !tgl || sesi.length === 0) return alert("Lengkapi data!");

  for(let s of sesi) {
    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ action: "absen", nis, tanggal: tgl, sesi: s.value, status, metode: "Manual/Scan", petugas: currentUser.username }),
        headers: { "Content-Type": "text/plain" }
      });
      const data = await res.json();
      if(!data.success) return alert(data.error);
    } catch(err) { return alert("Gagal terhubung ke server."); }
  }
  alert("✅ Absen berhasil!");
  document.getElementById('scan-input').value = "";
  document.getElementById('scan-input').focus();
}

async function kunciSesi() {
  if(!confirm("Kunci semua sesi hari ini? Tidak bisa diubah lagi.")) return;
  const tgl = document.getElementById('tgl-absen').value;
  for(let i=1; i<=3; i++) {
    await fetch(GAS_URL, { method:"POST", body:JSON.stringify({ action:"kunci_sesi", tanggal:tgl, sesi:i, petugas:currentUser.username }), headers:{"Content-Type":"text/plain"} });
  }
  alert("🔒 Semua sesi hari ini telah dikunci.");
}

// ⚙️ PENGATURAN
async function setupDB() {
  const id = document.getElementById('set-sheet-id').value.trim();
  if(!id) return alert("Masukkan ID Sheet!");
  try {
    const res = await fetch(GAS_URL, { method:"POST", body:JSON.stringify({ action:"setup", sheetsId:id }), headers:{"Content-Type":"text/plain"} });
    const data = await res.json();
    alert(data.message || data.error);
  } catch(err) { alert("Gagal setup. Cek koneksi atau URL GAS."); }
}

async function loadSettings() {
  try {
    const res = await fetch(GAS_URL, { method:"POST", body:JSON.stringify({ action:"get_settings" }), headers:{"Content-Type":"text/plain"} });
    const data = (await res.json()).data || {};
    document.getElementById('set-nama').value = data.nama_madrasah || "";
    document.getElementById('set-thr-reg').value = data.threshold_reguler || 25;
    document.getElementById('set-thr-khad').value = data.threshold_khadim || 100;
    document.getElementById('set-ai-key').value = data.ai_api_key || "";
    document.getElementById('school-name').textContent = data.nama_madrasah || "MA Darul Hikmah";
  } catch(err) {}
}

async function simpanSettings() {
  const payload = {
    action: "save_settings",
    nama_madrasah: document.getElementById('set-nama').value,
    threshold_reguler: document.getElementById('set-thr-reg').value,
    threshold_khadim: document.getElementById('set-thr-khad').value,
    ai_api_key: document.getElementById('set-ai-key').value
  };
  await fetch(GAS_URL, { method:"POST", body:JSON.stringify(payload), headers:{"Content-Type":"text/plain"} });
  alert("✅ Pengaturan disimpan!");
  loadSettings();
}

// 📊 REKAP & AI
async function loadRekap() {
  document.getElementById('ai-loading').textContent = "Memuat data...";
  document.getElementById('rekap-body').innerHTML = "";
  document.getElementById('ai-result').innerHTML = "";
  
  try {
    const res = await fetch(GAS_URL, { method:"POST", body:JSON.stringify({ action:"get_rekap" }), headers:{"Content-Type":"text/plain"} });
    const data = await res.json();
    
    if(data.success && data.data.length > 0) {
      document.getElementById('rekap-body').innerHTML = data.data.map(r => 
        `<tr><td>${r.nis}</td><td>${r.tanggal.split('T')[0]}</td><td>${r.sesi}</td><td>${r.status}</td></tr>`
      ).join('');
      
      const alphaCount = data.data.filter(r => r.status === "Alpha").length;
      let saran = "✅ Kehadiran stabil.";
      if(alphaCount > 5) saran = "⚠️ Terdeteksi peningkatan alpha. Saran: Wali kelas melakukan pendampingan ke siswa dengan alpha ≥ 3 kali.";
      document.getElementById('ai-result').innerHTML = `<div class="card" style="background:#f0fdf4; border-left:4px solid var(--gold);"><strong>🤖 Saran AI:</strong><br>${saran}</div>`;
    } else {
      document.getElementById('ai-result').innerHTML = "<p>Belum ada data.</p>";
    }
  } catch(err) { document.getElementById('ai-loading').textContent = "Gagal memuat."; }
  document.getElementById('ai-loading').textContent = "";
}

document.getElementById('tgl-absen').valueAsDate = new Date();
