/*************************************************
SIGAP KAKA
Script.html
Versi 1.0 (Y.T.W)
*************************************************/

let dataHarga = [];
let chart = null;

const API = "https://script.google.com/macros/s/AKfycby4Nj4f_VqvNUXb64WcOfIoowbzS_mEXdo6jJqaZLcFjzw4erkFkGmrAFMrgGxn9diy/exec";

/*==============================
LOAD APLIKASI
==============================*/

window.onload = function () {

    loadDashboard();

    loadData();

    loadKomoditasSlider();

    loadKomoditi();

    loadGaleri();

    loadPeta();

    setTimeout(function () {

        document.getElementById("loading").style.display = "none";

    }, 1000);

};

/*==============================
DASHBOARD
==============================*/

async function loadDashboard() {

    try {

        const response = await fetch(API + "?action=getDashboard");
        const data = await response.json();

        document.getElementById("jumlahKomoditi").innerHTML =
            data.jumlah;

        document.getElementById("hargaTertinggi").innerHTML =
            (data.naik || 0) + " Komoditas";

        document.getElementById("hargaTerendah").innerHTML =
            (data.turun || 0) + " Komoditas";

        document.getElementById("updateTerakhir").innerHTML =
            data.update;

    } catch (err) {

        console.error("Load Dashboard gagal:", err);

    }

}

/*==============================
LOAD DATA
==============================*/

function loadData(){

    google.script.run
    .withSuccessHandler(function(hasil){

        dataHarga = hasil;
        dataTampil = hasil;
        tampilkanTabel(dataTampil);
        buatGrafik(dataTampil);

    })
    .getHarga();

}

/*==============================
TABEL
==============================*/

function tampilkanTabel(data) {

    let html = "";

    data.forEach(function (item, index) {

        let status = badgeStatus(item.harga, item.hargaSebelumnya);

        let badgeStok = "";

if(item.ketersediaan=="Banyak"){

    badgeStok='<span class="badge-banyak">🟢 Banyak</span>';

}else if(item.ketersediaan=="Cukup"){

    badgeStok='<span class="badge-cukup">🟡 Cukup</span>';

}else{

    badgeStok='<span class="badge-kurang">🔴 Kurang</span>';

}

html += `
<tr>

<td class="text-center">

<span class="nomor-urut">

${index+1}

</span>

</td>

<td>

<span class="nama-komoditi">

${iconKomoditi(item.komoditi)} ${item.komoditi}

</span>

</td>

<td class="text-end">

Rp ${Number(item.harga).toLocaleString("id-ID")}

</td>

<td class="text-center">

<span class="badge-satuan">

${item.satuan}

</span>

</td>

<td class="text-center">

<span class="badge-tanggal">

📅 ${item.tanggal}

</span>

</td>

<td class="text-center">

${badgeStok}

</td>

<td class="text-center">

${status}

</td>

</tr>
`;

    });

    document.getElementById("tbodyHarga").innerHTML = html;

}

/*==============================
LOAD KOMODITI
==============================*/

function loadKomoditi() {

    google.script.run
        .withSuccessHandler(function (list) {

            let html =

                '<option value="">Semua Komoditas</option>';

            list.forEach(function (k) {

                html +=

                    `<option value="${k}">${k}</option>`;

            });

            document.getElementById("filterKomoditi").innerHTML = html;

        })
        .getKomoditi();

}
/*==================================================
GRAFIK CHART.JS
==================================================*/

function buatGrafik(data){

    const label = [];
    const nilai = [];

    data.forEach(function(item){

        label.push(item.komoditi);
        nilai.push(item.harga);

    });

    const ctx = document.getElementById("chartHarga").getContext("2d");

    if(chart){
        chart.destroy();
    }

    chart = new Chart(ctx,{

        type:'bar',

        data:{

            labels:label,

            datasets:[{

                label:'Harga (Rp)',

                data:nilai,

                borderWidth:1

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    display:true
                }

            },

            scales:{

                y:{

                    beginAtZero:true

                }

            }

        }

    });

}

/*==================================================
LOGIN
==================================================*/

function showLogin(){

    const modal=new bootstrap.Modal(

        document.getElementById("loginModal")

    );

    modal.show();

}

/*==================================================
LOGIN
==================================================*/

function login(){

    const user =
        document.getElementById("username").value;

    const pass =
        document.getElementById("password").value;

    if(user == "" || pass == ""){

        tampilToast(
            "Username dan Password wajib diisi."
        );

        return;

    }

    google.script.run

    .withSuccessHandler(function(result){

        if(result && result.status){
          sessionStorage.setItem("ROLE", result.role);
sessionStorage.setItem("NAMA", result.nama);

            google.script.run

                .withSuccessHandler(function(url){

                    if(result.role == "ADMIN"){

    window.top.location.href =
        url + "?page=admin";

}else if(result.role == "VERIFIKATOR"){

    window.top.location.href =
        url + "?page=verifikasi";

}else{

    alert("Role pengguna tidak dikenali.");

}

                })

                .withFailureHandler(function(error){

                    alert(
                        "LOGIN BERHASIL, TETAPI ADMIN GAGAL DIBUKA:\n" +
                        error.message
                    );

                })

                .getWebAppUrl();


        }else{

            alert(
                "Username atau Password salah."
            );

        }

    })

    .withFailureHandler(function(error){

        alert(
            "LOGIN ERROR: " +
            error.message
        );

    })

    .login(
        user,
        pass
    );

}

