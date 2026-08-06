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
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accentBg: "from-emerald-500 to-teal-600",
      description:
        "Comprehensive PDF summary of all medicines, categories, available quantities, unit pricing, and supplier allocations.",
      filename: "inventory-report.pdf",
      apiCall: downloadInventoryReport,
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "expiry",
      title: "Expiry & Expiration Risk Report",
      badge: "Risk & Compliance",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      accentBg: "from-amber-500 to-orange-600",
      description:
        "Filtered compliance document highlighting expired items and medicines expiring within 30 days for priority rotation.",
      filename: "expiry-report.pdf",
      apiCall: downloadExpiryReport,
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "stock",
      title: "Stock Movement Audit Log",
      badge: "Audit Trail",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      accentBg: "from-indigo-500 to-violet-600",
      description:
        "Detailed transaction audit trail documenting all stock additions, adjustments, sales, and quantity delta history.",
      filename: "stock-report.pdf",
      apiCall: downloadStockReport,
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
            Admin Exclusive Portal
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Inventory & Stock Reports
          </h1>
          <p className="mt-2 text-base text-gray-600 max-w-3xl">
            Generate and export official PDF reports for inventory auditing, compliance tracking, and stock movement logs.
          </p>
        </div>

        {/* Feedback Alert Toast */}
        {statusMessage && (
          <div
            className={`mb-8 p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all ${
              statusMessage.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : statusMessage.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {statusMessage.type === "success" && (
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {statusMessage.type === "error" && (
                <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {statusMessage.type === "info" && (
                <svg className="w-5 h-5 text-blue-600 animate-spin shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span className="text-sm font-medium">{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs font-semibold opacity-60 hover:opacity-100 transition-opacity"
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
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform duration-200">
                      {report.icon}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${report.badgeColor}`}>
                      {report.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Footer Action Area */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                  <button
                    disabled={isLoading}
                    onClick={() => handleDownload(report.id, report.apiCall, report.filename)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Generating PDF...</span>
                      </>
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