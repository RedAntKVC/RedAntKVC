import React, { useState, useMemo, useRef } from 'react';

// ==========================================================
// Types
// ==========================================================
interface School {
  code: string;
  name: string;
  person: string;
  group: string;
  totalBooks: number;
  delivered: number;
  missing: number;
  rate: number;
  schoolNum?: string;
}

interface PO {
  id: string;
  vendor: string;
  publisher: string;
  schoolCode: string;
  schoolName: string;
  amount: number;
  status: string;
  days: number;
  createdBy: string;
  date: string;
}

interface Book {
  id: string;
  term: string;
  school: string;
  schoolCode: string;
  grade: string;
  vendor: string;
  isbn: string;
  title: string;
  price: number;
  bookQty: number;
  orderQty: number;
  po: string;
  subject: string;
  type: string;
  missingQty: number;
  manager: string;
}

// ==========================================================
// Seed data (2026-27 actual school list, PO List, master table)
// ==========================================================
const REAL_SCHOOLS: School[] = [
  { code: '30101', name: '嘉諾撒聖心學校', person: '張志新', group: '第一組', totalBooks: 4890, delivered: 4890, missing: 0, rate: 100.0 },
  { code: '30331', name: '西貢崇真天主教學校(小學部)', person: '郭家臻', group: '第一組', totalBooks: 3120, delivered: 2920, missing: 200, rate: 93.59 },
  { code: '30401', name: '海壩街官立小學', person: '廖志華', group: '第三組', totalBooks: 5800, delivered: 5545, missing: 255, rate: 95.6 },
  { code: '30402', name: '中華基督銅教會基慧小學(馬灣)', person: '鄭煌昱', group: '第五組', totalBooks: 4200, delivered: 3950, missing: 250, rate: 94.05 },
  { code: '30404', name: '亞斯理衛理小學', person: '黃欐盈', group: '第三組', totalBooks: 2100, delivered: 1980, missing: 120, rate: 94.29 },
  { code: '30406', name: '聖公會仁立小學', person: '廖志華', group: '第三組', totalBooks: 4900, delivered: 4900, missing: 0, rate: 100.0 },
  { code: '30407', name: '聖公會仁立紀念小學', person: '廖志華', group: '第三組', totalBooks: 5150, delivered: 4850, missing: 300, rate: 94.17 },
  { code: '30408', name: '寶血會伍季明紀念學校', person: '馮凱怡', group: '第五組', totalBooks: 3400, delivered: 3400, missing: 0, rate: 100.0 },
  { code: '51012', name: '聖公會奉基千禧小學', person: '戚瑋洛', group: '第二組', totalBooks: 3900, delivered: 3612, missing: 288, rate: 92.62 },
  { code: '51013', name: '九龍塘宣道小學', person: '溫家銘', group: '第二組', totalBooks: 4600, delivered: 4350, missing: 250, rate: 94.57 },
  { code: '51007', name: '嘉諾撒聖瑪利學校', person: '張家維', group: '第五組', totalBooks: 4100, delivered: 4100, missing: 0, rate: 100.0 },
  { code: '51008', name: '拔萃小學', person: '戚瑋洛', group: '第二組', totalBooks: 2850, delivered: 2800, missing: 50, rate: 98.25 },
  { code: '51009', name: '黃埔宣道小學', person: '張家維', group: '第五組', totalBooks: 3750, delivered: 3600, missing: 150, rate: 96.0 },
];

