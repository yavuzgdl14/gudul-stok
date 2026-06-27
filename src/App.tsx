import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Layers, 
  ShieldAlert, 
  Download, 
  Upload, 
  RotateCcw, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  Sliders,
  ChevronRight,
  FileText
} from 'lucide-react';
import { INITIAL_INVENTORY } from './data/initialData';
import { AppInventory, CategoryKey, DoorStock } from './types';
import GudulLogo from './components/GudulLogo';

export default function App() {
  const [inventory, setInventory] = useState<AppInventory>(INITIAL_INVENTORY);
  const [activeTab, setActiveTab] = useState<CategoryKey>('amerikanPanel');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeString, setTimeString] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] = useState<{message: string; timestamp: string; isPlus: boolean}[]>([]);

  // Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  // Load state from local storage on mount with robust data healing
  useEffect(() => {
    const savedInventory = localStorage.getItem('gudul_stok_v3') || localStorage.getItem('gudul_stok_v2') || localStorage.getItem('gudul_stok_v1');
    const savedLogs = localStorage.getItem('gudul_logs_v3') || localStorage.getItem('gudul_logs_v2');
    if (savedInventory) {
      try {
        let parsed = JSON.parse(savedInventory);
        
        if (parsed && typeof parsed === 'object') {
          // 1. Deep sanitize to rename any accidental 'kamli' or 'kamlı' keys/values to 'camli'
          const sanitizeDeep = (obj: any): any => {
            if (!obj || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(sanitizeDeep);
            
            const newObj: any = {};
            for (const key of Object.keys(obj)) {
              let newKey = key;
              if (key === 'kamli' || key === 'kamlı') {
                newKey = 'camli';
              }
              newObj[newKey] = sanitizeDeep(obj[key]);
            }
            return newObj;
          };
          
          parsed = sanitizeDeep(parsed);

          // 2. Heal categories to ensure all of them exist
          if (!parsed.amerikanPanel) parsed.amerikanPanel = { ...INITIAL_INVENTORY.amerikanPanel };
          if (!parsed.melamin) parsed.melamin = { ...INITIAL_INVENTORY.melamin };
          if (!parsed.pvc) parsed.pvc = { ...INITIAL_INVENTORY.pvc };
          if (!parsed.celikKapilar) parsed.celikKapilar = { ...INITIAL_INVENTORY.celikKapilar };
          if (!parsed.kasalar) parsed.kasalar = { ...INITIAL_INVENTORY.kasalar };

          // 3. Rename any old 'Karınca' or 'Ant.' steel door keys to 'Antrasit'
          const oldNewMap: { [key: string]: string } = {
            'Karınca. Gri': 'Antrasit Gri',
            'Karınca Gri': 'Antrasit Gri',
            'Karinca Gri': 'Antrasit Gri',
            'Ant. Gri': 'Antrasit Gri',
            'Ant. Beyaz': 'Antrasit Beyaz',
            'Karınca. PVC': 'Antrasit PVC',
            'Karınca PVC': 'Antrasit PVC',
            'Karinca PVC': 'Antrasit PVC',
            'Ant. PVC': 'Antrasit PVC',
          };
          
          Object.keys(oldNewMap).forEach(oldKey => {
            if (parsed.celikKapilar[oldKey] !== undefined) {
              if (parsed.celikKapilar[oldNewMap[oldKey]] === undefined) {
                parsed.celikKapilar[oldNewMap[oldKey]] = parsed.celikKapilar[oldKey];
              }
              delete parsed.celikKapilar[oldKey];
            }
          });

          // 4. Align celikKapilar with INITIAL_INVENTORY exactly to enforce the new key list, 
          // including 'Antrasit Beyaz' in the 5th spot, while preserving any user-modified stock counts
          const alignedCelik: typeof INITIAL_INVENTORY.celikKapilar = {} as any;
          Object.keys(INITIAL_INVENTORY.celikKapilar).forEach(key => {
            alignedCelik[key as keyof typeof INITIAL_INVENTORY.celikKapilar] = 
              parsed.celikKapilar[key] !== undefined 
                ? parsed.celikKapilar[key] 
                : INITIAL_INVENTORY.celikKapilar[key as keyof typeof INITIAL_INVENTORY.celikKapilar];
          });
          parsed.celikKapilar = alignedCelik;

          setInventory(parsed);
          localStorage.setItem('gudul_stok_v3', JSON.stringify(parsed));
        } else {
          setInventory(INITIAL_INVENTORY);
          localStorage.setItem('gudul_stok_v3', JSON.stringify(INITIAL_INVENTORY));
        }
      } catch (e) {
        console.error("Could not parse saved inventory", e);
        setInventory(INITIAL_INVENTORY);
        localStorage.setItem('gudul_stok_v3', JSON.stringify(INITIAL_INVENTORY));
      }
    } else {
      setInventory(INITIAL_INVENTORY);
      localStorage.setItem('gudul_stok_v3', JSON.stringify(INITIAL_INVENTORY));
    }

    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        if (Array.isArray(parsedLogs)) {
          const cleanedLogs = parsedLogs.map((log: any) => ({
            ...log,
            message: (log.message || '')
              .replace(/KAMLI/g, 'CAMLI')
              .replace(/kamlı/g, 'camlı')
              .replace(/kamli/g, 'camli')
              .replace(/Kamlı/g, 'Camlı')
              .replace(/Kamli/g, 'Camli')
              .replace(/Karınca/g, 'Antrasit')
              .replace(/karınca/g, 'antrasit')
          }));
          setActivityLogs(cleanedLogs);
          localStorage.setItem('gudul_logs_v3', JSON.stringify(cleanedLogs));
        }
      } catch (e) {
        console.error("Could not parse logs", e);
      }
    }
  }, []);

  // Save state helper
  const updateAndSaveInventory = (newInv: AppInventory, logMsg?: string, isPlus: boolean = true) => {
    setInventory(newInv);
    localStorage.setItem('gudul_stok_v3', JSON.stringify(newInv));
    if (logMsg) {
      const newLog = {
        message: logMsg,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isPlus
      };
      const updatedLogs = [newLog, ...activityLogs].slice(0, 50);
      setActivityLogs(updatedLogs);
      localStorage.setItem('gudul_logs_v3', JSON.stringify(updatedLogs));
    }
  };

  // Reset helper
  const handleReset = () => {
    updateAndSaveInventory(INITIAL_INVENTORY, "Tüm stoklar varsayılan değerlere sıfırlandı.", false);
    setShowResetConfirm(false);
  };

  // Clean log helper
  const handleClearLogs = () => {
    setActivityLogs([]);
    localStorage.removeItem('gudul_logs_v3');
    localStorage.removeItem('gudul_logs_v2');
  };

  // Export JSON backup
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(inventory, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `Gudul_Ticaret_Stok_${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      alert('Yedekleme dosyası oluşturulurken hata oluştu!');
    }
  };

  // Import JSON backup
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json && (json.amerikanPanel || json.melamin || json.kasalar)) {
          updateAndSaveInventory(json as AppInventory, "Yedek dosyası başarıyla yüklendi.", true);
          alert('Stok verileri başarıyla yüklendi!');
        } else {
          alert('Geçersiz dosya formatı! Lütfen doğru bir stok yedek dosyası seçin.');
        }
      } catch (err) {
        alert('Dosya okunurken bir hata oluştu!');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // State Change Handlers for each subcategory
  const handleUpdateAmerikanPanel = (model: string, type: 'kapali' | 'camli' | 'wc', dir: 'sag' | 'sol', change: number) => {
    const currentVal = inventory.amerikanPanel[model][type][dir];
    const newVal = Math.max(0, currentVal + change);
    if (currentVal === newVal) return;

    const copy = { ...inventory };
    copy.amerikanPanel[model][type][dir] = newVal;
    updateAndSaveInventory(
      copy, 
      `Panel: ${model} - ${type === 'camli' ? 'C' : type.toUpperCase()} (${dir === 'sag' ? 'SAĞ' : 'SOL'}) stok ${change > 0 ? '+' : ''}${change} adet güncellendi. (${currentVal} → ${newVal})`,
      change > 0
    );
  };

  const handleUpdateMelamin = (model: string, type: 'kapali' | 'camli' | 'wc', change: number) => {
    const currentVal = inventory.melamin[model][type];
    const newVal = Math.max(0, currentVal + change);
    if (currentVal === newVal) return;

    const copy = { ...inventory };
    copy.melamin[model][type] = newVal;
    updateAndSaveInventory(
      copy, 
      `Melamin: ${model} - ${type === 'camli' ? 'C' : type.toUpperCase()} stok ${change > 0 ? '+' : ''}${change} adet güncellendi. (${currentVal} → ${newVal})`,
      change > 0
    );
  };

  const handleUpdatePVC = (model: string, type: 'kapali' | 'camli' | 'wc', change: number) => {
    const currentVal = inventory.pvc[model][type];
    const newVal = Math.max(0, currentVal + change);
    if (currentVal === newVal) return;

    const copy = { ...inventory };
    copy.pvc[model][type] = newVal;
    updateAndSaveInventory(
      copy, 
      `PVC: ${model} - ${type === 'camli' ? 'C' : type.toUpperCase()} stok ${change > 0 ? '+' : ''}${change} adet güncellendi. (${currentVal} → ${newVal})`,
      change > 0
    );
  };

  const handleUpdateCelikKapilar = (model: string, dir: 'sag' | 'sol', change: number) => {
    const currentVal = inventory.celikKapilar[model][dir];
    const newVal = Math.max(0, currentVal + change);
    if (currentVal === newVal) return;

    const copy = { ...inventory };
    copy.celikKapilar[model][dir] = newVal;
    updateAndSaveInventory(
      copy, 
      `Çelik: ${model} (${dir === 'sag' ? 'SAĞ' : 'SOL'}) stok ${change > 0 ? '+' : ''}${change} adet güncellendi. (${currentVal} → ${newVal})`,
      change > 0
    );
  };

  const handleUpdateKasa = (type: 'amerikanPanel' | 'melamin' | 'pvc', size: string, lik: 'lik70' | 'lik80', change: number) => {
    const currentVal = inventory.kasalar[type][size][lik];
    const newVal = Math.max(0, currentVal + change);
    if (currentVal === newVal) return;

    const copy = { ...inventory };
    copy.kasalar[type][size][lik] = newVal;
    
    const friendlyType = type === 'amerikanPanel' ? 'Panel Kasa' : type === 'melamin' ? 'Melamin Kasa' : 'PVC Kasa';
    updateAndSaveInventory(
      copy, 
      `Kasa: ${friendlyType} ${size}’lik (${lik === 'lik70' ? "70'lik" : "80'lik"}) stok ${change > 0 ? '+' : ''}${change} adet güncellendi. (${currentVal} → ${newVal})`,
      change > 0
    );
  };

  // Direct Input state changes
  const handleDirectInputAmerikanPanel = (model: string, type: 'kapali' | 'camli' | 'wc', dir: 'sag' | 'sol', value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    const copy = { ...inventory };
    const prev = copy.amerikanPanel[model][type][dir];
    copy.amerikanPanel[model][type][dir] = num;
    updateAndSaveInventory(copy, `Panel: ${model} - ${type === 'camli' ? 'C' : type.toUpperCase()} (${dir === 'sag' ? 'SAĞ' : 'SOL'}) doğrudan ayarlandı: ${num} (Önceki: ${prev})`, num > prev);
  };

  const handleDirectInputMelamin = (model: string, type: 'kapali' | 'camli' | 'wc', value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    const copy = { ...inventory };
    const prev = copy.melamin[model][type];
    copy.melamin[model][type] = num;
    updateAndSaveInventory(copy, `Melamin: ${model} - ${type === 'camli' ? 'C' : type.toUpperCase()} doğrudan ayarlandı: ${num} (Önceki: ${prev})`, num > prev);
  };

  const handleDirectInputPVC = (model: string, type: 'kapali' | 'camli' | 'wc', value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    const copy = { ...inventory };
    const prev = copy.pvc[model][type];
    copy.pvc[model][type] = num;
    updateAndSaveInventory(copy, `PVC: ${model} - ${type === 'camli' ? 'C' : type.toUpperCase()} doğrudan ayarlandı: ${num} (Önceki: ${prev})`, num > prev);
  };

  const handleDirectInputCelik = (model: string, dir: 'sag' | 'sol', value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    const copy = { ...inventory };
    const prev = copy.celikKapilar[model][dir];
    copy.celikKapilar[model][dir] = num;
    updateAndSaveInventory(copy, `Çelik: ${model} (${dir === 'sag' ? 'SAĞ' : 'SOL'}) doğrudan ayarlandı: ${num} (Önceki: ${prev})`, num > prev);
  };

  const handleDirectInputKasa = (type: 'amerikanPanel' | 'melamin' | 'pvc', size: string, lik: 'lik70' | 'lik80', value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    const copy = { ...inventory };
    const prev = copy.kasalar[type][size][lik];
    copy.kasalar[type][size][lik] = num;
    const friendlyType = type === 'amerikanPanel' ? 'Panel Kasa' : type === 'melamin' ? 'Melamin Kasa' : 'PVC Kasa';
    updateAndSaveInventory(copy, `Kasa: ${friendlyType} ${size}’lik (${lik === 'lik70' ? "70'lik" : "80'lik"}) doğrudan ayarlandı: ${num} (Önceki: ${prev})`, num > prev);
  };

  // Calculations for Totals (Stok Özeti)
  const calculateAmerikanPanelTotal = (): number => {
    let total = 0;
    Object.keys(inventory.amerikanPanel).forEach(key => {
      const m = inventory.amerikanPanel[key];
      total += m.kapali.sag + m.kapali.sol;
      total += m.camli.sag + m.camli.sol;
      total += m.wc.sag + m.wc.sol;
    });
    return total;
  };

  const calculateMelaminTotal = (): number => {
    let total = 0;
    Object.keys(inventory.melamin).forEach(key => {
      const m = inventory.melamin[key];
      total += m.kapali + m.camli + m.wc;
    });
    return total;
  };

  const calculatePVCTotal = (): number => {
    let total = 0;
    Object.keys(inventory.pvc).forEach(key => {
      const m = inventory.pvc[key];
      total += m.kapali + m.camli + m.wc;
    });
    return total;
  };

  const calculateCelikTotal = (): number => {
    let total = 0;
    Object.keys(inventory.celikKapilar).forEach(key => {
      const m = inventory.celikKapilar[key];
      total += m.sag + m.sol;
    });
    return total;
  };

  const calculateKasalarTotal = (): number => {
    let total = 0;
    // Panel Kasaları
    Object.keys(inventory.kasalar.amerikanPanel).forEach(key => {
      const s = inventory.kasalar.amerikanPanel[key];
      total += s.lik70 + s.lik80;
    });
    // Melamin Kasaları
    Object.keys(inventory.kasalar.melamin).forEach(key => {
      const s = inventory.kasalar.melamin[key];
      total += s.lik70 + s.lik80;
    });
    // PVC Kasaları
    Object.keys(inventory.kasalar.pvc).forEach(key => {
      const s = inventory.kasalar.pvc[key];
      total += s.lik70 + s.lik80;
    });
    return total;
  };

  const amPanTotal = calculateAmerikanPanelTotal();
  const melaminTotal = calculateMelaminTotal();
  const pvcTotal = calculatePVCTotal();
  const celikTotal = calculateCelikTotal();
  const kasalarTotal = calculateKasalarTotal();
  const grandTotal = amPanTotal + melaminTotal + pvcTotal + celikTotal + kasalarTotal;

  // Let's implement the filter query
  const matchesSearch = (text: string) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans" id="app-container">
      
      {/* Upper Navigation Header bar */}
      <header className="bg-[#121212] border-b border-[#262626] sticky top-0 z-40 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-4">
            <GudulLogo size={55} showCircle={true} className="shrink-0 rounded-full shadow-md hover:scale-105 transition duration-200" />
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">GÜDÜL TİCARET</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wide">PROFESYONEL MOBİL STOK TAKİP SİSTEMİ</span>
              </div>
            </div>
          </div>

          {/* Search Field & Backups */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64 min-w-[150px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Model, ölçü ara..."
                className="w-full bg-[#1c1c1c] border border-[#262626] rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                id="search-box"
              />
            </div>

            {/* Backups buttons */}
            <div className="flex gap-2 shrink-0">
            
            </div>
          </div>

        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-4 md:p-6" id="main-layout">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
          
          {/* Brand Logo Sticker Badge */}
          <div className="bg-[#121212] border border-[#262626] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-md">
            <GudulLogo size={240} showCircle={true} />
          </div>

          {/* Quick Date Display */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center justify-between text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>GÜNCEL SAAT</span>
            </div>
            <span className="text-white font-bold">{timeString || "00:00"}</span>
          </div>

          {/* Android Studio ZIP Download */}
          <div className="bg-[#121212] border border-amber-900/30 hover:border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3 transition">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
              <Download className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>ANDROID STUDIO PROJESİ</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Bu projeyi bilgisayarınıza indirip Android Studio ile kendi özel APK'nızı oluşturabilirsiniz.
            </p>
            
          </div>

          <p className="text-[10px] font-black tracking-widest text-[#666] uppercase px-1 mt-2">KATEGORİLER</p>
          
          {/* List of Main Categories (Large, extremely tactile screen buttons) */}
          <nav className="flex flex-col gap-2.5">
            <button
              onClick={() => setActiveTab('amerikanPanel')}
              className={`w-full text-left p-4 rounded-2xl transition duration-150 flex items-center justify-between cursor-pointer ${
                activeTab === 'amerikanPanel'
                  ? 'bg-white text-black font-black shadow-2xl scale-[1.02]'
                  : 'bg-[#121212] border border-[#262626] hover:bg-[#1c1c1c] text-[#888] font-bold'
              }`}
              id="side-tab-amerikan"
            >
              <div className="flex flex-col">
                <span className="text-xs tracking-wider uppercase font-black">AMERİKAN PANEL</span>
                <span className="text-[9px] opacity-60 font-medium">Kapalı, C, WC (Sağ/Sol)</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-mono ${activeTab === 'amerikanPanel' ? 'bg-black text-white' : 'bg-[#222] text-[#888]'}`}>
                {amPanTotal}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('melamin')}
              className={`w-full text-left p-4 rounded-2xl transition duration-150 flex items-center justify-between cursor-pointer ${
                activeTab === 'melamin'
                  ? 'bg-white text-black font-black shadow-2xl scale-[1.02]'
                  : 'bg-[#121212] border border-[#262626] hover:bg-[#1c1c1c] text-[#888] font-bold'
              }`}
              id="side-tab-melamin"
            >
              <div className="flex flex-col">
                <span className="text-xs tracking-wider uppercase font-black">MELAMİN KAPILAR</span>
                <span className="text-[9px] opacity-60 font-medium">Model Bazlı Adet Sayaçları</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-mono ${activeTab === 'melamin' ? 'bg-black text-white' : 'bg-[#222] text-[#888]'}`}>
                {melaminTotal}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pvc')}
              className={`w-full text-left p-4 rounded-2xl transition duration-150 flex items-center justify-between cursor-pointer ${
                activeTab === 'pvc'
                  ? 'bg-white text-black font-black shadow-2xl scale-[1.02]'
                  : 'bg-[#121212] border border-[#262626] hover:bg-[#1c1c1c] text-[#888] font-bold'
              }`}
              id="side-tab-pvc"
            >
              <div className="flex flex-col">
                <span className="text-xs tracking-wider uppercase font-black">PVC KAPILAR</span>
                <span className="text-[9px] opacity-60 font-medium">407 Serisi Modeller</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-mono ${activeTab === 'pvc' ? 'bg-black text-white' : 'bg-[#222] text-[#888]'}`}>
                {pvcTotal}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('celikKapilar')}
              className={`w-full text-left p-4 rounded-2xl transition duration-150 flex items-center justify-between cursor-pointer ${
                activeTab === 'celikKapilar'
                  ? 'bg-white text-black font-black shadow-2xl scale-[1.02]'
                  : 'bg-[#121212] border border-[#262626] hover:bg-[#1c1c1c] text-[#888] font-bold'
              }`}
              id="side-tab-celik"
            >
              <div className="flex flex-col">
                <span className="text-xs tracking-wider uppercase font-black">ÇELİK KAPILAR</span>
                <span className="text-[9px] opacity-60 font-medium">Uzun Kol, TOKİ, Ceviz, Sağ/Sol</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-mono ${activeTab === 'celikKapilar' ? 'bg-black text-white' : 'bg-[#222] text-[#888]'}`}>
                {celikTotal}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('kasalar')}
              className={`w-full text-left p-4 rounded-2xl transition duration-150 flex items-center justify-between cursor-pointer ${
                activeTab === 'kasalar'
                  ? 'bg-white text-black font-black shadow-2xl scale-[1.02]'
                  : 'bg-[#121212] border border-[#262626] hover:bg-[#1c1c1c] text-[#888] font-bold'
              }`}
              id="side-tab-kasalar"
            >
              <div className="flex flex-col">
                <span className="text-xs tracking-wider uppercase font-black">KAPILI KASALAR</span>
                <span className="text-[9px] opacity-60 font-medium">10’dan 24’e 70/80 Ölçüler</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-mono ${activeTab === 'kasalar' ? 'bg-black text-white' : 'bg-[#222] text-[#888]'}`}>
                {kasalarTotal}
              </span>
            </button>

            <div className="h-px bg-[#262626]/80 my-2"></div>

            <button
              onClick={() => setActiveTab('ozet')}
              className={`w-full text-left p-4 rounded-2xl transition duration-150 flex items-center justify-between cursor-pointer ${
                activeTab === 'ozet'
                  ? 'bg-white text-black font-black shadow-2xl scale-[1.02]'
                  : 'bg-[#121212] border border-[#262626] hover:bg-[#1c1c1c] text-[#888] font-bold'
              }`}
              id="side-tab-ozet"
            >
              <div className="flex flex-col">
                <span className="text-xs tracking-wider uppercase font-black">STOK ÖZETİ</span>
                <span className="text-[9px] opacity-60 font-medium">Genel Toplam Analizi</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${activeTab === 'ozet' ? 'bg-black text-white' : 'bg-white text-black font-black'}`}>
                {grandTotal} ADET
              </span>
            </button>
          </nav>

          {/* Quick Logs Summary in Sidebar */}
          {activityLogs.length > 0 && (
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 mt-4 hidden lg:flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#666] tracking-wider uppercase">SON İŞLEMLER</span>
                <button 
                  onClick={handleClearLogs}
                  className="text-[9px] font-bold text-red-400 hover:underline cursor-pointer uppercase"
                >
                  TEMİZLE
                </button>
              </div>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {activityLogs.map((log, i) => (
                  <div key={i} className="text-[10px] border-b border-[#1f1f1f] pb-1.5 last:border-0">
                    <div className="flex justify-between items-center text-[#555] font-mono mb-0.5">
                      <span>{log.timestamp}</span>
                      <span className={log.isPlus ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                        {log.isPlus ? "+ GİRİŞ" : "- ÇIKIŞ"}
                      </span>
                    </div>
                    <p className="text-neutral-300 font-semibold leading-tight">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </aside>

        {/* Content Section */}
        <main className="flex-1 min-w-0">

          {/* Render category screens */}
          {activeTab === 'amerikanPanel' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-xs font-black text-[#666] uppercase tracking-widest mb-1">KATEGORİ</h3>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Amerikan Panel Kapılar</h2>
                <p className="text-xs text-neutral-400 mt-1">Madra, Merdiven, Yumurta, D Modeli ve Kum Saati modellerinin kapalı, C, WC varyasyonları.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.keys(inventory.amerikanPanel)
                  .filter(modelName => matchesSearch(modelName))
                  .map((modelName) => {
                    const modelData = inventory.amerikanPanel[modelName];
                    return (
                      <div key={modelName} className="bg-[#121212] border border-[#262626] rounded-3xl p-6 flex flex-col justify-between">
                        
                        <div>
                          <div className="flex justify-between items-center mb-4 border-b border-[#1f1f1f] pb-3">
                            <h4 className="text-xl font-black text-white tracking-tight">{modelName}</h4>
                            <span className="text-[10px] bg-[#222] text-[#888] px-2 py-0.5 rounded font-mono">PANEL</span>
                          </div>

                          {/* Render types: kapali, camli, wc */}
                          {(['kapali', 'camli', 'wc'] as const).map((type) => {
                            const sub = modelData[type];
                            return (
                              <div key={type} className="mb-4 border-b border-[#1f1f1f]/50 pb-3 last:border-0 last:pb-0">
                                <span className="text-[11px] font-black text-[#666] uppercase tracking-wider block mb-2">{type === 'kapali' ? 'Kapalı' : type === 'camli' ? 'C' : 'WC'}</span>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  {/* Sağ stok */}
                                  <div className="bg-[#181818] rounded-2xl p-3 border border-[#222]">
                                    <span className="text-[10px] text-neutral-500 font-extrabold tracking-wider block mb-1">SAĞ STOK</span>
                                    <div className="flex items-center justify-between">
                                      <button 
                                        onClick={() => handleUpdateAmerikanPanel(modelName, type, 'sag', -1)}
                                        className="w-10 h-10 rounded-xl bg-[#262626] hover:bg-[#333] font-black text-lg text-white transition cursor-pointer flex items-center justify-center active:scale-90"
                                      >
                                        -
                                      </button>
                                      
                                      <input 
                                        type="number"
                                        value={sub.sag}
                                        onChange={(e) => handleDirectInputAmerikanPanel(modelName, type, 'sag', e.target.value)}
                                        className="w-12 bg-transparent text-center font-black text-xl text-white font-sans focus:outline-none focus:text-emerald-400"
                                      />

                                      <button 
                                        onClick={() => handleUpdateAmerikanPanel(modelName, type, 'sag', 1)}
                                        className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-200 font-black text-lg text-black transition cursor-pointer flex items-center justify-center active:scale-90"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Sol stok */}
                                  <div className="bg-[#181818] rounded-2xl p-3 border border-[#222]">
                                    <span className="text-[10px] text-neutral-500 font-extrabold tracking-wider block mb-1">SOL STOK</span>
                                    <div className="flex items-center justify-between">
                                      <button 
                                        onClick={() => handleUpdateAmerikanPanel(modelName, type, 'sol', -1)}
                                        className="w-10 h-10 rounded-xl bg-[#262626] hover:bg-[#333] font-black text-lg text-white transition cursor-pointer flex items-center justify-center active:scale-90"
                                      >
                                        -
                                      </button>

                                      <input 
                                        type="number"
                                        value={sub.sol}
                                        onChange={(e) => handleDirectInputAmerikanPanel(modelName, type, 'sol', e.target.value)}
                                        className="w-12 bg-transparent text-center font-black text-xl text-white font-sans focus:outline-none focus:text-emerald-400"
                                      />

                                      <button 
                                        onClick={() => handleUpdateAmerikanPanel(modelName, type, 'sol', 1)}
                                        className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-200 font-black text-lg text-black transition cursor-pointer flex items-center justify-center active:scale-90"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                        </div>

                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === 'melamin' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-xs font-black text-[#666] uppercase tracking-widest mb-1">KATEGORİ</h3>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Melamin Kapılar</h2>
                <p className="text-xs text-neutral-400 mt-1">Çift Göbek, Tek Göbek, Melamin Madra ve Matrix kapı modelleri. Bu kategoride sağ/sol ayrımı yoktur.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {Object.keys(inventory.melamin)
                  .filter(modelName => matchesSearch(modelName))
                  .map((modelName) => {
                    const modelData = inventory.melamin[modelName];
                    return (
                      <div key={modelName} className="bg-[#121212] border border-[#262626] rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-[#1f1f1f] pb-3">
                          <h4 className="text-2xl font-black text-white tracking-tight">{modelName}</h4>
                          <span className="text-[10px] bg-[#222] text-[#888] px-2 py-0.5 rounded font-mono">MELAMİN</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {(['kapali', 'camli', 'wc'] as const).map((type) => {
                            const val = modelData[type];
                            return (
                              <div key={type} className="bg-[#181818] rounded-2xl p-4 border border-[#222] flex flex-col justify-between">
                                <span className="text-xs font-black text-[#888] uppercase tracking-widest block mb-3 text-center">{type === 'kapali' ? 'Kapalı' : type === 'camli' ? 'C' : 'WC'}</span>
                                
                                <div className="text-center mb-4">
                                  <input 
                                    type="number"
                                    value={val}
                                    onChange={(e) => handleDirectInputMelamin(modelName, type, e.target.value)}
                                    className="w-16 bg-transparent text-center font-black text-4xl text-white font-sans focus:outline-none focus:text-emerald-400 block mx-auto"
                                  />
                                  <span className="text-[9px] font-bold text-neutral-600 block mt-1 tracking-widest uppercase">ADET</span>
                                </div>

                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleUpdateMelamin(modelName, type, -1)}
                                    className="flex-1 py-3.5 bg-[#262626] hover:bg-[#333] rounded-xl font-bold text-lg text-white transition cursor-pointer flex items-center justify-center active:scale-95"
                                  >
                                    -
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateMelamin(modelName, type, 1)}
                                    className="flex-1 py-3.5 bg-white hover:bg-neutral-200 rounded-xl font-bold text-lg text-black transition cursor-pointer flex items-center justify-center active:scale-95"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === 'pvc' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-xs font-black text-[#666] uppercase tracking-widest mb-1">KATEGORİ</h3>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">PVC Kapılar</h2>
                <p className="text-xs text-neutral-400 mt-1">407 Serisi modellerin Kapalı, C ve WC stok sayıları.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(inventory.pvc)
                  .filter(modelName => matchesSearch(modelName))
                  .map((modelName) => {
                    const modelData = inventory.pvc[modelName];
                    return (
                      <div key={modelName} className="bg-[#121212] border border-[#262626] rounded-3xl p-6 lg:p-8">
                        <div className="flex justify-between items-center mb-6 border-b border-[#1f1f1f] pb-3">
                          <h4 className="text-3xl font-black text-white tracking-tighter">MODEL: {modelName}</h4>
                          <span className="text-[10px] bg-[#222] text-[#888] px-2 py-0.5 rounded font-mono">PVC KAPLAMA</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          {(['kapali', 'camli', 'wc'] as const).map((type) => {
                            const val = modelData[type];
                            return (
                              <div key={type} className="bg-[#181818] rounded-2xl p-4 border border-[#222] flex flex-col justify-between">
                                <span className="text-xs font-black text-[#888] uppercase tracking-widest block mb-4 text-center">{type === 'kapali' ? 'Kapalı' : type === 'camli' ? 'C' : 'WC'}</span>
                                
                                <div className="text-center mb-5">
                                  <input 
                                    type="number"
                                    value={val}
                                    onChange={(e) => handleDirectInputPVC(modelName, type, e.target.value)}
                                    className="w-16 bg-transparent text-center font-black text-4xl text-white font-sans focus:outline-none focus:text-emerald-400 block mx-auto"
                                  />
                                  <span className="text-[9px] font-bold text-neutral-600 block mt-1 tracking-widest uppercase">ADET</span>
                                </div>

                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleUpdatePVC(modelName, type, -1)}
                                    className="flex-1 py-3.5 bg-[#262626] hover:bg-[#333] rounded-xl font-bold text-lg text-white transition cursor-pointer flex items-center justify-center active:scale-95"
                                  >
                                    -
                                  </button>
                                  <button 
                                    onClick={() => handleUpdatePVC(modelName, type, 1)}
                                    className="flex-1 py-3.5 bg-white hover:bg-neutral-200 rounded-xl font-bold text-lg text-black transition cursor-pointer flex items-center justify-center active:scale-95"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === 'celikKapilar' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-xs font-black text-[#666] uppercase tracking-widest mb-1">KATEGORİ</h3>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Çelik Kapılar</h2>
                <p className="text-xs text-neutral-400 mt-1">Geniş model seçenekleri ve Sağ/Sol yönlü dayanıklı çelik kapı stokları.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.keys(inventory.celikKapilar)
                  .filter(modelName => matchesSearch(modelName))
                  .map((modelName) => {
                    const data = inventory.celikKapilar[modelName];
                    return (
                      <div key={modelName} className="bg-[#121212] border border-[#262626] rounded-3xl p-6 flex flex-col justify-between">
                        
                        <div>
                          <div className="flex justify-between items-center mb-4 border-b border-[#1f1f1f] pb-3">
                            <h4 className="text-lg font-black text-white tracking-tight truncate mr-2" title={modelName}>{modelName}</h4>
                            <span className="text-[9px] bg-[#222] text-[#888] px-2 py-0.5 rounded font-mono uppercase">ÇELİK</span>
                          </div>

                          <div className="space-y-4">
                            {/* Sağ Stok Row */}
                            <div className="bg-[#181818] rounded-2xl p-3 border border-[#222] flex items-center justify-between gap-4">
                              <div>
                                <span className="text-[10px] text-neutral-500 font-extrabold tracking-wider block">SAĞ YÖN</span>
                                <input 
                                  type="number"
                                  value={data.sag}
                                  onChange={(e) => handleDirectInputCelik(modelName, 'sag', e.target.value)}
                                  className="w-14 bg-transparent text-left font-black text-xl text-white font-sans focus:outline-none"
                                />
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <button 
                                  onClick={() => handleUpdateCelikKapilar(modelName, 'sag', -1)}
                                  className="w-10 h-10 rounded-xl bg-[#262626] hover:bg-[#333] font-black text-white flex items-center justify-center transition cursor-pointer active:scale-90 text-lg"
                                >
                                  -
                                </button>
                                <button 
                                  onClick={() => handleUpdateCelikKapilar(modelName, 'sag', 1)}
                                  className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-200 font-black text-black flex items-center justify-center transition cursor-pointer active:scale-90 text-lg"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Sol Stok Row */}
                            <div className="bg-[#181818] rounded-2xl p-3 border border-[#222] flex items-center justify-between gap-4">
                              <div>
                                <span className="text-[10px] text-neutral-500 font-extrabold tracking-wider block">SOL YÖN</span>
                                <input 
                                  type="number"
                                  value={data.sol}
                                  onChange={(e) => handleDirectInputCelik(modelName, 'sol', e.target.value)}
                                  className="w-14 bg-transparent text-left font-black text-xl text-white font-sans focus:outline-none"
                                />
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <button 
                                  onClick={() => handleUpdateCelikKapilar(modelName, 'sol', -1)}
                                  className="w-10 h-10 rounded-xl bg-[#262626] hover:bg-[#333] font-black text-white flex items-center justify-center transition cursor-pointer active:scale-90 text-lg"
                                >
                                  -
                                </button>
                                <button 
                                  onClick={() => handleUpdateCelikKapilar(modelName, 'sol', 1)}
                                  className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-200 font-black text-black flex items-center justify-center transition cursor-pointer active:scale-90 text-lg"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === 'kasalar' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-xs font-black text-[#666] uppercase tracking-widest mb-1">KATEGORİ</h3>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Kapı Kasaları</h2>
                <p className="text-xs text-neutral-400 mt-1">Amerikan Panel, Melamin ve PVC kasalar için 10’dan 24’e kadar tüm ölçülerde 70’lik ve 80’lik stoklar.</p>
              </div>

              {/* Sub-sections for each Kasa type */}
              {(['amerikanPanel', 'melamin', 'pvc'] as const).map((kasaType) => {
                const kasaData = inventory.kasalar[kasaType];
                const friendlyName = kasaType === 'amerikanPanel' ? 'Amerikan Panel Kasa' : kasaType === 'melamin' ? 'Melamin Kasa' : 'PVC Kasa';
                
                return (
                  <div key={kasaType} className="bg-[#121212] border border-[#262626] rounded-3xl p-6">
                    <div className="mb-5 border-b border-[#1f1f1f] pb-3">
                      <h3 className="text-2xl font-black tracking-tight text-white">{friendlyName}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {Object.keys(kasaData)
                        .filter(size => matchesSearch(size) || matchesSearch(friendlyName))
                        .map((size) => {
                          const sizeData = kasaData[size];
                          return (
                            <div key={size} className="bg-[#181818] border border-[#222] rounded-2xl p-4 flex flex-col justify-between">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-lg font-black text-white">{size}’lik Kasa</span>
                                <span className="text-[10px] bg-[#222] text-[#888] px-2 py-0.5 rounded font-mono">ÖLÇÜ</span>
                              </div>

                              <div className="space-y-3">
                                {/* 70'lik */}
                                <div className="flex items-center justify-between gap-4 bg-[#121212] p-2.5 rounded-xl border border-[#1f1f1f]">
                                  <div>
                                    <span className="text-[9px] font-black text-neutral-500 tracking-wide block">70’LİK STOK</span>
                                    <input 
                                      type="number"
                                      value={sizeData.lik70}
                                      onChange={(e) => handleDirectInputKasa(kasaType, size, 'lik70', e.target.value)}
                                      className="w-12 bg-transparent text-left font-black text-base text-white focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleUpdateKasa(kasaType, size, 'lik70', -1)}
                                      className="w-8 h-8 rounded-lg bg-[#262626] hover:bg-[#333] text-sm font-black text-white flex items-center justify-center transition cursor-pointer active:scale-90"
                                    >
                                      -
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateKasa(kasaType, size, 'lik70', 1)}
                                      className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-200 text-sm font-black text-black flex items-center justify-center transition cursor-pointer active:scale-90"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* 80'lik */}
                                <div className="flex items-center justify-between gap-4 bg-[#121212] p-2.5 rounded-xl border border-[#1f1f1f]">
                                  <div>
                                    <span className="text-[9px] font-black text-neutral-500 tracking-wide block">80’LİK STOK</span>
                                    <input 
                                      type="number"
                                      value={sizeData.lik80}
                                      onChange={(e) => handleDirectInputKasa(kasaType, size, 'lik80', e.target.value)}
                                      className="w-12 bg-transparent text-left font-black text-base text-white focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleUpdateKasa(kasaType, size, 'lik80', -1)}
                                      className="w-8 h-8 rounded-lg bg-[#262626] hover:bg-[#333] text-sm font-black text-white flex items-center justify-center transition cursor-pointer active:scale-90"
                                    >
                                      -
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateKasa(kasaType, size, 'lik80', 1)}
                                      className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-200 text-sm font-black text-black flex items-center justify-center transition cursor-pointer active:scale-90"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>

                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'ozet' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-xs font-black text-[#666] uppercase tracking-widest mb-1">STOK ANALİZİ</h3>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Genel Stok Özeti</h2>
                <p className="text-xs text-neutral-400 mt-1">Tüm dükkan envanterinin otomatik hesaplanan sayısal analizi ve dağılımı.</p>
              </div>

              {/* Bento Grid Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Amerikan Panel Toplam */}
                <div className="bg-[#121212] border border-[#262626] p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#666] uppercase tracking-widest mb-1">Amerikan Panel</h4>
                    <p className="text-5xl font-black text-white tracking-tighter mt-1">{amPanTotal} <span className="text-sm text-[#444] font-black uppercase">ADET</span></p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-4 font-semibold">Madra, Merdiven, Yumurta vb. modellerin toplamı.</p>
                </div>

                {/* Melamin Toplam */}
                <div className="bg-[#121212] border border-[#262626] p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#666] uppercase tracking-widest mb-1">Melamin Kapılar</h4>
                    <p className="text-5xl font-black text-white tracking-tighter mt-1">{melaminTotal} <span className="text-sm text-[#444] font-black uppercase">ADET</span></p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-4 font-semibold">Tek/Çift Göbek, Madra vb. modellerin toplamı.</p>
                </div>

                {/* PVC Toplam */}
                <div className="bg-[#121212] border border-[#262626] p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#666] uppercase tracking-widest mb-1">PVC Kapılar</h4>
                    <p className="text-5xl font-black text-white tracking-tighter mt-1">{pvcTotal} <span className="text-sm text-[#444] font-black uppercase">ADET</span></p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-4 font-semibold">407 serisi PVC modellerin toplamı.</p>
                </div>

                {/* Çelik Kapılar Toplam */}
                <div className="bg-[#121212] border border-[#262626] p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#666] uppercase tracking-widest mb-1">Çelik Kapılar</h4>
                    <p className="text-5xl font-black text-white tracking-tighter mt-1">{celikTotal} <span className="text-sm text-[#444] font-black uppercase">ADET</span></p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-4 font-semibold">Tüm ağır çelik modellerin (Sağ/Sol) toplamı.</p>
                </div>

                {/* Kasalar Toplam */}
                <div className="bg-[#121212] border border-[#262626] p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#666] uppercase tracking-widest mb-1">Kasa Toplamları</h4>
                    <p className="text-5xl font-black text-white tracking-tighter mt-1">{kasalarTotal} <span className="text-sm text-[#444] font-black uppercase">ADET</span></p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-4 font-semibold">Amerikan, Melamin ve PVC tüm kasa ölçülerinin toplamı.</p>
                </div>

                {/* GENEL TOPLAM */}
                <div className="bg-[#121212] border-2 border-white p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#666] uppercase tracking-widest mb-1">DÜKKAN GENEL TOPLAMI</h4>
                    <p className="text-6xl font-black text-emerald-400 tracking-tighter mt-2">{grandTotal} <span className="text-sm text-[#666] font-black uppercase block sm:inline">ADET STOK</span></p>
                  </div>
                  <p className="text-xs text-[#888] mt-4 font-bold uppercase tracking-wider">GÜDÜL TİCARET GÜNCEL DEPO HACMİ</p>
                </div>

              </div>
            </div>
          )}

        </main>

      </div>

      {/* Quick interactive reset modal overlay */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-[#121212] border-2 border-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-white tracking-tighter mb-2">TÜM STOKLARI SIFIRLA</h3>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              Bu işlem dükkandaki tüm kapı ve kasa sayımlarını sıfırlayarak varsayılan ilk kurulum değerlerine geri döndürecektir. Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-transparent hover:bg-neutral-900 text-white font-bold py-3 px-4 rounded-xl border border-[#262626] cursor-pointer text-xs uppercase tracking-wider"
              >
                İptal Et
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 px-4 rounded-xl cursor-pointer text-xs uppercase tracking-wider"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Solid Modern Footer */}
      <footer className="bg-[#121212] border-t border-[#262626] mt-auto py-8 px-4 md:px-8 text-xs text-neutral-500 font-semibold tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GÜDÜL TİCARET. TÜM HAKLARI SAKLIDIR.</p>
          <p className="font-mono text-[10px] text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            İNTERNETSİZ ÇALIŞMA MODU AKTİF (OFFLINE LOCAL STORAGE DB)
          </p>
        </div>
      </footer>

    </div>
  );
}
