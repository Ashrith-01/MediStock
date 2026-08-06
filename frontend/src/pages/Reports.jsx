import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  downloadInventoryReport,
  downloadExpiryReport,
  downloadStockReport,
} from "../services/reportService";

export default function Reports() {
  const [downloading, setDownloading] = useState({
    inventory: false,
    expiry: false,
    stock: false,
  });
  const [statusMessage, setStatusMessage] = useState(null);

  const handleDownload = async (type, apiCall, filename) => {
    setDownloading((prev) => ({ ...prev, [type]: true }));
    setStatusMessage({ type: "info", text: `Generating ${filename}... Please wait.` });

    try {
      const response = await apiCall();
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatusMessage({
        type: "success",
        text: `Successfully downloaded ${filename}!`,
      });
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
      setStatusMessage({
        type: "error",
        text: `Failed to download ${filename}. ${
          error.response?.status === 403
            ? "Access denied. Admin privileges required."
            : "Is the backend server running?"
        }`,
      });
    } finally {
      setDownloading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const reports = [
    {
      id: "inventory",
      title: "Inventory Master Report",
      badge: "Full Catalog",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description:
        "Comprehensive PDF summary of all medicines, categories, available quantities, unit pricing, and supplier allocations.",
      filename: "inventory-report.pdf",
      apiCall: downloadInventoryReport,
      icon: (
        <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "expiry",
      title: "Expiry Risk Report",
      badge: "Risk & Compliance",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description:
        "Filtered compliance document highlighting expired items and medicines expiring within 30 days for priority rotation.",
      filename: "expiry-report.pdf",
      apiCall: downloadExpiryReport,
      icon: (
        <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "stock",
      title: "Stock Audit Trail Log",
      badge: "Audit Trail",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      description:
        "Detailed transaction audit trail documenting all stock additions, adjustments, sales, and quantity delta history.",
      filename: "stock-report.pdf",
      apiCall: downloadStockReport,
      icon: (
        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Admin Exclusive Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight sm:text-4xl">
            Inventory & Stock PDF Reports
          </h1>
          <p className="mt-2 text-base text-slate-400 max-w-3xl">
            Generate and export official PDF reports for inventory auditing, compliance tracking, and stock movement logs.
          </p>
        </div>

        {/* Feedback Alert Toast */}
        {statusMessage && (
          <div
            className={`mb-8 p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold shadow-lg transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : statusMessage.type === "error"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold opacity-70 hover:opacity-100 transition-opacity"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((report) => {
            const isLoading = downloading[report.id];
            return (
              <div
                key={report.id}
                className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 group-hover:scale-105 transition-transform duration-200">
                      {report.icon}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${report.badgeColor}`}>
                      {report.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-extrabold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {report.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Footer Action Area */}
                <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800">
                  <button
                    disabled={isLoading}
                    onClick={() => handleDownload(report.id, report.apiCall, report.filename)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:opacity-90 disabled:opacity-60 shadow-glow-cyan transition-all"
                  >
                    {isLoading ? (
                      <span>Generating PDF...</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download PDF Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}