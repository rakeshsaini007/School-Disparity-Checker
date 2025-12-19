
import React, { useState, useEffect, useCallback } from 'react';
import { School, ApiResponse } from './types';
import { Layout } from './components/Layout';
import { SchoolTable } from './components/SchoolTable';
import { FileDown, RefreshCw, AlertCircle, CheckCircle2, Search } from 'lucide-react';

// IMPORTANT: User must replace this URL after deploying the Google Apps Script in code.js
const GAS_DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbwr7Fv_C0AGhVQJQchpKyvsFBVs13dusBJDiO1O8k3nGMUQ1ZsAV7Pj1srvRc5Q8khA/exec';

const App: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchRemainingSchools = useCallback(async () => {
    if (GAS_DEPLOY_URL.includes('PASTE_YOUR')) {
      setError("Please configure the GAS_DEPLOY_URL in App.tsx with your deployed Google Apps Script URL.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${GAS_DEPLOY_URL}?action=getData`);
      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setSchools(result.data);
      } else {
        setError(result.message || "Failed to fetch school data.");
      }
    } catch (err) {
      setError("Network error: Could not reach the script. Ensure CORS is enabled and URL is correct.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRemainingSchools();
  }, [fetchRemainingSchools]);

  const handleGeneratePdf = async () => {
    if (schools.length === 0) return;
    
    setGenerating(true);
    try {
      const response = await fetch(`${GAS_DEPLOY_URL}?action=getPdf`);
      const result: ApiResponse = await response.json();
      
      if (result.success && result.pdfBase64) {
        // Create download link for the PDF
        const linkSource = `data:application/pdf;base64,${result.pdfBase64}`;
        const downloadLink = document.createElement("a");
        const fileName = `Remaining_Schools_${new Date().toISOString().split('T')[0]}.pdf`;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        alert(result.message || "Failed to generate PDF.");
      }
    } catch (err) {
      alert("Error generating PDF. Check console for details.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nyayPanchayat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Remaining Schools</h1>
            <p className="text-slate-500 mt-1">Comparison of 'SchoolList' vs 'Data' sheets</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchRemainingSchools}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
            <button 
              onClick={handleGeneratePdf}
              disabled={generating || schools.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:bg-slate-300 disabled:shadow-none"
            >
              {generating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              RemainingSchool PDF
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!error && schools.length > 0 && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Found {schools.length} schools that are not yet recorded in the Data sheet.</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by school or panchayat..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <SchoolTable schools={filteredSchools} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};

export default App;