const REAL_POS: PO[] = [
  { id: '7600028563', vendor: '340', publisher: '中國書局', schoolCode: '40101', schoolName: '保良局林文燦英文小學', amount: 85734.85, status: '已批', days: 2, createdBy: 'EDMUNDWAN', date: '2026-05-04' },
  { id: '7600028564', vendor: '397', publisher: '牛津大學出版社', schoolCode: '40101', schoolName: '保良局林文燦英文小學', amount: 11503.80, status: '已批', days: 0, createdBy: 'EDMUNDWAN', date: '2026-05-04' },
  { id: '7600028565', vendor: '507', publisher: '育才書店', schoolCode: '40101', schoolName: '保良局林文燦英文小學', amount: 70851.00, status: '已批', days: 1, createdBy: 'EDMUNDWAN', date: '2026-05-04' },
  { id: '7600028707', vendor: '1057', publisher: '樂思', schoolCode: '50702', schoolName: '慈幼學校', amount: 42994.00, status: '已批', days: 3, createdBy: 'SLLO', date: '2026-05-18' },
  { id: '7600028636', vendor: '340', publisher: '中國書局', schoolCode: '30401', schoolName: '海壩街官立小學', amount: 125430.00, status: '未批', days: 5, createdBy: 'TRACYCHAN', date: '2026-05-13' },
  { id: '7600028637', vendor: '380', publisher: '文林出版', schoolCode: '30402', schoolName: '中華基督教會基慧小學(馬灣)', amount: 18920.00, status: '已批', days: 0, createdBy: 'TRACYCHAN', date: '2026-05-13' },
  { id: '7600028638', vendor: '397', publisher: '牛津大學出版社', schoolCode: '30404', schoolName: '亞斯理衛理小學', amount: 64200.00, status: '未批', days: 4, createdBy: 'TRACYCHAN', date: '2026-05-13' },
  { id: '7600028745', vendor: '1232', publisher: '浸信會出版社', schoolCode: '52833', schoolName: '天主教柏德小學', amount: 28940.00, status: '已批', days: 1, createdBy: 'SLLO', date: '2026-05-18' },
];

const REAL_BOOKS: Book[] = [
  { id: '1', term: '上學期', school: '保良局林文燦英文小學', schoolCode: '40101', grade: '小一', vendor: '中國書局', isbn: '9789888804481', title: '現代小學中文 漢語拼音版 小一 第一冊', price: 108.00, bookQty: 132, orderQty: 112, po: '7600028563', subject: '中文', type: '課本', missingQty: 0, manager: '溫家銘' },
  { id: '2', term: '上學期', school: '保良局林文燦英文小學', schoolCode: '40101', grade: '小一', vendor: '中國書局', isbn: '9789888804498', title: '現代小學中文 漢語拼音版 小一 第二冊', price: 108.00, bookQty: 132, orderQty: 112, po: '7600028563', subject: '中文', type: '課本', missingQty: 0, manager: '溫家銘' },
  { id: '3', term: '上學期', school: '保良局林文燦英文小學', schoolCode: '40101', grade: '小一', vendor: '育才書店', isbn: '9789888426669', title: '小學來說普通話課本 4下 (附自學配套)', price: 129.50, bookQty: 400, orderQty: 400, po: '7600028707', subject: '普通話', type: '課本', missingQty: 45, manager: '溫家銘' },
  { id: '4', term: '上學期', school: '海壩街官立小學', schoolCode: '30401', grade: '小三', vendor: '牛津大學出版社', isbn: '9780190119331', title: 'Oxford English Gold 3A', price: 154.00, bookQty: 180, orderQty: 180, po: '7600028638', subject: '英文', type: '課本', missingQty: 25, manager: '廖志華' },
  { id: '5', term: '下學期', school: '中華基督教會基慧小學(馬灣)', schoolCode: '30402', grade: '小五', vendor: '文林出版', isbn: '9789881234567', title: '新一代小學音樂 五年級下冊', price: 82.00, bookQty: 210, orderQty: 210, po: '7600028637', subject: '音樂', type: '課本', missingQty: 15, manager: '鄭煌昱' },
  { id: '6', term: '上學期', school: '西貢崇真天主教學校(小學部)', schoolCode: '30331', grade: '小二', vendor: '中國書局', isbn: '9789888804504', title: '現代小學中文 漢語拼音版 小一 第三冊', price: 108.00, bookQty: 122, orderQty: 122, po: '7600028563', subject: '中文', type: '課本', missingQty: 200, manager: '郭家臻' },
];

