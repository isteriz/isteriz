<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ses Servisi Çalışma Planı & Analiz Paneli</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #f97316; border-radius: 4px; }
        body { -webkit-tap-highlight-color: transparent; }
    </style>
</head>
<body class="bg-slate-50 font-sans text-slate-800 antialiased min-h-screen flex flex-col">

    <header class="bg-gradient-to-r from-sky-600 via-blue-600 to-orange-500 text-white shadow-lg sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
            <div class="flex items-center space-x-2.5 cursor-pointer" onclick="switchSection('personnel')">
                <div class="bg-white text-orange-500 p-2 rounded-xl shadow-md flex items-center justify-center">
                    <i class="fa-solid fa-microphone-lines text-lg block"></i>
                </div>
                <div>
                    <h1 class="text-base font-black tracking-wide leading-none text-white">SES SERVİSİ</h1>
                    <span class="text-[10px] text-orange-100 font-bold tracking-widest uppercase">Planlama & Analiz</span>
                </div>
            </div>
            
            <div class="flex items-center space-x-2">
                <button onclick="switchSection('personnel')" id="btn-nav-personnel" class="px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 bg-white text-sky-700 shadow">
                    <i class="fa-solid fa-calendar-week"></i>
                    <span class="hidden sm:inline">Haftalık Plan</span>
                </button>
                <button onclick="checkAdminAccess()" id="btn-nav-admin" class="px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 bg-sky-700/50 text-sky-100 hover:bg-sky-700">
                    <i class="fa-solid fa-chart-line"></i>
                    <span>Yönetici Analiz</span>
                </button>
            </div>
        </div>
    </header>

    <main class="flex-grow max-w-7xl w-full mx-auto px-3 py-4 sm:py-6 space-y-4">

        <div id="loader-live-data" class="bg-white border border-sky-100 rounded-2xl p-8 text-center max-w-md mx-auto my-6 shadow-md flex flex-col items-center justify-center">
            <i class="fa-solid fa-circle-notch text-orange-500 text-4xl mb-3 animate-spin"></i>
            <h3 class="text-sm font-black text-slate-900">Güncel Plan Yükleniyor</h3>
            <p class="text-[11px] text-slate-500 mt-1">Excel ve ortak izin verileri senkronize ediliyor...</p>
        </div>

        <div id="alert-no-data" class="bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-6 text-center max-w-md mx-auto my-6 hidden">
            <i class="fa-solid fa-cloud-bounce text-orange-500 text-4xl mb-2 block animate-bounce"></i>
            <h3 class="text-sm font-bold text-slate-900">Otomatik Veri Bağlantısı Kurulamadı</h3>
            <p class="text-xs text-slate-600 mt-1 mb-4">Gorev-Listesi.xlsx dosyasına erişilemedi. Lütfen aşağıdan manuel yükleme yapın.</p>
            <button onclick="checkAdminAccess()" class="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
                <i class="fa-solid fa-file-excel mr-1"></i> Manuel Excel Yükle
            </button>
        </div>

        <section id="section-personnel" class="space-y-4 hidden">
            <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto">
                <label class="block text-sky-600 text-xs font-black uppercase tracking-widest text-center mb-2.5"><i class="fa-solid fa-circle-user text-orange-500 mr-1"></i> LÜTFEN İSMİNİZİ SEÇİNİZ</label>
                <select id="staff-dropdown" onchange="displayStaffCards()" class="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-sm font-black rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all cursor-pointer shadow-inner">
                    <option value="" disabled selected>Personel Listesi Bekleniyor...</option>
                </select>
            </div>

            <div id="schedule-wrapper" class="hidden space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 gap-2 shadow-sm">
                    <div>
                        <h2 id="worker-title-name" class="text-base font-black text-slate-900 uppercase tracking-tight flex items-center">-</h2>
                        <p class="text-[11px] text-slate-500 mt-0.5">Sarı satırlar kesinleşmeyen ihtimallerdir. İlk 3 sütundan sonra bölme çizgisi eklenir.</p>
                    </div>
                    <div id="sync-timestamp-badge" class="text-[10px] bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-black self-start sm:self-center shadow-sm border border-orange-200">Veri Durumu: Bilinmiyor</div>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                    <div class="overflow-x-auto custom-scroll">
                        <table class="w-full text-left border-collapse min-w-[650px]">
                            <thead>
                                <tr class="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-[11px] font-black uppercase tracking-wider">
                                    <th class="p-4 pl-5 w-44">Tarih / Gün</th>
                                    <th class="p-4 w-32 text-center">Durum</th>
                                    <th class="p-4">Görevlendirilen Program / Stüdyo & Alt Açıklamalar</th>
                                    <th class="p-4 w-32 text-center">Yayın Saati</th>
                                    <th class="p-4 w-32 text-right pr-5">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody id="weekly-schedule-table-body" class="divide-y-2 divide-slate-300 text-xs font-bold text-slate-700">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

        <section id="section-admin" class="hidden space-y-4">
            <div class="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h4 class="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-cloud-bolt"></i> GitHub Actions Güvenli Otomasyon Sistemi Aktif
                    </h4>
                    <p class="text-[10px] text-slate-400 mt-0.5">Artık cihazlarda bireysel token tanımlamaya gerek yoktur. Tüm işlemler merkezi işleyiciyle senkronize edilir.</p>
                </div>
                <div class="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-xl font-mono text-center">
                    Bağlantı Türü: Dispatch API (Token-Free UI)
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                    <h3 class="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <i class="fa-solid fa-chart-pie text-orange-500"></i> Yönetici Analitik Paneli
                    </h3>
                    <p class="text-[11px] text-slate-500 mt-0.5">Yaptığınız tüm izin işlemleri bağlı GitHub deposuna anlık olarak işlenir.</p>
                </div>
                
                <div class="md:col-span-2 flex flex-wrap gap-2 justify-start md:justify-end">
                    <button onclick="fetchExcelFromGithub(true)" class="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-black px-4 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-rotate"></i> Depodan Güncelle
                    </button>
                    
                    <div class="relative bg-orange-50 hover:bg-orange-100 rounded-xl px-4 py-3 border-2 border-dashed border-orange-200 flex items-center justify-center cursor-pointer transition-colors">
                        <label class="text-xs font-black text-orange-800 cursor-pointer flex items-center gap-1.5">
                            <i class="fa-solid fa-file-excel text-orange-600 text-sm"></i> Yeni Excel Yükle
                        </label>
                        <input type="file" id="upload-excel-input" accept=".xlsx, .xls" class="absolute inset-0 opacity-0 cursor-pointer w-full" />
                    </div>
                    <button onclick="exportSesBackup()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5">
    <i class="fa-solid fa-download"></i> Verileri Yedekle
</button>

<div class="relative bg-amber-50 hover:bg-amber-100 rounded-xl px-4 py-3 border-2 border-dashed border-amber-200 flex items-center justify-center cursor-pointer transition-colors">
    <label class="text-xs font-black text-amber-800 cursor-pointer flex items-center gap-1.5">
        <i class="fa-solid fa-upload text-amber-600 text-sm"></i> Yedeği Geri Yükle
    </label>
    <input type="file" id="import-ses-file" accept=".json" class="absolute inset-0 opacity-0 cursor-pointer w-full" onchange="importSesBackup(event)">