/*==================================================
LOGOUT
==================================================*/

function logout(){

    document.getElementById("btnExport").style.display="none";
    document.getElementById("btnHistori").style.display="none";

    tampilToast("Logout berhasil.");

}

/*==================================================
STATUS HARGA
==================================================*/

function badgeStatus(hargaBaru,hargaLama){

    if(Number(hargaBaru)>Number(hargaLama)){

        return '<span class="badge-naik">▲ Naik</span>';

    }

    if(Number(hargaBaru)<Number(hargaLama)){

        return '<span class="badge-turun">▼ Turun</span>';

    }

    return '<span class="badge-tetap">➖ Tetap</span>';

}

function iconKomoditi(nama){

    nama = nama.toLowerCase();

    if(nama.includes("beras")) return "🌾";

    if(nama.includes("cabai")) return "🌶️";

    if(nama.includes("bawang")) return "🧅";

    if(nama.includes("telur")) return "🥚";

    if(nama.includes("ayam")) return "🐔";

    if(nama.includes("daging")) return "🥩";

    if(nama.includes("ikan")) return "🐟";

    if(nama.includes("minyak")) return "🫗";

    if(nama.includes("gula")) return "🍚";

    if(nama.includes("garam")) return "🧂";

    if(nama.includes("tepung")) return "🌾";

    return "🛒";

}

/*==================================================
TOAST
==================================================*/

function tampilToast(pesan){

    document.getElementById("toastBody").innerHTML=pesan;

    const toast=new bootstrap.Toast(

        document.getElementById("toastInfo")

    );

    toast.show();

}

/*==================================================
BACK TO TOP
==================================================*/

window.onscroll=function(){

    if(document.body.scrollTop>200 ||

       document.documentElement.scrollTop>200){

        document.getElementById("btnTop").style.display="block";

    }else{

        document.getElementById("btnTop").style.display="none";

    }

};

document.getElementById("btnTop")
.addEventListener("click",function(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});

/*==================================================
REFRESH
==================================================*/

function refreshData(){

    document.getElementById("loading").style.display="flex";

    loadDashboard();

    loadData();

    setTimeout(function(){

        document.getElementById("loading").style.display="none";

    },800);

}

/*==================================================
AUTO REFRESH
==================================================*/

setInterval(function(){

    loadDashboard();

    loadData();

},300000); // 5 menit

/*==================================================
FORMAT RUPIAH
==================================================*/

function rupiah(nilai){

    return "Rp " +

    Number(nilai).toLocaleString("id-ID");

}

document.getElementById("search")
.addEventListener("keyup", filterData);

document.getElementById("filterKomoditi")
.addEventListener("change", filterData);

document.getElementById("filterTanggal")
.addEventListener("change", filterData);

function filterData(){

    const komoditi = document.getElementById("filterKomoditi").value;
    const tglInput = document.getElementById("filterTanggal").value;
    const keyword = document.getElementById("search").value.toLowerCase();

    // Jika tidak memilih tanggal, tampilkan data terbaru
    if(tglInput == ""){

        let hasil = dataHarga;

        if(komoditi != ""){
            hasil = hasil.filter(item => item.komoditi == komoditi);
        }

        if(keyword != ""){
            hasil = hasil.filter(item =>
                item.komoditi.toLowerCase().includes(keyword)
            );
        }

        tampilkanTabel(hasil);
        buatGrafik(hasil);
        return;
    }

    // Format yyyy-mm-dd menjadi dd/MM/yyyy
    const p = tglInput.split("-");
    const tanggal = p[2] + "/" + p[1] + "/" + p[0];

    google.script.run
    .withSuccessHandler(function(data){

        // Search berdasarkan keyword
        if(keyword != ""){

            data = data.filter(function(item){

                return item.komoditi
                    .toLowerCase()
                    .includes(keyword);

            });

        }

        tampilkanTabel(data);
        buatGrafik(data);

    })
    .getHargaFilter(tanggal, komoditi);

}

/* ==========================================
   ICON KOMODITAS
========================================== */

