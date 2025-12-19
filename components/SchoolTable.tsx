
import React from 'react';
import { School } from '../types';

interface SchoolTableProps {
  schools: School[];
  loading: boolean;
}

export const SchoolTable: React.FC<SchoolTableProps> = ({ schools, loading }) => {
  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p>Fetching data from Google Sheets...</p>
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <p className="text-lg font-medium">No remaining schools found</p>
        <p className="text-sm">Either all schools are synced or there's no data in SchoolList.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">School Name</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nyay Panchayat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {schools.map((school, index) => (
            <tr key={`${school.name}-${index}`} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-500 font-medium">{index + 1}</td>
              <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{school.name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                  {school.nyayPanchayat}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