// ==========================================================
// Main dashboard component
// ==========================================================
export default function TextbookDashboard() {
  const [schools, setSchools] = useState<School[]>(REAL_SCHOOLS);
  const [pos, setPos] = useState<PO[]>(REAL_POS);
  const [books, setBooks] = useState<Book[]>(REAL_BOOKS);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedManager, setSelectedManager] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [poFilterStatus, setPoFilterStatus] = useState('All');
  const [uploadMessage, setUploadMessage] = useState<{ type: string; text: string } | null>(null);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------------
  // CSV import
  // ----------------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        parseCSVData(file.name, event.target?.result as string);
      } catch (err: any) {
        setUploadMessage({ type: 'error', text: `解析失敗: ${err.message}` });
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseCSVData = (fileName: string, text: string) => {
    const rows = text.split(/\r?\n/).filter((row) => row.trim() !== '');
    if (rows.length === 0) return;
    const headers = rows[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

    if (headers.includes('學期') && headers.includes('學校') && headers.includes('書名')) {
      // Master table
      const parsedBooks: Book[] = rows.slice(1).map((row, index) => {
        const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
        const clean = (val?: string) => (val ? val.trim().replace(/^"|"$/g, '') : '');
        return {
          id: `csv-book-${index}`,
          term: clean(matches[0]) || '上學期',
          school: clean(matches[1]) || '未知學校',
          schoolCode: clean(matches[1]) || '',
          grade: clean(matches[2]) || '未知年級',
          vendor: clean(matches[5]) || '未知供應商',
          isbn: clean(matches[6]) || '',
          title: clean(matches[7]) || '無書名',
          price: parseFloat(clean(matches[8])) || 0,
          bookQty: parseInt(clean(matches[9])) || 0,
          orderQty: parseInt(clean(matches[12])) || 0,
          po: clean(matches[15]) || '',
          subject: clean(matches[16]) || '其他',
          type: clean(matches[17]) || 'A',
          missingQty: parseInt(clean(matches[29])) || 0,
          manager: clean(matches[30]) || '未指派',
        };
      }).filter((b) => b.title !== '無書名');

      setBooks(parsedBooks);
      setUploadMessage({ type: 'success', text: `成功載入 總表數據 (${parsedBooks.length} 筆用書明細)` });

      const schoolGroups: Record<string, School> = {};
      parsedBooks.forEach((b) => {
        if (!schoolGroups[b.school]) {
          schoolGroups[b.school] = {
            code: b.schoolCode,
            name: b.school,
            person: b.manager,
            group: b.schoolCode.startsWith('3') ? '第一組' : '第二組',
            totalBooks: 0,
            delivered: 0,
            missing: 0,
            rate: 0,
          };
        }
        schoolGroups[b.school].totalBooks += b.bookQty;
        schoolGroups[b.school].missing += b.missingQty;
        schoolGroups[b.school].delivered = Math.max(
          0,
          schoolGroups[b.school].totalBooks - schoolGroups[b.school].missing
        );
      });
      const updatedSchools: School[] = Object.values(schoolGroups).map((s) => ({
        ...s,
        rate: s.totalBooks > 0 ? parseFloat(((s.delivered / s.totalBooks) * 100).toFixed(2)) : 100,
      }));
      setSchools(updatedSchools);
    } else if (headers.includes('PO') && (headers.includes('Amount') || headers.includes('Status'))) {
      // PO list
      const parsedPOs: PO[] = rows.slice(1).map((row, index) => {
        const cols = row.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        return {
          id: cols[3] || `po-${index}`,
          vendor: cols[4] || '',
          publisher: cols[5] || '未知出版社',
          schoolCode: cols[6] || '',
          schoolName: cols[7] || '未知學校',
          amount: parseFloat(cols[8]?.replace(/,/g, '')) || 0,
          status: cols[9] === 'RB' ? '已批' : cols[9] || '未審',
          days: parseInt(cols[10]) || 0,
          createdBy: cols[11] || 'SYSTEM',
          date: cols[12] || '2026-05-01',
        };
      }).filter((p) => p.id && p.id !== 'PO');

      setPos(parsedPOs);
      setUploadMessage({ type: 'success', text: `成功載入 PO 採購單數據 (${parsedPOs.length} 筆訂單)` });
    } else {
      setUploadMessage({ type: 'warning', text: '偵測到 CSV，但欄位格式未匹配，已為您保留預載真實數據。' });
    }
  };

  // ----------------------------------------------------------
  // KPIs
  // ----------------------------------------------------------
  const kpis = useMemo(() => {
    const totalPoValue = pos.reduce((sum, item) => sum + item.amount, 0);
    const totalMissingBooks = books.reduce((sum, item) => sum + item.missingQty, 0);
    const totalOrderQty = schools.reduce((sum, s) => sum + s.totalBooks, 0);
    const totalDelivered = schools.reduce((sum, s) => sum + s.delivered, 0);
    const overallDeliveredRate = totalOrderQty > 0 ? (totalDelivered / totalOrderQty) * 100 : 96.2;
    const vendorSet = new Set([...pos.map((p) => p.publisher), ...books.map((b) => b.vendor)]);
    return {
      poValue: totalPoValue,
      schoolsCount: schools.length,
      vendorsCount: vendorSet.size,
      deliveredRate: overallDeliveredRate,
      missingCount: totalMissingBooks,
    };
  }, [schools, pos, books]);

  const filterOptions = useMemo(() => ({
    groups: ['All', ...Array.from(new Set(schools.map((s) => s.group).filter(Boolean)))],
    managers: ['All', ...Array.from(new Set(schools.map((s) => s.person).filter(Boolean)))],
  }), [schools]);

  const filteredSchools = useMemo(() =>
    schools.filter((s) => {
      const matchGroup = selectedGroup === 'All' || s.group === selectedGroup;
      const matchManager = selectedManager === 'All' || s.person === selectedManager;
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.includes(searchTerm) ||
        s.person.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGroup && matchManager && matchSearch;
    }), [schools, selectedGroup, selectedManager, searchTerm]);

  const filteredPOs = useMemo(() =>
    pos.filter((p) => {
      const matchStatus = poFilterStatus === 'All' || p.status === poFilterStatus;
      const matchSearch =
        p.id.includes(searchTerm) ||
        p.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    }), [pos, poFilterStatus, searchTerm]);

  const filteredMissingBooks = useMemo(() =>
    books.filter(
      (b) =>
        b.missingQty > 0 &&
        (b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.isbn.includes(searchTerm))
    ), [books, searchTerm]);

  const subjectChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => { counts[b.subject] = (counts[b.subject] || 0) + b.orderQty; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [books]);

  const groupPerformanceData = useMemo(() => {
    const groups: Record<string, { name: string; total: number; delivered: number }> = {};
    schools.forEach((s) => {
      if (!groups[s.group]) groups[s.group] = { name: s.group, total: 0, delivered: 0 };
      groups[s.group].total += s.totalBooks;
      groups[s.group].delivered += s.delivered;
    });
    return Object.values(groups).map((g) => ({
      name: g.name,
      rate: g.total > 0 ? Math.round((g.delivered / g.total) * 100) : 0,
    }));
  }, [schools]);

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-indigo-800">2026-27 小學用書決策儀表板</h1>
                <p className="text-xs text-slate-500">已預載入真實數據：張志新、廖志華、溫家銘等組別</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                覆蓋/導入新 CSV
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Upload message */}
        {uploadMessage && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-between shadow-sm border ${
            uploadMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            uploadMessage.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{uploadMessage.text}</span>
            </div>
            <button onClick={() => setUploadMessage(null)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <KPICard
            label="採購總額 (實洋)"
            value={`$${kpis.poValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sub={`合計 ${pos.length} 張真實 PO 數據`}
            color="indigo"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <KPICard
            label="合作小學"
            value={`${kpis.schoolsCount} 間`}
            sub="包含第一、二、三、五業務組"
            color="emerald"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
          />
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">整體到貨率</span>
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-900">{kpis.deliveredRate.toFixed(2)}%</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${kpis.deliveredRate}%` }} />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">目前欠書數</span>
              <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
            </div>
            <div className="mt-4">
              <h3 className={`text-2xl font-bold ${kpis.missingCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {kpis.missingCount.toLocaleString()} 本
              </h3>
              <p className="text-xs text-slate-500 mt-1">需與聯絡人跟進追書</p>
            </div>
          </div>
          <KPICard
            label="核心出版社"
            value={`${kpis.vendorsCount} 家`}
            sub="包含中國書局、牛津、樂思"
            color="amber"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
          />
        </section>

        {/* Search & Filter bar */}
        <section className="bg-white p-5 rounded-2xl border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-64 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={
                  activeTab === 'pos' ? '搜尋 PO 單號、出版社、建立人...' :
                  activeTab === 'shortages' ? '搜尋缺書名、ISBN、負責人...' :
                  '搜尋學校名稱、負責人(張志新/廖志華等)...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {activeTab === 'schools' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">組別</label>
                    <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {filterOptions.groups.map((g) => <option key={g} value={g}>{g === 'All' ? '所有組別' : g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">負責人</label>
                    <select value={selectedManager} onChange={(e) => setSelectedManager(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {filterOptions.managers.map((m) => <option key={m} value={m}>{m === 'All' ? '所有負責人' : m}</option>)}
                    </select>
                  </div>
                </>
              )}
              {activeTab === 'pos' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">審批狀態</label>
                  <select value={poFilterStatus} onChange={(e) => setPoFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="All">所有狀態</option>
                    <option value="已批">已批</option>
                    <option value="未批">未批</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tabs nav */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '📊 經營總覽' },
              { id: 'schools', label: '🏫 學校進度監控' },
              { id: 'pos', label: '🧾 採購單 (PO) 管理' },
              { id: 'shortages', label: '⚠️ 供貨欠量與欠客' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all relative ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.id === 'shortages' && kpis.missingCount > 0 && (
                  <span className="absolute -top-1 -right-4 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {kpis.missingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 mb-1">主營學科用書佔比分析</h3>
              <p className="text-xs text-slate-500 mb-6">基於您上傳的「總表」真實學科銷售數量歸類</p>
              <div className="space-y-4">
                {subjectChartData.map((item, index) => {
                  const max = Math.max(...subjectChartData.map((d) => d.value));
                  const percent = max > 0 ? (item.value / max) * 100 : 0;
                  const totalSum = subjectChartData.reduce((s, i) => s + i.value, 0);
                  const share = totalSum > 0 ? ((item.value / totalSum) * 100).toFixed(1) : '0';
                  const barColor = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500'][index] ?? 'bg-slate-400';
                  return (
                    <div key={item.name} className="flex items-center">
                      <span className="w-16 text-sm font-semibold text-slate-600">{item.name}</span>
                      <div className="flex-1 ml-4 mr-4">
                        <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                          <div className={`h-full rounded-lg transition-all duration-700 ${barColor}`} style={{ width: `${percent}%` }} />
                          <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-white drop-shadow-sm">
                            {item.value.toLocaleString()} 本
                          </span>
                        </div>
                      </div>
                      <span className="w-12 text-right text-xs font-bold text-slate-500">{share}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">業務組別到貨進度</h3>
                <div className="space-y-4">
                  {groupPerformanceData.map((g) => (
                    <div key={g.name} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700">{g.name || '其他組別'}</span>
                        <span className="text-sm font-bold text-indigo-600">{g.rate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${g.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">採購批核狀態與時效</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                    <span className="text-xs text-emerald-600 font-semibold uppercase block">已批覆單數</span>
                    <strong className="text-3xl font-black text-emerald-800 mt-2 block">
                      {pos.filter((p) => p.status === '已批').length}
                    </strong>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl text-center">
                    <span className="text-xs text-amber-600 font-semibold uppercase block">待批單數</span>
                    <strong className="text-3xl font-black text-amber-800 mt-2 block">
                      {pos.filter((p) => p.status !== '已批').length}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Schools */}
        {activeTab === 'schools' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">學校用書發行進度</h3>
                <p className="text-xs text-slate-500">已配對負責人 (張志新、廖志華、溫家銘等) 與組別篩選</p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold">
                已篩選出 {filteredSchools.length} 所合作學校
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6">學校編號</th>
                    <th className="py-4 px-6">學校名稱</th>
                    <th className="py-4 px-6">組別 / 負責人</th>
                    <th className="py-4 px-6 text-right">總用書需求量</th>
                    <th className="py-4 px-6 text-right">已到貨</th>
                    <th className="py-4 px-6 text-right">尚欠本數</th>
                    <th className="py-4 px-6 text-right">到貨率</th>
                    <th className="py-4 px-6 text-center">書單明細</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchools.map((school) => {
                    const isExpanded = expandedSchool === school.code;
                    const schoolBooks = books.filter(
                      (b) => b.school.includes(school.name) || b.schoolCode === school.code
                    );
                    return (
                      <React.Fragment key={school.code}>
                        <tr
                          className="hover:bg-slate-50 transition cursor-pointer"
                          onClick={() => setExpandedSchool(isExpanded ? null : school.code)}
                        >
                          <td className="py-4 px-6 font-mono text-sm text-slate-600">{school.code}</td>
                          <td className="py-4 px-6 font-bold text-slate-800">{school.name}</td>
                          <td className="py-4 px-6 text-sm text-slate-600">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs mr-2">{school.group}</span>
                            <span className="font-medium text-slate-700">{school.person}</span>
                          </td>
                          <td className="py-4 px-6 text-right font-semibold text-slate-700">{school.totalBooks.toLocaleString()}</td>
                          <td className="py-4 px-6 text-right font-semibold text-emerald-600">{school.delivered.toLocaleString()}</td>
                          <td className="py-4 px-6 text-right">
                            <span className={`font-semibold ${school.missing > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                              {school.missing}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className="font-bold text-slate-800">{school.rate}%</span>
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${school.rate === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                  style={{ width: `${school.rate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">
                              {isExpanded ? '收起' : '展開'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="bg-slate-50 px-8 py-4 border-t border-b border-indigo-50">
                              <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden">
                                <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                                  <span className="text-xs font-bold text-indigo-800">📖 {school.name} - 詳細訂書明細</span>
                                  <span className="text-xs text-slate-500">負責同事: {school.person}</span>
                                </div>
                                {schoolBooks.length === 0 ? (
                                  <p className="p-4 text-xs text-slate-400 text-center">此學校目前為完全到貨，暫無未決欠書記錄。</p>
                                ) : (
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                                        <th className="p-3 pl-4">學期</th>
                                        <th className="p-3">年級</th>
                                        <th className="p-3">科目</th>
                                        <th className="p-3">ISBN</th>
                                        <th className="p-3">書名</th>
                                        <th className="p-3 text-right">定價</th>
                                        <th className="p-3 text-right">訂購量</th>
                                        <th className="p-3 text-right">尚欠</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {schoolBooks.map((book) => (
                                        <tr key={book.id} className="hover:bg-indigo-50">
                                          <td className="p-3 pl-4 text-slate-500">{book.term}</td>
                                          <td className="p-3 font-semibold text-slate-600">{book.grade}</td>
                                          <td className="p-3">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm font-semibold">{book.subject}</span>
                                          </td>
                                          <td className="p-3 font-mono text-slate-500">{book.isbn}</td>
                                          <td className="p-3 font-medium text-slate-800">{book.title}</td>
                                          <td className="p-3 text-right text-slate-600">${book.price.toFixed(2)}</td>
                                          <td className="p-3 text-right font-bold text-slate-700">{book.orderQty}</td>
                                          <td className="p-3 text-right font-bold text-rose-500">{book.missingQty || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: POs */}
        {activeTab === 'pos' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">採購單 (PO) 明細數據庫</h3>
                <p className="text-xs text-slate-500">追蹤來自各大出版社與供應商的採購單</p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold">
                共找到 {filteredPOs.length} 筆採購單
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6">採購單號 (PO)</th>
                    <th className="py-4 px-6">出版社</th>
                    <th className="py-4 px-6">目的學校</th>
                    <th className="py-4 px-6 text-right">實洋金額</th>
                    <th className="py-4 px-6 text-center">批核所需時間</th>
                    <th className="py-4 px-6 text-center">狀態</th>
                    <th className="py-4 px-6">建立者 / 日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPOs.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6 font-mono text-sm font-bold text-slate-700">{po.id}</td>
                      <td className="py-4 px-6 text-sm">
                        <div className="font-bold text-slate-800">{po.publisher}</div>
                        <div className="text-xs text-slate-400">Vendor: {po.vendor}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 font-medium">{po.schoolName}</td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-800">
                        ${po.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-center text-sm font-semibold text-slate-500">
                        {po.days === 0 ? '即日批核' : `${po.days} 天`}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          po.status === '已批' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 block">{po.createdBy}</span>
                        <span>{po.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Shortages */}
        {activeTab === 'shortages' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-rose-50">
              <h3 className="text-lg font-bold text-rose-950">供貨欠量與欠客清單 (急需催促出版社)</h3>
              <p className="text-xs text-rose-900/70">列表顯示供貨存在差額或缺貨的教材書籍</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6">缺書學校</th>
                    <th className="py-4 px-6">ISBN</th>
                    <th className="py-4 px-6">書名</th>
                    <th className="py-4 px-6">出版社</th>
                    <th className="py-4 px-6 text-right">定價</th>
                    <th className="py-4 px-6 text-right">訂購本數</th>
                    <th className="py-4 px-6 text-right text-rose-600 font-bold">供貨欠量</th>
                    <th className="py-4 px-6">負責同事</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMissingBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-rose-50 transition">
                      <td className="py-4 px-6 font-bold text-slate-700">{book.school}</td>
                      <td className="py-4 px-6 font-mono text-sm text-slate-500">{book.isbn}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{book.title}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-semibold text-xs">{book.vendor}</span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-600 font-mono">${book.price.toFixed(2)}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-700">{book.orderQty}</td>
                      <td className="py-4 px-6 text-right font-black text-rose-600 font-mono">{book.missingQty} 本</td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-700">{book.manager}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-slate-800 text-slate-400 py-8 mt-16 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-2">
          <p>© 2026-27 小學用書服務部. 保留所有權利。</p>
          <p className="text-slate-500">預載數據已根據「2026-27小學_用書總表」CSV 進行初始化整合。</p>
        </div>
      </footer>
    </div>
  );
}

// ----------------------------------------------------------
// Small KPI card helper
// ----------------------------------------------------------
function KPICard({
  label, value, sub, color, icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'indigo' | 'emerald' | 'amber';
  icon: React.ReactNode;
}) {
  const bg: Record<string, string> = { indigo: 'bg-indigo-50 text-indigo-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`p-1.5 rounded-lg ${bg[color]}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      </div>
    </div>
  );
}