function getEmojiKomoditas(nama){

    const n = String(nama).toLowerCase().trim();


    /* =========================
       BERAS
    ========================= */

    if(n.includes("beras medium"))
        return "🍚";

    if(n.includes("beras premium"))
        return "🌾";

    if(n.includes("beras sphp"))
        return "🌾";


    /* =========================
       MINYAK
    ========================= */

    if(n.includes("minyak kita") || n.includes("minyakita"))
        return "🧴";

    if(n.includes("minyak goreng"))
        return "🍳";


    /* =========================
       SAYUR
    ========================= */

    if(n === "kol" || n.includes("kubis"))
    return "🥬";

    if(n.includes("sawi"))
        return "🥬";

    if(n.includes("kangkung"))
        return "🌿";

    if(n.includes("bayam"))
        return "🍃";


    /* =========================
       KEDELAI DAN TEMPE
    ========================= */

    if(n.includes("kedelai"))
        return "🫘";

    if(n.includes("tempe"))
        return "🟫";


    /* =========================
       TEPUNG
    ========================= */

    if(n.includes("tepung"))
        return "🥣";


    /* =========================
       BAWANG
    ========================= */

    if(n.includes("bawang merah"))
        return "🧅";

    if(n.includes("bawang putih"))
        return "🧄";


    /* =========================
       CABAI
    ========================= */

    if(n.includes("cabai"))
        return "🌶️";


    /* =========================
       TELUR
    ========================= */

    if(n.includes("telur"))
        return "🥚";


    /* =========================
       DAGING
    ========================= */

    if(n.includes("daging ayam"))
        return "🍗";

    if(n.includes("daging sapi"))
        return "🥩";


    /* =========================
       IKAN
    ========================= */

    if(n.includes("ikan tongkol"))
        return "🐟";

    if(n.includes("ikan kembung"))
        return "🐟";

    if(n.includes("ikan"))
        return "🐟";


    /* =========================
       GULA DAN GARAM
    ========================= */

    if(n.includes("gula"))
        return "🍬";

    if(n.includes("garam"))
        return "🧂";


    /* =========================
       KOMODITAS LAIN
    ========================= */

    if(n.includes("jagung"))
        return "🌽";

    if(n.includes("kentang"))
        return "🥔";

    if(n.includes("tomat"))
        return "🍅";

    if(n.includes("wortel"))
        return "🥕";

    /* DEFAULT */

    return "🧺";

}

/* ==========================================
   LOAD SLIDER KOMODITAS
========================================== */

function loadKomoditasSlider() {

    google.script.run
        .withSuccessHandler(function(data) {

            const track =
                document.getElementById("komoditasTrack");

            if (!track) return;

            track.innerHTML = "";

            let html = "";

            data.forEach(function(item) {

                const nama = item.nama || item;

                html += `
                    <div class="komoditas-item">

                        <div class="komoditas-foto">

                            <span class="emoji-komoditas">
                                ${getEmojiKomoditas(nama)}
                            </span>

                        </div>

                        <div class="komoditas-nama">
                            ${nama}
                        </div>

                    </div>
                `;

            });

            /* DUPLIKASI AGAR SLIDER TIDAK PUTUS */

            track.innerHTML = html + html;

        })
        .getKomoditi();

}

/* ==========================================
   BUKA LOGIN VERIFIKATOR
========================================== */

function bukaLoginVerifikator(){

    google.script.run

        .withSuccessHandler(function(url){

            window.top.location.href =
                url + "?page=LoginVerifikator";

        })

        .withFailureHandler(function(error){

            alert(
                "Gagal membuka login verifikator:\n" +
                error.message
            );

        })

        .getWebAppUrl();

}

/* ======================================
   GALERI FOTO SIGAP KAKA
====================================== */

let dataGaleri = [];
let indexGaleri = 0;

function loadGaleri(){

    google.script.run
        .withSuccessHandler(function(data){

            dataGaleri = data;

            if(dataGaleri.length > 0){

                tampilGaleri();

                setInterval(nextGaleri,10000);

            }

        })
        .withFailureHandler(function(err){

            alert(err.message);

        })
        .getGaleri();

}

function tampilGaleri(){

    if(dataGaleri.length === 0) return;

    const foto = document.getElementById("galeriFoto");
    const judul = document.getElementById("galeriJudul");

    foto.style.animation = "none";

    void foto.offsetWidth;

    foto.style.animation = "kenburns 10s linear forwards";

    foto.src = dataGaleri[indexGaleri].foto;

    judul.textContent = dataGaleri[indexGaleri].judul;

}

function nextGaleri(){

    indexGaleri++;

    if(indexGaleri >= dataGaleri.length){

        indexGaleri = 0;

    }

    tampilGaleri();

}

let map;

function loadPeta(){

    if(map) return;

    map = L.map("mapKupang",{
        zoomControl:true
    }).setView([-10.1050,123.8150],10);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:"© OpenStreetMap",
            maxZoom:19
        }
    ).addTo(map);

    // Dinas Pertanian dan Ketahanan Pangan
    L.marker([-10.074305,123.869481])
    .addTo(map)
    .bindPopup(`
        <b>Dinas Pertanian dan Ketahanan Pangan</b><br>
        Kompleks Kantor Bupati Kupang<br>
        Oelamasi
    `);

    // Marker Pasar Oesao
L.marker([-10.11713, 123.80887])
.addTo(map)
.bindPopup(`
<b>Pasar Oesao</b><br>
Kecamatan Kupang Timur
`);

}
