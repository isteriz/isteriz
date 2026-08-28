import React, { useState, useMemo } from 'react';
import { 
  Search, Tag, PlusCircle, ShieldCheck, AlertCircle, 
  Filter, MapPin, CheckCircle2, XCircle, ArrowRightLeft, 
  SlidersHorizontal, Check, Clock, ChevronDown, Sparkles
} from 'lucide-react';

// --- SAHTE KATEGORİ VE PİYASA MİNİMUM BÜTÇE LİMİTLERİ (Çöplüğü Önlemek İçin) ---
const CATEGORY_LIMITS = {
  'Telefon': { minBudget: 2000, marketAvg: 25000, name: 'Telefon' },
  'Bilgisayar': { minBudget: 5000, marketAvg: 35000, name: 'Bilgisayar' },
  'Vasıta': { minBudget: 50000, marketAvg: 600000, name: 'Vasıta' },
  'Oyun Konsolu': { minBudget: 3000, marketAvg: 18000, name: 'Oyun Konsolu' },
};

// --- ÖRNEK BİLİŞSEL İLAN VERİLERİ ---
const INITIAL_LISTINGS = [
  {
    id: '1',
    type: 'BUY',
    title: 'M1/M2 MacBook Air 16GB RAM Arıyorum',
    category: 'Bilgisayar',
    budgetOrPrice: 28000,
    city: 'İstanbul',
    district: 'Kadıköy',
    user: 'Ahmet Y.',
    trustScore: 98,
    createdAt: '2 saat önce',
    specs: { 'RAM': '16 GB', 'Depolama': '512 GB SSD', 'Kozmetik': 'Min 8/10', 'Pil': 'Min %85' },
    offersCount: 3,
    description: 'Yazılım geliştirme için temiz, tamirsiz MacBook Air arıyorum. Bütçem nakit hazırdır.'
  },
  {
    id: '2',
    type: 'BUY',
    title: 'Temiz iPhone 13 / 14 (Garantili)',
    category: 'Telefon',
    budgetOrPrice: 24000,
    city: 'Ankara',
    district: 'Çankaya',
    user: 'Mehmet K.',
    trustScore: 92,
    createdAt: '5 saat önce',
    specs: { 'Garanti': 'Devam Ediyor', 'Pil Sağlığı': 'Min %88', 'Renk': 'Farketmez' },
    offersCount: 5,
    description: 'Kutulu faturalı, ekranda derin çizik olmayan cihazlar teklif versin lütfen.'
  },
  {
    id: '3',
    type: 'SELL',
    title: 'Sony PlayStation 5 Slim 1TB + 2. Kol',
    category: 'Oyun Konsolu',
    budgetOrPrice: 19500,
    city: 'İzmir',
    district: 'Karşıyaka',
    user: 'Caner T.',
    trustScore: 100,
    createdAt: '1 gün önce',
    specs: { 'Durum': 'Sıfır Ayarında', 'Garanti': '12 Ay TR', 'Kutu/Aksesuar': 'Tam' },
    offersCount: 2,
    description: 'Eurasia garantili, çok az kullanıldı. Takas sadece üst model bilgisayarla olur.'
  }
];