</div>
                    <button onclick="resetAllStoredData()" class="bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold px-3 py-2 rounded-xl border border-red-200 transition-colors">
                        <i class="fa-solid fa-trash-can"></i> Hafızayı Sıfırla
                    </button>
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 class="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-umbrella-beach text-orange-500"></i> PERSONEL YILLIK İZİN GİRİŞİ VE ANALİZ ENTEGRASYONU
                </h4>
                <form id="leave-entry-form" onsubmit="saveStaffLeave(event)" class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase block mb-1">İzin Kullanacak Personel</label>
                        <select id="leave-staff-select" class="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-2 focus:outline-none text-slate-900" required></select>
                    </div>
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase block mb-1">İzin Başlangıç Tarihi</label>
                        <input type="date" id="leave-start-date" class="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg p-2 focus:outline-none text-slate-900" required>
                    </div>
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase block mb-1">İzin Bitiş Tarihi</label>
                        <input type="date" id="leave-end-date" class="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg p-2 focus:outline-none text-slate-900" required>
                    </div>
                    <button type="submit" class="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black py-2 rounded-lg shadow-md hover:from-orange-600 transition-all cursor-pointer">
                        <i class="fa-solid fa-calendar-plus mr-1"></i> İzin Tanımla (Analize İşle)
                    </button>
                </form>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
                <div class="flex flex-col">
                    <label class="text-[10px] font-black text-slate-400 uppercase mb-1">Personel Seçimi</label>
                    <select id="admin-staff-filter" onchange="applyLogFilters()" class="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-2 focus:outline-none text-slate-900">
                        <option value="ALL">-- TÜM PERSONELLER --</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <label class="text-[10px] font-black text-slate-400 uppercase mb-1">Başlangıç Tarihi</label>
                    <input type="date" id="analysis-start-date" onchange="applyLogFilters()" class="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg p-2 focus:outline-none text-slate-900">
                </div>
                <div class="flex flex-col">
                    <label class="text-[10px] font-black text-slate-400 uppercase mb-1">Bitiş Tarihi</label>
                    <input type="date" id="analysis-end-date" onchange="applyLogFilters()" class="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg p-2 focus:outline-none text-slate-900">
                </div>
                <div class="flex flex-col">
                    <label class="text-[10px] font-black text-slate-400 uppercase mb-1">Hızlı Ay Filtresi</label>
                    <select id="filter-month" onchange="syncDateFiltersFromDropdowns()" class="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-2 focus:outline-none text-slate-900">
                        <option value="ALL">Tüm Aylar</option>
                        <option value="01">Ocak</option><option value="02">Şubat</option><option value="03">Mart</option>
                        <option value="04">Nisan</option><option value="05">Mayıs</option><option value="06" selected>Haziran</option>
                        <option value="07">Temmuz</option><option value="08">Ağustos</option><option value="09">Eylül</option>
                        <option value="10">Ekim</option><option value="11">Kasım</option><option value="12">Aralık</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <label class="text-[10px] font-black text-slate-400 uppercase mb-1">Yıl Filtresi</label>
                    <select id="filter-year" onchange="syncDateFiltersFromDropdowns()" class="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-2 focus:outline-none text-slate-900">
                        <option value="ALL">Tüm Yıllar</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-sky-500 to-blue-600 p-4 rounded-2xl shadow-sm text-white flex flex-col justify-between">
                    <span class="text-[10px] font-black text-sky-100 uppercase tracking-wider">Aktif / Toplam Personel</span>
                    <h4 id="metric-total-staff" class="text-2xl font-black mt-1">0</h4>
                </div>
                <div class="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-2xl shadow-sm text-white flex flex-col justify-between">
                    <span id="label-total-shifts" class="text-[10px] font-black text-orange-100 uppercase tracking-wider">Filtreli Kesin Görev</span>
                    <h4 id="metric-total-shifts" class="text-2xl font-black mt-1">0</h4>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dönem En Yoğunu / Durum</span>
                    <h4 id="metric-max-staff" class="text-xs font-black text-slate-800 mt-2 truncate">-</h4>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Filtreli Aktif İzin Günü</span>
                    <h4 id="metric-active-leaves-count" class="text-2xl font-black text-orange-600 mt-1">0 Gün</h4>
                </div>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 class="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-code-compare text-indigo-500"></i> İKİ PERSONEL GÖREV KIYASLAMA MODÜLÜ
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase block mb-1">1. Personel</label>
                        <select id="compare-staff-1" class="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-2 focus:outline-none text-slate-900"></select>
                    </div>
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase block mb-1">2. Personel</label>
                        <select id="compare-staff-2" class="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-2 focus:outline-none text-slate-900"></select>
                    </div>
                    <button onclick="executeStaffComparison()" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black py-2 rounded-lg shadow-md hover:from-indigo-700 transition-all cursor-pointer">
                        <i class="fa-solid fa-magnifying-glass-chart mr-1"></i> Karşılaştır ve Grafik Göster
                    </button>
                </div>
                <div id="compare-result-box" class="hidden bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs font-bold text-slate-800">
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
                    <div>
                        <h4 id="chart-main-title" class="font-black text-slate-800 text-xs uppercase tracking-wider mb-4"><i class="fa-solid fa-chart-column text-orange-500 mr-1"></i> Yoğunluk Grafiği</h4>
                        <div class="relative min-h-[260px] max-h-[290px]">
                            <canvas id="canvas-admin-chart"></canvas>
                        </div>
                    </div>
                    <div id="chart-timeline-filter-wrapper" class="hidden mt-3 border-t border-slate-100 pt-3 flex items-center justify-center gap-1.5">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1"><i class="fa-solid fa-clock-rotate-left"></i> Grafik Kırılımı:</span>
                        <button onclick="changeChartScaleMode('weekly')" id="btn-scale-weekly" class="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all shadow-sm">Haftalık</button>
                        <button onclick="changeChartScaleMode('monthly')" id="btn-scale-monthly" class="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">Aylık</button>
                        <button onclick="changeChartScaleMode('yearly')" id="btn-scale-yearly" class="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all">Yıllık</button>
                    </div>
                </div>
                
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h4 id="side-panel-title" class="font-black text-slate-800 text-xs uppercase tracking-wider mb-3"><i class="fa-solid fa-list-ol text-sky-500 mr-1"></i> Görev Dağılım Sıralaması</h4>
                        <div id="wrapper-side-table" class="overflow-y-auto max-h-[260px] border border-slate-100 rounded-xl custom-scroll">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr id="side-table-header" class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider sticky top-0 z-10">
                                        <th class="p-2.5">Detay Başlığı</th>
                                        <th class="p-2.5 text-center">Kesin İş</th>
                                    </tr>
                                </thead>
                                <tbody id="table-body-admin-logs" class="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 class="font-black text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span><i class="fa-solid fa-umbrella-beach text-orange-500 mr-1"></i> KADRO DETAYLI YILLIK İZİN DAĞILIMI VE İPTAL MODÜLÜ</span>
                </h4>
                <div class="overflow-x-auto border border-slate-100 rounded-xl custom-scroll">
                    <table class="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase">
                                <th class="p-3 pl-4">Personel Adı</th>
                                <th class="p-3">İzinli Dönemler</th>
                                <th class="p-3 text-center">Toplam Kullanılan İzin</th>
                                <th class="p-3 text-right pr-4">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="table-body-leave-history" class="divide-y divide-slate-100 text-xs text-slate-700 font-bold">
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="panel-detailed-job-history" class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hidden">
                <h4 class="font-black text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span><i class="fa-solid fa-business-time text-emerald-500 mr-1"></i> SEÇİLEN PERSONELİN BU TARİH ARALIĞINDAKİ TÜM İŞLERİ GÖRÜNTÜLEME ALANI</span>
                    <span id="badge-history-count" class="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded-md">0 İş Bulundu</span>
                </h4>
                <div class="overflow-x-auto border border-slate-100 rounded-xl custom-scroll">
                    <table class="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase">
                                <th class="p-3 pl-4">Tarih / Gün</th>
                                <th class="p-3">Program / Görev Adı & Alt Hücre Detayları</th>
                                <th class="p-3">Açıklama / Alt Hücre Detayı</th>
                                <th class="p-3 text-center">Saat</th>
                            </tr>
                        </thead>
                        <tbody id="table-body-history-details" class="divide-y divide-slate-100 text-xs text-slate-700 font-bold">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </main>

    <div id="modal-team-view" class="fixed inset-0 bg-slate-950/50 z-50 hidden flex justify-center items-center p-4 backdrop-blur-sm">
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 border border-slate-100">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1"><i class="fa-solid fa-users text-orange-500"></i> Görev Ekip Arkadaşlar Bürgüsü</h3>
                <button onclick="closeTeamModal()" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="modal-info-header" class="text-xs bg-sky-50 border border-sky-100 p-3 rounded-xl font-black text-sky-950 mb-4 leading-tight"></div>
            <ul id="modal-staff-list" class="space-y-1.5 text-xs font-bold text-slate-800 max-h-[220px] overflow-y-auto custom-scroll pr-1"></ul>
        </div>
    </div>

    <div id="modal-auth-gate" class="fixed inset-0 bg-slate-950/50 z-50 hidden flex justify-center items-center p-4 backdrop-blur-sm">
        <div class="bg-white w-full max-w-xs rounded-2xl shadow-2xl p-6 border border-slate-100 text-center">
            <div class="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl shadow-inner"><i class="fa-solid fa-lock"></i></div>
            <h3 class="font-black text-slate-900 text-sm mb-1">Yönetici Girişi</h3>
            <p class="text-xs text-slate-500 mb-4">Lütfen tanımlı yönetim şifresini giriniz.</p>
            <input type="password" id="field-gate-pass" placeholder="•••••••" class="w-full text-center tracking-widest font-black text-xl border-2 border-slate-200 rounded-xl py-2 mb-3 bg-slate-50 focus:outline-none focus:border-orange-500">
            <div id="wrapper-pass-error" class="text-red-500 text-xs font-bold hidden mb-3"><i class="fa-solid fa-circle-exclamation"></i> Şifre Hatalı!</div>
            <div class="flex space-x-2">
                <button onclick="closeAuthModal()" class="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer">İptal</button>
                <button onclick="submitAuthGatePassword()" class="w-1/2 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-black text-xs py-3 rounded-xl shadow transition-colors cursor-pointer">Giriş Yap</button>
            </div>
        </div>
    </div>

    <script>
        const GITHUB_LIVE_EXCEL = "Gorev-Listesi.xlsx"; 
        const GITHUB_LIVE_LEAVES = "izinler.json"; 
        const SUPER_KEY = "7124624";
        
        const GITHUB_REPO_OWNER = "sesservisi";
        const GITHUB_REPO_NAME = "ses";

        const USER_EXPLICIT_25 = [
            "H.BAKIRCI", "A.KOÇ", "C.SALTIK", "D.A.SALTIK", "A.AŞİROĞLU", 
            "E.YURDAGÜL", "A.DEMİRKAYA", "F.BOZKURT", "H.HEKİMHAN", "Ş.ÖNALAN", 
            "S.ARAS", "M.DİNER", "D.YÖNDEM", "E.KOL", "A.C.PEHLİVAN", 
            "T.ERDEN", "S.CÜREBAL", "S.AKDAĞ", "A.KORUN", "Y.ŞAHİN", 
            "K.GÜNGÖR", "Ç.TAŞ", "E.DÖNMEZ", "Ö.KARAKUŞ", "E.SAVAŞ"
        ].sort();

        const MONTH_NAMES = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        const TURKISH_DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

        const TARGET_EXCEL_COLUMNS = [
            { label: "B", idx: 1 }, { label: "F", idx: 5 }, { label: "J", idx: 9 }, 
            { label: "N", idx: 13 }, { label: "R", idx: 17 }, { label: "V", idx: 21 }, 
            { label: "Z", idx: 25 }, { label: "AD", idx: 29 }, { label: "AH", idx: 33 }, 
            { label: "AL", idx: 37 }
        ];

        let mainShiftsLogPool = [];
        let timePeriodDaysList = []; 
        let staffLeavePool = [];
        let currentActiveTab = 'personnel';
        let chartInstanceReference = null;
        let activeChartScaleMode = 'weekly';

        window.addEventListener('DOMContentLoaded', () => {
            buildYearFilterOptions();
            loadDatabaseFromLocalStorage();
            rebuildStaffDropdownOptions();
            fetchExcelFromGithub(false);
            document.getElementById('upload-excel-input').addEventListener('change', processManualFileLoad, false);
        });

        function buildYearFilterOptions() {
            const yrSelect = document.getElementById('filter-year'); if(!yrSelect) return;
            yrSelect.innerHTML = '<option value="ALL">Tüm Yıllar</option>';
            for(let y = 2026; y <= 2035; y++) {
                const opt = document.createElement('option');
                opt.value = y.toString(); opt.textContent = y.toString();
                if(y === 2026) opt.selected = true;
                yrSelect.appendChild(opt);
            }
        }

        function loadDatabaseFromLocalStorage() {
            const savedPool = localStorage.getItem('ses_cumulative_shifts_pool');
            const savedDays = localStorage.getItem('ses_cumulative_days_list');
            const savedLeaves = localStorage.getItem('ses_staff_leaves_pool');
            if(savedPool) mainShiftsLogPool = JSON.parse(savedPool);
            if(savedDays) timePeriodDaysList = JSON.parse(savedDays);
            if(savedLeaves) staffLeavePool = JSON.parse(savedLeaves);
        }

        function saveDatabaseToLocalStorage() {
            localStorage.setItem('ses_cumulative_shifts_pool', JSON.stringify(mainShiftsLogPool));
            localStorage.setItem('ses_cumulative_days_list', JSON.stringify(timePeriodDaysList));
            localStorage.setItem('ses_staff_leaves_pool', JSON.stringify(staffLeavePool));
        }

        async function uploadLeaveJsonToGithubDirectly() {
            const b64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(staffLeavePool, null, 2))));
            const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/dispatches`;
            
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        event_type: 'update_leaves',
                        client_payload: {
                            matrix_data: b64Payload
                        }
                    })
                });
                console.log("GitHub Actions tetiklendi.");
            } catch(e) {
                console.error("Otomasyon tetikleme hatası: ", e);
            }
        }

        function resetAllStoredData() {
            if(confirm("TÜM GEÇMİŞ HAFIZA SİLİNECEK! Emin misiniz?")) {
                localStorage.clear(); alert("Hafıza sıfırlandı."); location.reload();
            }
        }

        function switchSection(tabName) {
            currentActiveTab = tabName;
            if(tabName === 'personnel') {
                document.getElementById('section-personnel').classList.remove('hidden');
                document.getElementById('section-admin').classList.add('hidden');
                document.getElementById('btn-nav-personnel').className = "px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 bg-white text-sky-700 shadow";
                document.getElementById('btn-nav-admin').className = "px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 bg-sky-700/50 text-sky-100 hover:bg-sky-700";
                displayStaffCards();
            } else {
                document.getElementById('section-personnel').classList.add('hidden');
                document.getElementById('section-admin').classList.remove('hidden');
                document.getElementById('btn-nav-admin').className = "px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 bg-white text-orange-600 shadow";
                document.getElementById('btn-nav-personnel').className = "px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 bg-sky-700/50 text-sky-100 hover:bg-sky-700";
                applyLogFilters();
                displayLeaveHistoryTable();
            }
        }

        function checkAdminAccess() {
            if(localStorage.getItem('ses_admin_session_live') === 'true') { switchSection('admin'); } 
            else { document.getElementById('modal-auth-gate').classList.remove('hidden'); document.getElementById('field-gate-pass').focus(); }
        }

        function closeAuthModal() {
            document.getElementById('modal-auth-gate').classList.add('hidden');
            document.getElementById('wrapper-pass-error').classList.add('hidden');
            document.getElementById('field-gate-pass').value = "";
        }

        function submitAuthGatePassword() {
            if(document.getElementById('field-gate-pass').value === SUPER_KEY) {
                localStorage.setItem('ses_admin_session_live', 'true'); closeAuthModal(); switchSection('admin');
            } else { document.getElementById('wrapper-pass-error').classList.remove('hidden'); }
        }

        // CRITICAL UPDATE: CACHE BUSTING MECHANISM (FORCED TIME-STAMPED REQUESTS)
        async function fetchExcelFromGithub(isManualClick = false) {
            if(!isManualClick) {
                document.getElementById('loader-live-data').classList.remove('hidden');
                document.getElementById('alert-no-data').classList.add('hidden');
                document.getElementById('section-personnel').classList.add('hidden');
            }
            
            // Her istekte benzersiz bir zaman damgası üreterek sunucu ve tarayıcı önbelleğini kırıyoruz
            const cacheBuster = new Date().getTime();

            try {
                const leaveRes = await fetch(GITHUB_LIVE_LEAVES + "?v=" + cacheBuster, {
                    method: 'GET',
                    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
                });
                if (leaveRes.ok) {
                    const onlineLeaves = await leaveRes.json();
                    if (Array.isArray(onlineLeaves)) {
                        staffLeavePool = onlineLeaves;
                        localStorage.setItem('ses_staff_leaves_pool', JSON.stringify(staffLeavePool));
                    }
                }
            } catch (e) { console.log("Ortak izinler okunamadı."); }

            try {
                const res = await fetch(GITHUB_LIVE_EXCEL + "?v=" + cacheBuster, {
                    method: 'GET',
                    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
                });
                
                if(res.ok) {
                    const buffer = await res.arrayBuffer();
                    const uintArray = new Uint8Array(buffer);
                    const workbook = XLSX.read(uintArray, {type: 'array', cellDates: false, raw: true}); 
                    compileExcelAndMerge(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1, defval: null}));
                    
                    document.getElementById('loader-live-data').classList.add('hidden');
                    document.getElementById('section-personnel').classList.remove('hidden');
                    document.getElementById('schedule-wrapper').classList.remove('hidden');
                    document.getElementById('sync-timestamp-badge').textContent = `Canlı Entegre (${new Date().toLocaleTimeString().substring(0,5)})`;
                    if(isManualClick) alert("Tüm Excel ve ortak izin verileri önbellek kırılarak başarıyla çekildi!");
                    displayStaffCards();
                } else { throw new Error(); }
            } catch(e) {
                document.getElementById('loader-live-data').classList.add('hidden');
                if(mainShiftsLogPool.length > 0) {
                    document.getElementById('section-personnel').classList.remove('hidden');
                    document.getElementById('schedule-wrapper').classList.remove('hidden');
                } else { document.getElementById('alert-no-data').classList.remove('hidden'); }
            }
        }

        function processManualFileLoad(event) {
            const uploadedFile = event.target.files[0]; if(!uploadedFile) return;
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                const workbook = XLSX.read(new Uint8Array(e.target.result), {type: 'array', cellDates: false, raw: true});
                compileExcelAndMerge(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1, defval: null}));
                alert("Manuel yükleme başarılı!"); displayStaffCards();
            };
            fileReader.readAsArrayBuffer(uploadedFile);
        }

        function parseExcelDate(rawDateVal) {
            if (typeof rawDateVal === 'number') {
                let utc_days = Math.floor(rawDateVal - 25569);
                let date_info = new Date(utc_days * 86400 * 1000);
                let dayNum = date_info.getUTCDate();
                let monthNum = date_info.getUTCMonth() + 1;
                let yearNum = date_info.getUTCFullYear();
                return { formatted: `${dayNum < 10 ? '0'+dayNum : dayNum}.${monthNum < 10 ? '0'+monthNum : monthNum}.${yearNum}`, mm: (monthNum < 10 ? '0'+monthNum : monthNum).toString(), yy: yearNum.toString() };
            } else if (rawDateVal) {
                let cleanStr = String(rawDateVal).split(' ')[0].trim();
                let dateParts = cleanStr.split('.');
                if (dateParts.length === 3) { return { formatted: cleanStr, mm: dateParts[1], yy: dateParts[2] }; }
            }
            return null;
        }

        function compileExcelAndMerge(matrix) {
            if(!matrix || matrix.length < 3) return;
            
            const rowDays = matrix[0]; 
            const rowDates = matrix[1];
            let newIncomingDays = [];

            TARGET_EXCEL_COLUMNS.forEach(col => {
                let actualColIdx = col.idx;
                if (actualColIdx >= rowDays.length) return;

                let rawDayVal = rowDays[actualColIdx];
                let rawDateVal = rowDates[actualColIdx];

                if (rawDateVal || rawDayVal) {
                    let parsedDate = parseExcelDate(rawDateVal);
                    let formatted = parsedDate ? parsedDate.formatted : "";
                    let mm = parsedDate ? parsedDate.mm : "06";
                    let yy = parsedDate ? parsedDate.yy : "2026";
                    let computedDayTitle = rawDayVal ? String(rawDayVal).trim().toUpperCase() : "";

                    if (!computedDayTitle && formatted) {
                        let p = (formatted || "").split('.');
                        if(p.length === 3) {
                            let calendarCheck = new Date(p[2], p[1] - 1, p[0]);
                            computedDayTitle = TURKISH_DAYS[calendarCheck.getDay()].toUpperCase();
                        }
                    }

                    if (formatted) {
                        newIncomingDays.push({ dateTitle: formatted, dayTitle: computedDayTitle, month: mm, year: yy, excelColIdx: actualColIdx });
                    }
                }
            });

            newIncomingDays.sort((a, b) => {
                let pA = (a.dateTitle || "").split('.'), pB = (b.dateTitle || "").split('.');
                if(pA.length === 3 && pB.length === 3) { return new Date(`${pA[2]}-${pA[1]}-${pA[0]}`) - new Date(`${pB[2]}-${pB[1]}-${pB[0]}`); }
                return 0;
            });

            timePeriodDaysList = [...newIncomingDays];
            const newDatesSet = newIncomingDays.map(d => d.dateTitle);
            
            mainShiftsLogPool = mainShiftsLogPool.filter(log => !newDatesSet.includes(log.date) || log.uniqueKey.startsWith("leave_"));

            newIncomingDays.forEach(dayColumn => {
                let actualColIdx = dayColumn.excelColIdx;
                let blockStructureList = [];
                let currentBlock = null;

                for (let rIdx = 2; rIdx < matrix.length; rIdx++) {
                    if (!matrix[rIdx]) continue;
                    let cellVal = matrix[rIdx][actualColIdx];
                    let cellHour = matrix[rIdx][actualColIdx + 2]; 

                    let cleanStr = cellVal ? String(cellVal).trim() : "";
                    if (cleanStr === "null" || cleanStr === "") continue;

                    let isProgramHeader = cleanStr.includes("YAYIN") || cleanStr.includes("STÜDYOSU") || cleanStr.includes("SAHNESİ") || cleanStr.includes("GÜNDEM") || cleanStr.includes("WORLD") || cleanStr.includes("HABER") || (cleanStr === cleanStr.toUpperCase() && cleanStr.length > 8 && !cleanStr.includes("."));

                    if (isProgramHeader) {
                        currentBlock = { programName: cleanStr, hour: cellHour ? String(cellHour).trim() : "Belirtilmedi", rowStart: rIdx, uniqueKey: dayColumn.dateTitle + "_" + actualColIdx + "_b_" + rIdx, subLines: [] };
                        blockStructureList.push(currentBlock);
                    } else if (currentBlock) {
                        currentBlock.subLines.push({ text: cleanStr, rowIdx: rIdx });
                    }
                }

                blockStructureList.forEach(block => {
                    let items = block.subLines;
                    for (let i = 0; i < items.length; i++) {
                        let currentText = items[i].text;
                        let hasDot = currentText.endsWith(".");
                        let sanitizedName = currentText.replace(/\.+$/, "").trim();

                        if (USER_EXPLICIT_25.includes(sanitizedName)) {
                            let descriptionLines = [];
                            for (let j = i - 1; j >= 0; j--) {
                                let prevText = items[j].text;
                                let prevSanitized = prevText.replace(/\.+$/, "").trim();
                                if (USER_EXPLICIT_25.includes(prevSanitized)) break;
                                descriptionLines.unshift(prevText);
                            }
                            for (let j = i + 1; j < items.length; j++) {
                                let nextText = items[j].text;
                                let nextSanitized = nextText.replace(/\.+$/, "").trim();
                                if (USER_EXPLICIT_25.includes(nextSanitized)) break;
                                descriptionLines.push(nextText);
                            }

                            mainShiftsLogPool.push({
                                workerName: sanitizedName, date: dayColumn.dateTitle, dayName: dayColumn.dayTitle, month: dayColumn.month, year: dayColumn.year,
                                program: block.programName, subDetail: descriptionLines.join(" / "), hour: block.hour, uniqueKey: block.uniqueKey, isProbability: hasDot
                            });
                        }
                    }
                });
            });

            staffLeavePool.forEach(leave => {
                let currentDate = new Date(leave.start);
                const stopDate = new Date(leave.end);

                while (currentDate <= stopDate) {
                    let dayNum = currentDate.getDate();
                    let monthNum = currentDate.getMonth() + 1;
                    let yearNum = currentDate.getFullYear();
                    let formattedDate = `${dayNum < 10 ? '0'+dayNum : dayNum}.${monthNum < 10 ? '0'+monthNum : monthNum}.${yearNum}`;
                    let computedDayTitle = TURKISH_DAYS[currentDate.getDay()].toUpperCase();
                    let checkKey = "leave_" + leave.id + "_" + formattedDate;

                    if (!mainShiftsLogPool.some(l => l.uniqueKey === checkKey)) {
                        mainShiftsLogPool.push({
                            workerName: leave.workerName, date: formattedDate, dayName: computedDayTitle, month: (monthNum < 10 ? '0'+monthNum : monthNum).toString(), year: yearNum.toString(),
                            program: "YILLIK İZİN GÖREVİ", subDetail: "Ortak Sistem Tarafından İzinli İşlendi", hour: "00:00", uniqueKey: checkKey, isProbability: false
                        });
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });

            if (newIncomingDays.length > 0) {
                let p = (newIncomingDays[0].dateTitle || "").split('.');
                if(p.length === 3) document.getElementById('analysis-start-date').value = `${p[2]}-${p[1]}-${p[0]}`;
                let lastP = (newIncomingDays[newIncomingDays.length - 1].dateTitle || "").split('.');
                if(lastP.length === 3) document.getElementById('analysis-end-date').value = `${lastP[2]}-${lastP[1]}-${lastP[0]}`;
            }

            saveDatabaseToLocalStorage();
            rebuildStaffDropdownOptions();
        }

        function rebuildStaffDropdownOptions() {
            const sel = document.getElementById('staff-dropdown'); 
            const adminSel = document.getElementById('admin-staff-filter');
            const comp1 = document.getElementById('compare-staff-1');
            const comp2 = document.getElementById('compare-staff-2');
            const leaveSel = document.getElementById('leave-staff-select');

            if(sel) {
                const cache = sel.value; sel.innerHTML = "";
                USER_EXPLICIT_25.forEach(n => { const o = document.createElement('option'); o.value=n; o.textContent=n; sel.appendChild(o); });
                sel.value = (cache && USER_EXPLICIT_25.includes(cache)) ? cache : USER_EXPLICIT_25[0];
            }
            if(adminSel) {
                adminSel.innerHTML = '<option value="ALL">-- TÜM PERSONELLER --</option>';
                USER_EXPLICIT_25.forEach(n => { const o = document.createElement('option'); o.value=n; o.textContent=n; adminSel.appendChild(o); });
            }
            if(comp1 && comp2) {
                comp1.innerHTML = ""; comp2.innerHTML = "";
                USER_EXPLICIT_25.forEach((n) => {
                    const o1 = document.createElement('option'); o1.value=n; o1.textContent=n; comp1.appendChild(o1);
                    const o2 = document.createElement('option'); o2.value=n; o2.textContent=n; comp2.appendChild(o2);
                });
                if(USER_EXPLICIT_25.length > 1) comp2.selectedIndex = 1;
            }
            if(leaveSel) {
                leaveSel.innerHTML = "";
                USER_EXPLICIT_25.forEach(n => { const o = document.createElement('option'); o.value=n; o.textContent=n; leaveSel.appendChild(o); });
            }
        }

        function saveStaffLeave(e) {
            e.preventDefault();
            const staffName = document.getElementById('leave-staff-select').value;
            const startVal = document.getElementById('leave-start-date').value;
            const endVal = document.getElementById('leave-end-date').value;

            if(!startVal || !endVal) return;
            if(new Date(startVal) > new Date(endVal)) { alert("Hata: İzin bitiş tarihi, başlangıç tarihinden önce olamaz!"); return; }

            const uniqueLeaveId = Date.now();
            const newLeave = { id: uniqueLeaveId, workerName: staffName, start: startVal, end: endVal };
            staffLeavePool.push(newLeave);

            let currentDate = new Date(startVal);
            const stopDate = new Date(endVal);

            while (currentDate <= stopDate) {
                let dayNum = currentDate.getDate();
                let monthNum = currentDate.getMonth() + 1;
                let yearNum = currentDate.getFullYear();
                let formattedDate = `${dayNum < 10 ? '0'+dayNum : dayNum}.${monthNum < 10 ? '0'+monthNum : monthNum}.${yearNum}`;
                let computedDayTitle = TURKISH_DAYS[currentDate.getDay()].toUpperCase();

                mainShiftsLogPool.push({
                    workerName: staffName, date: formattedDate, dayName: computedDayTitle, month: (monthNum < 10 ? '0'+monthNum : monthNum).toString(), year: yearNum.toString(),
                    program: "YILLIK İZİN GÖREVİ", subDetail: "Ortak Sistem Tarafından İzinli İşlendi", hour: "00:00", uniqueKey: "leave_" + uniqueLeaveId + "_" + formattedDate, isProbability: false
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }

            saveDatabaseToLocalStorage();
            document.getElementById('leave-entry-form').reset();
            uploadLeaveJsonToGithubDirectly();
            alert(`${staffName} için izin başarıyla tanımlandı.`);
            displayLeaveHistoryTable();
            applyLogFilters();
        }

        function deleteStaffLeave(id) {
            if(confirm("Bu yıllık izin kaydını silmek istediğinize emin misiniz?")) {
                mainShiftsLogPool = mainShiftsLogPool.filter(log => !log.uniqueKey.startsWith("leave_" + id + "_"));
                staffLeavePool = staffLeavePool.filter(l => l.id !== id);
                saveDatabaseToLocalStorage();
                uploadLeaveJsonToGithubDirectly();
                displayLeaveHistoryTable();
                applyLogFilters();
                alert("İzin silindi.");
            }
        }

        function displayLeaveHistoryTable() {
            const tbody = document.getElementById('table-body-leave-history'); if(!tbody) return;
            tbody.innerHTML = '';

            if(staffLeavePool.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">Sistemde kayıtlı aktif yıllık izin bulunmamaktadır.</td></tr>`;
                return;
            }

            let sortedLeaves = [...staffLeavePool].sort((a,b) => b.id - a.id);
            sortedLeaves.forEach(leave => {
                const sDate = new Date(leave.start);
                const eDate = new Date(leave.end);
                const totalDays = Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) + 1;

                const tr = document.createElement('tr'); tr.className = "hover:bg-slate-50";
                tr.innerHTML = `
                    <td class="p-3 pl-4 font-black text-slate-900">${leave.workerName}</td>
                    <td class="p-3 text-slate-600 font-bold">${(leave.start || "").split('-').reverse().join('.')} / ${(leave.end || "").split('-').reverse().join('.')}</td>
                    <td class="p-3 text-center text-orange-600 font-black">${totalDays} Gün</td>
                    <td class="p-3 text-right pr-4">
                        <button onclick="deleteStaffLeave(${leave.id})" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer">Kaldır / İptal Et</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function displayStaffCards() {
            const selectedStaffName = document.getElementById('staff-dropdown').value; if(!selectedStaffName) return;
            document.getElementById('worker-title-name').innerHTML = `<i class="fa-solid fa-user-check text-orange-500 mr-2"></i> ${selectedStaffName}`;
            const tableBody = document.getElementById('weekly-schedule-table-body'); tableBody.innerHTML = "";

            const personalShiftsList = mainShiftsLogPool.filter(s => s.workerName === selectedStaffName);
            const todayStr = new Date().toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit', year:'numeric'}).replace(/\//g,'.');

            timePeriodDaysList.forEach((dayItem, index) => {
                if (index === 3) {
                    const dividerRow = document.createElement('tr');
                    dividerRow.className = "bg-gradient-to-r from-orange-500 via-orange-600 to-sky-600 text-white font-extrabold text-[11px]";
                    dividerRow.innerHTML = `<td colspan="5" class="p-3 text-center tracking-wider uppercase shadow-md"><i class="fa-solid fa-calendar-days mr-1.5"></i> YENİ HAFTA LİSTESİ (PAZARTESİ VE SONRASI)</td>`;
                    tableBody.appendChild(dividerRow);
                }

                const activeShifts = personalShiftsList.filter(s => s.date === dayItem.dateTitle);
                const isToday = (dayItem.dateTitle === todayStr);
                
                let dateBadgeHtml = `<div class="font-black text-slate-800 text-sm">${dayItem.dateTitle}</div><div class="text-[11px] text-sky-600 font-extrabold uppercase tracking-wide">${dayItem.dayTitle}</div>`;
                let rowHighlightClass = "";
                if (isToday) {
                    dateBadgeHtml = `<div class="font-black text-orange-600 text-sm">✨ BUGÜN</div><div class="text-[11px] text-orange-500 font-black uppercase">${dayItem.dayTitle} (${dayItem.dateTitle})</div>`;
                    rowHighlightClass = "border-2 border-orange-500 bg-orange-50/70";
                }

                if (activeShifts.length === 0) {
                    const row = document.createElement('tr'); row.className = isToday ? rowHighlightClass : "bg-white";
                    row.innerHTML = `<td class="p-4 pl-5 border-b border-slate-100">${dateBadgeHtml}</td><td class="p-4 border-b border-slate-100 text-center"><span class="bg-slate-100 text-slate-400 text-[10px] font-black px-2 py-1 rounded-xl block">BOŞ GÜN</span></td><td class="p-4 border-b border-slate-100 italic text-slate-400 text-[11px]">Görev veya yayın yazılmamış.</td><td class="p-4 border-b border-slate-100 text-center">-</td><td class="p-4 border-b border-slate-100 text-center">-</td>`;
                    tableBody.appendChild(row);
                } else {
                    activeShifts.forEach((shift, sIdx) => {
                        const row = document.createElement('tr');
                        if (isToday) row.className = rowHighlightClass;
                        else row.className = shift.isProbability ? "bg-amber-50/60 hover:bg-amber-50" : "bg-white hover:bg-slate-50";
                        
                        let badge = `<span class="bg-sky-600 text-white text-[10px] font-black px-2.5 py-1 rounded-xl block text-center shadow-sm">KESİN GÖREV</span>`;
                        if (shift.isProbability) badge = `<span class="bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-xl block text-center shadow-sm"><i class="fa-solid fa-circle-question"></i> İHTİMAL</span>`;
                        if (shift.program === "YILLIK İZİN GÖREVİ") { badge = `<span class="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl block text-center shadow-sm"><i class="fa-solid fa-umbrella-beach"></i> İZİNLİ</span>`; }

                        let programDisplayHtml = `<div class="text-slate-950 font-black text-sm block tracking-tight">${shift.program}</div>`;
                        if (shift.subDetail && shift.subDetail.trim() !== "") { programDisplayHtml += `<div class="text-slate-600 font-bold text-xs mt-1 block leading-normal">${shift.subDetail}</div>`; }

                        row.innerHTML = `
                            <td class="p-4 pl-5 border-b border-slate-100">${sIdx === 0 ? dateBadgeHtml : ''}</td>
                            <td class="p-4 border-b border-slate-100 text-center">${badge}</td>
                            <td class="p-4 border-b border-slate-100">${programDisplayHtml}</td>
                            <td class="p-4 border-b border-slate-100 text-center"><span class="bg-slate-100 px-2 py-1 rounded-lg font-black text-[11px]"><i class="fa-solid fa-clock text-orange-500"></i> ${shift.hour}</span></td>
                            <td class="p-4 border-b border-slate-100 text-right pr-5">
                                <button onclick="triggerTeamDiscoveryModal('${shift.uniqueKey}', '${shift.program}', '${shift.date}')" class="bg-white hover:bg-orange-500 text-slate-700 hover:text-white border border-slate-200 font-black text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-sm">Ekip</button>
                            </td>
                        `;
                        tableBody.appendChild(row);
                    });
                }
            });
        }

        function triggerTeamDiscoveryModal(key, name, date) {
            const list = document.getElementById('modal-staff-list'); list.innerHTML = "";
            document.getElementById('modal-info-header').textContent = `${date} - ${name}`;
            const members = [...new Set(mainShiftsLogPool.filter(s => s.uniqueKey === key).map(s => s.workerName))];
            members.forEach(m => {
                const li = document.createElement('li'); li.className = "p-2 bg-slate-50 border rounded-lg text-xs font-bold";
                li.innerHTML = `<i class="fa-solid fa-user text-slate-400 mr-2"></i>${m}`; list.appendChild(li);
            });
            document.getElementById('modal-team-view').classList.remove('hidden');
        }
        function closeTeamModal() { document.getElementById('modal-team-view').classList.add('hidden'); }

        function syncDateFiltersFromDropdowns() {
            const mm = document.getElementById('filter-month').value;
            const yy = document.getElementById('filter-year').value;
            if (mm !== 'ALL' && yy !== 'ALL') {
                document.getElementById('analysis-start-date').value = `${yy}-${mm}-01`;
                document.getElementById('analysis-end-date').value = `${yy}-${mm}-${mm==='02'?'28':['04','06','09','11'].includes(mm)?'30':'31'}`;
            }
            applyLogFilters();
        }

        function changeChartScaleMode(mode) {
            activeChartScaleMode = mode;
            const btnWeekly = document.getElementById('btn-scale-weekly');
            const btnMonthly = document.getElementById('btn-scale-monthly');
            const btnYearly = document.getElementById('btn-scale-yearly');

            [btnWeekly, btnMonthly, btnYearly].forEach(btn => {
                btn.className = "bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-black px-3 py-1.5 rounded-lg transition-all";
            });

            if(mode === 'weekly') btnWeekly.className = "bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all shadow-sm";
            if(mode === 'monthly') btnMonthly.className = "bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all shadow-sm";
            if(mode === 'yearly') btnYearly.className = "bg-indigo-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all shadow-sm";

            applyLogFilters();
        }

        function getWeekNumber(d) {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
            var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            return Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        }

        function applyLogFilters() {
            const selectedStaff = document.getElementById('admin-staff-filter').value;
            const startDateVal = document.getElementById('analysis-start-date').value;
            const endDateVal = document.getElementById('analysis-end-date').value;

            let startDate = startDateVal ? new Date(startDateVal) : null;
            let endDate = endDateVal ? new Date(endDateVal) : null;

            let filteredShifts = mainShiftsLogPool.filter(log => {
                if (log.isProbability) return false; 
                if (selectedStaff !== "ALL" && log.workerName !== selectedStaff) return false;

                let dateStr = log.date || "";
                let parts = dateStr.split('.');
                if (parts.length !== 3) return false;
                let logDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

                if (startDate && logDate < startDate) return false;
                if (endDate && logDate > endDate) return false;
                return true;
            });

            let totalLeaveDays = 0;
            staffLeavePool.forEach(leave => {
                if (selectedStaff !== "ALL" && leave.workerName !== selectedStaff) return;
                let lStart = new Date(leave.start);
                let lEnd = new Date(leave.end);
                let activeStart = startDate && lStart < startDate ? startDate : lStart;
                let activeEnd = endDate && lEnd > endDate ? endDate : lEnd;
                if (activeStart <= activeEnd) {
                    totalLeaveDays += Math.ceil(Math.abs(activeEnd - activeStart) / (1000 * 60 * 60 * 24)) + 1;
                }
            });
            document.getElementById('metric-active-leaves-count').textContent = totalLeaveDays + " Gün";

            const tBody = document.getElementById('table-body-admin-logs'); tBody.innerHTML = "";
            const sideHeader = document.getElementById('side-table-header');
            const sidePanelTitle = document.getElementById('side-panel-title');
            const chartMainTitle = document.getElementById('chart-main-title');
            const filterWrapper = document.getElementById('chart-timeline-filter-wrapper');

            if (selectedStaff === "ALL") {
                filterWrapper.classList.add('hidden');
                document.getElementById('panel-detailed-job-history').classList.add('hidden');
                document.getElementById('label-total-shifts').textContent = "Filtreli Kesin Görev";
                chartMainTitle.innerHTML = `<i class="fa-solid fa-chart-column text-orange-500 mr-1"></i> Yoğunluk Grafiği`;
                sidePanelTitle.innerHTML = `<i class="fa-solid fa-list-ol text-sky-500 mr-1"></i> Görev Dağılım Sıralaması`;
                sideHeader.innerHTML = `<th class="p-2.5">Detay Başlığı</th><th class="p-2.5 text-center">Kesin İş</th>`;

                let staffJobCounts = {};
                USER_EXPLICIT_25.forEach(n => staffJobCounts[n] = 0);
                let evaluatedUniqueJobs = new Set();
                let totalKesinUniqueJobsCount = 0;

                filteredShifts.forEach(log => {
                    let progName = log.program || "";
                    let hrVal = log.hour || "";
                    let jobIdentityKey = `${log.date}_${progName.trim()}_${hrVal.trim()}`;
                    if (!evaluatedUniqueJobs.has(jobIdentityKey)) {
                        evaluatedUniqueJobs.add(jobIdentityKey);
                        totalKesinUniqueJobsCount++;
                    }
                    staffJobCounts[log.workerName] = (staffJobCounts[log.workerName] || 0) + 1;
                });

                let diagArr = USER_EXPLICIT_25.map(name => ({ name: name, count: staffJobCounts[name] || 0 }));
                diagArr.sort((a,b) => b.count - a.count);

                document.getElementById('metric-total-staff').textContent = USER_EXPLICIT_25.length + " Personel";
                document.getElementById('metric-total-shifts').textContent = totalKesinUniqueJobsCount + " Farklı İş";
                document.getElementById('metric-max-staff').textContent = diagArr[0].count > 0 ? `${diagArr[0].name} (${diagArr[0].count} İş)` : '-';

                diagArr.forEach(st => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td class="p-2.5 font-bold flex items-center gap-2"><span class="w-2 h-2 rounded-full ${st.count>0?'bg-emerald-500':'bg-slate-300'}"></span>${st.name}</td><td class="p-2.5 text-center font-black text-sky-600">${st.count} Görev</td>`;
                    tBody.appendChild(tr);
                });
                renderAdminChart(diagArr.map(s => s.name), diagArr.map(s => s.count), "Görev Sayısı", '#f97316');

            } else {
                filterWrapper.classList.remove('hidden');
                document.getElementById('label-total-shifts').textContent = selectedStaff + " Toplam İş";
                document.getElementById('metric-total-staff').textContent = "1 Personel Aktif";
                document.getElementById('metric-total-shifts').textContent = filteredShifts.length + " Görev";
                sideHeader.innerHTML = `<th class="p-2.5">Zaman Kırılımı</th><th class="p-2.5 text-center">İş Sayısı</th>`;

                let timeDistribution = {};
                let chartColor = '#10b981';

                if (activeChartScaleMode === 'weekly') {
                    chartMainTitle.innerHTML = `<i class="fa-solid fa-chart-bar text-orange-500 mr-1"></i> ${selectedStaff} - Haftalık Görev Dağılım Grafiği`;
                    sidePanelTitle.innerHTML = `<i class="fa-solid fa-calendar-week text-sky-500 mr-1"></i> Hafta Kırılım Analizi`;
                    chartColor = '#f97316';
                    filteredShifts.forEach(log => {
                        let parts = log.date.split('.');
                        let wNum = getWeekNumber(new Date(`${parts[2]}-${parts[1]}-${parts[0]}`));
                        timeDistribution[`${wNum}. Hafta (${log.year})`] = (timeDistribution[`${wNum}. Hafta (${log.year})`] || 0) + 1;
                    });
                } else if (activeChartScaleMode === 'monthly') {
                    chartMainTitle.innerHTML = `<i class="fa-solid fa-chart-line text-emerald-500 mr-1"></i> ${selectedStaff} - Aylık Görev Dağılım Grafiği`;
                    sidePanelTitle.innerHTML = `<i class="fa-solid fa-calendar-check text-sky-500 mr-1"></i> Ay Kırılım Analizi`;
                    chartColor = '#10b981';
                    filteredShifts.forEach(log => {
                        let mIdx = parseInt(log.month || "1") - 1;
                        let key = MONTH_NAMES[mIdx >= 0 && mIdx < 12 ? mIdx : 0] + " " + (log.year || "2026");
                        timeDistribution[key] = (timeDistribution[key] || 0) + 1;
                    });
                } else if (activeChartScaleMode === 'yearly') {
                    chartMainTitle.innerHTML = `<i class="fa-solid fa-chart-pie text-indigo-500 mr-1"></i> ${selectedStaff} - Yıllık Görev Dağılım Grafiği`;
                    sidePanelTitle.innerHTML = `<i class="fa-solid fa-calendar mr-2 text-sky-500"></i> Yıl Kırılım Analizi`;
                    chartColor = '#4f46e5';
                    filteredShifts.forEach(log => { timeDistribution[log.year || "2026"] = (timeDistribution[log.year || "2026"] || 0) + 1; });
                }

                let periodsArr = Object.keys(timeDistribution).map(k => ({ period: k, count: timeDistribution[k] }));
                periodsArr.sort((a, b) => a.period.localeCompare(b.period, undefined, { numeric: true, sensitivity: 'base' }));

                if(periodsArr.length === 0) {
                    const tr = document.createElement('tr'); tr.innerHTML = `<td colspan="2" class="p-3 text-center text-slate-400 italic">Bu dönemde kayıtlı iş yok.</td>`;
                    tBody.appendChild(tr); document.getElementById('metric-max-staff').textContent = "Veri Yok";
                } else {
                    periodsArr.forEach(p => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `<td class="p-2.5 font-bold text-slate-800"><i class="fa-regular fa-clock mr-2 text-slate-400"></i>${p.period}</td><td class="p-2.5 text-center font-black text-emerald-600">${p.count} İş</td>`;
                        tBody.appendChild(tr);
                    });
                    let maxBusy = [...periodsArr].sort((a,b) => b.count - a.count)[0];
                    document.getElementById('metric-max-staff').textContent = `En Yoğun: ${maxBusy.period}`;
                }

                const historyBody = document.getElementById('table-body-history-details'); historyBody.innerHTML = "";
                document.getElementById('badge-history-count').textContent = `${filteredShifts.length} İş Listeleniyor`;
                
                filteredShifts.sort((a,b) => {
                    let pA = (a.date || "").split('.'), pB = (b.date || "").split('.');
                    if(pA.length === 3 && pB.length === 3) return new Date(`${pA[2]}-${pA[1]}-${pA[0]}`) - new Date(`${pB[2]}-${pB[1]}-${pB[0]}`);
                    return 0;
                });

                if(filteredShifts.length === 0) {
                    historyBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">Seçilen tarih aralığında kesin iş bulunamadı.</td></tr>`;
                } else {
                    filteredShifts.forEach(shift => {
                        const tr = document.createElement('tr');
                        let displayProgram = shift.program; let rowStyle = "hover:bg-slate-50";
                        if (shift.program === "YILLIK İZİN GÖREVİ") { displayProgram = `🌴 [YILLIK İZİN GÖREVİ]`; rowStyle = "bg-orange-50/40 hover:bg-orange-50"; }
                        tr.className = rowStyle;
                        tr.innerHTML = `
                            <td class="p-3 pl-4"><div class="font-bold text-slate-900">${shift.date}</div><div class="text-[10px] text-slate-400 uppercase">${shift.dayName}</div></td>
                            <td class="p-3 text-slate-900 font-extrabold">${displayProgram}</td>
                            <td class="p-3 text-slate-700 font-bold">${shift.subDetail || '<span class="text-slate-300">-</span>'}</td>
                            <td class="p-3 text-center"><span class="bg-slate-100 px-2 py-1 rounded text-[11px] text-slate-700 font-black">${shift.hour}</span></td>
                        `;
                        historyBody.appendChild(tr);
                    });
                }
                document.getElementById('panel-detailed-job-history').classList.remove('hidden');
                renderAdminChart(periodsArr.map(p => p.period), periodsArr.map(p => p.count), "İş Sayısı", chartColor);
            }
        }

        function renderAdminChart(labels, data, datasetLabel, color) {
            const ctxEl = document.getElementById('canvas-admin-chart'); if(!ctxEl) return;
            if (chartInstanceReference) chartInstanceReference.destroy();
            chartInstanceReference = new Chart(ctxEl.getContext('2d'), {
                type: 'bar',
                data: { labels: labels, datasets: [{ label: datasetLabel, data: data, backgroundColor: color, borderRadius: 5 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
            });
        }

        function executeStaffComparison() {
            const p1 = document.getElementById('compare-staff-1').value;
            const p2 = document.getElementById('compare-staff-2').value;
            const startDateVal = document.getElementById('analysis-start-date').value;
            const endDateVal = document.getElementById('analysis-end-date').value;

            let startDate = startDateVal ? new Date(startDateVal) : null;
            let endDate = endDateVal ? new Date(endDateVal) : null;
            if(p1 === p2) { alert("Lütfen iki farklı personel seçiniz!"); return; }

            let count1 = 0; let count2 = 0;
            mainShiftsLogPool.forEach(log => {
                if (log.isProbability) return; 
                let parts = (log.date || "").split('.');
                if (parts.length !== 3) return;
                let logDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

                if (startDate && logDate < startDate) return;
                if (endDate && logDate > endDate) return;

                if(log.workerName === p1) count1++;
                if(log.workerName === p2) count2++;
            });

            const resultBox = document.getElementById('compare-result-box'); resultBox.classList.remove('hidden');
            let winnerText = count1 > count2 ? `<span class="text-emerald-600">${p1}</span> toplamda ${count1 - count2} iş fazla yapmış.` : count2 > count1 ? `<span class="text-emerald-600">${p2}</span> toplamda ${count2 - count1} iş fazla yapmış.` : "Yükler tamamen eşit.";

            resultBox.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                    <div><i class="fa-solid fa-scale-balanced text-indigo-600 mr-1.5 text-sm"></i><strong>Kıyas Sonucu:</strong> ${winnerText}</div>
                    <div class="flex gap-4 bg-white p-2 rounded-lg border border-indigo-100 shadow-sm text-[11px]">
                        <div>${p1}: <span class="text-indigo-600 font-black">${count1} İş</span></div>
                        <div class="border-l border-slate-200 pl-4">${p2}: <span class="text-purple-600 font-black">${count2} İş</span></div>
                    </div>
                </div>
            `;

            if (chartInstanceReference) chartInstanceReference.destroy();
            chartInstanceReference = new Chart(document.getElementById('canvas-admin-chart').getContext('2d'), {
                type: 'bar',
                data: { labels: [p1, p2], datasets: [{ label: 'Toplam Kesin İş Sayısı', data: [count1, count2], backgroundColor: ['#4f46e5', '#a855f7'], borderRadius: 6, barThickness: 50 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
            });
            document.getElementById('chart-main-title').innerHTML = `<i class="fa-solid fa-chart-bar text-indigo-500 mr-1"></i> ${p1} vs ${p2} Karşılaştırma Grafiği`;
        }
// Sitedeki gerçek verileri toplayıp tarayıcıyı indirmeye zorlayan fonksiyon
function exportSesBackup() {
    // Sitenizin LocalStorage üzerinde kullandığı gerçek anahtarlar
    const keysToBackup = [
        'ses_cumulative_shifts_pool',
        'ses_cumulative_days_list',
        'ses_staff_leaves_pool'
    ];
    
    let backupData = {};
    keysToBackup.forEach(key => {
        backupData[key] = localStorage.getItem(key);
    });
    
    // Eğer hiçbir veri yoksa kullanıcıyı uyar
    if (!backupData['ses_cumulative_shifts_pool'] && !backupData['ses_staff_leaves_pool']) {
        alert("Yedeklenecek herhangi bir veri bulunamadı! Lütfen önce bir Excel yükleyin.");
        return;
    }
    
    // Dosyayı ekranda açmaya çalışmasını engelleyen Blob yapısı (Kesin Çözüm)
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.href = url;
    dlAnchorElem.download = "ses_servisi_v2_yedek.json";
    document.body.appendChild(dlAnchorElem);
    
    // İndirmeyi tetikle
    dlAnchorElem.click();
    
    // Bellek temizliği
    document.body.removeChild(dlAnchorElem);
    URL.revokeObjectURL(url);
}

// İndirilen yedeği sisteme sorunsuz geri yükleyen fonksiyon
function importSesBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsedData = JSON.parse(e.target.result);
            
            // Dosyanın bizim yedek dosyası olup olmadığını kontrol et
            if (parsedData.hasOwnProperty('ses_cumulative_shifts_pool')) {
                Object.keys(parsedData).forEach(key => {
                    if (parsedData[key] !== null) {
                        localStorage.setItem(key, parsedData[key]);
                    }
                });
                alert("Harika! Tüm iş logları, tarihler ve personel izinleri kayıpsız şekilde geri yüklendi.");
                window.location.reload();
            } else {
                alert("Hatalı yedek dosyası! Lütfen geçerli bir ses_servisi_yedek.json dosyası seçin.");
            }
        } catch (err) {
            alert("Yedek dosyası işlenirken teknik bir hata oluştu.");
        }
    };
    reader.readAsText(file);
}
    </script>
</body>
</html>