export default function ReverseMarketplace() {
  // --- ANA EKRAN DURUMLARI ---
  const [mode, setMode] = useState('BUY'); // 'BUY' (Alıcı Modu) | 'SELL' (Satıcı Modu)
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);

  // --- İLAN VERME MODALI DURUMLARI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Telefon',
    budgetOrPrice: '',
    city: 'İstanbul',
    description: '',
    minCosmetic: '8/10',
    minBattery: '%85'
  });
  const [validationError, setValidationError] = useState('');

  // --- TEKLİF VERME MODALI ---
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [offerSuccess, setOfferSuccess] = useState(false);

  // --- İLAN FİLTRELEME MANTIĞI ---
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      const modeMatch = item.type === mode;
      const categoryMatch = selectedCategory === 'Tümü' || item.category === selectedCategory;
      const searchMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return modeMatch && categoryMatch && searchMatch;
    });
  }, [listings, mode, selectedCategory, searchQuery]);

  // --- İLAN EKLEME (ÇÖPLÜK ENGELLEME VALİDASYONU İLE) ---
  const handleCreateListing = (e) => {
    e.preventDefault();
    setValidationError('');

    const numericPrice = parseFloat(formData.budgetOrPrice);
    const categoryRules = CATEGORY_LIMITS[formData.category];

    // Anti-Spam Sınırı 1: Fiyat Kontrolü
    if (!numericPrice || numericPrice < categoryRules.minBudget) {
      setValidationError(`⚠️ Çöplük/Spam Engelleme: ${formData.category} kategorisinde en düşük bütçe/fiyat ${categoryRules.minBudget.toLocaleString('tr-TR')} TL olmalıdır.`);
      return;
    }

    // Anti-Spam Sınırı 2: Başlık Uzunluğu
    if (formData.title.trim().length < 12) {
      setValidationError('⚠️ Lütfen aradığınız/sattığınız ürünü açıkça belirten en az 12 karakterlik açıklayıcı bir başlık girin.');
      return;
    }

    const newListing = {
      id: Date.now().toString(),
      type: mode,
      title: formData.title,
      category: formData.category,
      budgetOrPrice: numericPrice,
      city: formData.city,
      district: 'Merkez',
      user: 'Siz (Doğrulanmış Üye)',
      trustScore: 100,
      createdAt: 'Az önce',
      specs: mode === 'BUY' ? {
        'Kozmetik Beklenti': formData.minCosmetic,
        'Pil Beklentisi': formData.minBattery,
      } : { 'Durum': 'İkinci El - Temiz' },
      offersCount: 0,
      description: formData.description
    };

    setListings([newListing, ...listings]);
    setIsModalOpen(false);
    setFormData({ title: '', category: 'Telefon', budgetOrPrice: '', city: 'İstanbul', description: '', minCosmetic: '8/10', minBattery: '%85' });
  };

  // --- TEKLİF GÖNDERME ---
  const handleSendOffer = (e) => {
    e.preventDefault();
    if (!offerPrice) return;

    // Gerçekte API'ye gidecek kısım
    setListings(prev => prev.map(item => {
      if (item.id === selectedListing.id) {
        return { ...item, offersCount: item.offersCount + 1 };
      }
      return item;
    }));

    setOfferSuccess(true);
    setTimeout(() => {
      setOfferSuccess(false);
      setSelectedListing(null);
      setOfferPrice('');
      setOfferNote('');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* 1. ÜST BAR (HEADER) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* LOGO & SOL ÜST MOD TOGGLE */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                T
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hidden sm:inline">
                TersPazar
              </span>
            </div>

            {/* --- KRİTİK İSTEK: SOL ÜST MOD DEĞİŞTİRİCİ --- */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200 shadow-inner">
              <button
                onClick={() => setMode('BUY')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  mode === 'BUY' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Alıcı Modu <span className="opacity-75 hidden md:inline">(Arananlar)</span></span>
              </button>

              <button
                onClick={() => setMode('SELL')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  mode === 'SELL' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-105' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Satıcı Modu <span className="opacity-75 hidden md:inline">(Satılıklar)</span></span>
              </button>
            </div>
          </div>

          {/* İLAN VER BUTONU */}
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shadow-lg transition-all transform active:scale-95 ${
              mode === 'BUY'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>{mode === 'BUY' ? 'Alım İlanı Ver (Arıyorum)' : 'Satış İlanı Ver (Satıyorum)'}</span>
          </button>
        </div>
      </header>

      {/* 2. DİNAMİK BİLGİLENDİRME BANTI */}
      <section className={`py-6 px-4 border-b transition-colors ${
        mode === 'BUY' ? 'bg-indigo-900 text-indigo-100 border-indigo-800' : 'bg-emerald-900 text-emerald-100 border-emerald-800'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {mode === 'BUY' ? 'Tersine Pazaryeri Aktif' : 'Klasik Pazaryeri Aktif'}
            </div>
            <h1 className="text-2xl font-black text-white">
              {mode === 'BUY' 
                ? '🎯 Alıcılar Bütçesini Koydu, Satıcılardan Teklif Bekliyor' 
                : '🛍️ Satıcıların İlanları — Bütçenize Göre Teklif Yapın'}
            </h1>
            <p className="text-sm opacity-90 mt-1 max-w-2xl">
              {mode === 'BUY' 
                ? 'Elinizde ihtiyacınız olmayan bir ürün mü var? Aşağıdaki alıcılardan uygun bütçeli olana hemen teklif verin ve anında nakde çevirin.'
                : 'Satılıktaki ürünleri inceleyin, doğrudan alım yapın veya ilan sahibine karşı teklifinizi iletin.'}
            </p>
          </div>

          {/* Anti-Spam Kalite Güvence Rozeti */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-white">Spam & Çöplük Koruması</div>
              <div className="opacity-80">Piyasa altı gerçek dışı bütçeler ve sahte teklifler engellenir.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ARAMA VE KATEGORİ FİLTRELERİ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          
          {/* Arama Kutusu */}
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={mode === 'BUY' ? "Aranan ürünlerde ara (Örn: MacBook Air)..." : "Satılık ürünlerde ara..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Kategori Butonları */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['Tümü', 'Telefon', 'Bilgisayar', 'Vasıta', 'Oyun Konsolu'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. İLAN LİSTESİ (GRID) */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">İlan Bulunamadı</h3>
            <p className="text-sm text-slate-500 mt-1">Seçtiğiniz kriterlere veya moda uygun ilan bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Kart Üst Bilgi */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      item.type === 'BUY' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.createdAt}
                    </span>
                  </div>

                  {/* İlan Başlığı */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Açıklama */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                    {item.description}
                  </p>

                  {/* Teknik Detay/Kondisyon Rozetleri */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 space-y-1.5">
                    {Object.entries(item.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-slate-500">{key}:</span>
                        <span className="font-semibold text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Kullanıcı Güven Skoru */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.city}, {item.district}
                    </span>
                    <span className="font-medium text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      %{item.trustScore} Doğrulanmış
                    </span>
                  </div>
                </div>

                {/* Kart Alt Bilgi ve Teklif Butonu */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                      {item.type === 'BUY' ? 'Maksimum Bütçe' : 'Satış Fiyatı'}
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {item.budgetOrPrice.toLocaleString('tr-TR')} TL
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedListing(item)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm ${
                      item.type === 'BUY' 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <span>{item.type === 'BUY' ? 'Satış Teklifi Ver' : 'Teklif Yap'}</span>
                    <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[10px]">
                      {item.offersCount}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 5. MODAL: İLAN OLUŞTURMA (SPAM / ÇÖPLÜK ENGELLEME SİSTEMİ İLE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {mode === 'BUY' ? '🎯 Yeni Alım İlanı Oluştur' : '🛍️ Yeni Satış İlanı Oluştur'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {validationError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>{validationError}</div>
              </div>
            )}

            <form onSubmit={handleCreateListing} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.keys(CATEGORY_LIMITS).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  İlan Başlığı <span className="text-slate-400 font-normal">(Net ve anlaşılır olmalı)</span>
                </label>
                <input
                  type="text"
                  placeholder={mode === 'BUY' ? "Örn: Temiz Garantili iPhone 13 Pro Arıyorum" : "Örn: Sıfır Ayarında PS5 Slim"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {mode === 'BUY' ? 'Maksimum Ayrılan Bütçe (TL)' : 'Satış Fiyatı (TL)'}
                </label>
                <input
                  type="number"
                  placeholder={`Min limit: ${CATEGORY_LIMITS[formData.category].minBudget} TL`}
                  value={formData.budgetOrPrice}
                  onChange={(e) => setFormData({ ...formData, budgetOrPrice: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  *Piyasa çöp ilanlarını önlemek için bu kategoride taban bütçe uygulanır.
                </span>
              </div>

              {/* Dinamik Kondisyon Detayları (Sadece Alıcı İlanında Çöplüğü Önler) */}
              {mode === 'BUY' && (
                <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">Min Kozmetik Durum</label>
                    <select
                      value={formData.minCosmetic}
                      onChange={(e) => setFormData({ ...formData, minCosmetic: e.target.value })}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-xs font-semibold"
                    >
                      <option value="9/10 (Çiziksiz)">9/10 (Çiziksiz)</option>
                      <option value="8/10 (Kılcal Çizikli)">8/10 (Kılcal Çizikli)</option>
                      <option value="7/10 (Kullanıma Bağlı)">7/10 (Kullanıma Bağlı)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">Min Pil Sağlığı</label>
                    <select
                      value={formData.minBattery}
                      onChange={(e) => setFormData({ ...formData, minBattery: e.target.value })}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-xs font-semibold"
                    >
                      <option value="%90 ve Üstü">%90 ve Üstü</option>
                      <option value="%85 ve Üstü">%85 ve Üstü</option>
                      <option value="%80 ve Üstü">%80 ve Üstü</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Şehir</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="İstanbul">İstanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="İzmir">İzmir</option>
                  <option value="Bursa">Bursa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detaylı Açıklama</label>
                <textarea
                  rows={3}
                  placeholder="Ürün hakkındaki detayları yazın..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg text-sm transition ${
                  mode === 'BUY' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                İlanı Yayınla
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: TEKLİF VERME DETAY EKRANI */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedListing.type === 'BUY' ? '🏷️ Alıcıya Satış Teklifi Sun' : '💰 Satıcıya Teklif Yap'}
              </h2>
              <button onClick={() => setSelectedListing(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {offerSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-slate-800">Teklifiniz İletildi!</h3>
                <p className="text-xs text-slate-500">İlan sahibi teklifinizi inceleyip size mesaj yoluyla dönüş yapacaktır.</p>
              </div>
            ) : (
              <form onSubmit={handleSendOffer} className="space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Hedef İlan:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedListing.title}</div>
                  <div className="text-xs font-bold text-indigo-600 mt-1">
                    İlan Bütçesi: {selectedListing.budgetOrPrice.toLocaleString('tr-TR')} TL
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teklif Ettiğiniz Fiyat (TL)</label>
                  <input
                    type="number"
                    placeholder="Örn: 24500"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teklif Notu / Ürün Durumu</label>
                  <textarea
                    rows={3}
                    placeholder={selectedListing.type === 'BUY' 
                      ? "Elimde tam aradığınız özelliklerde cihaz var. Kutusu, faturası tam..." 
                      : "Ürününüzle ilgileniyorum, son teklifim budur..."}
                    value={offerNote}
                    onChange={(e) => setOfferNote(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md text-sm transition"
                >
                  Teklifi Gönder
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}