"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clipboard, Trash2, Zap, ArrowLeft } from "lucide-react";
import { fetchLinks, createLink, deleteLink, fetchLinkStats } from "@/lib/api";

interface LinkItem {
  id: number;
  target: string;
  shortCode: string;
  totalClicks: number;
  lastClicked: string | null;
  createdAt?: string | null;
}

const formatTime = (dateString: string | null | undefined) => {
  if (!dateString) return "Never";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString as string;
  }
};

const App = () => {
  const [items, setItems] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [target, setTarget] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [statsData, setStatsData] = useState<LinkItem | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const [currentView, setCurrentView] = useState<"dashboard" | "stats">(
    "dashboard"
  );
  const [statsCode, setStatsCode] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLinks();
      setItems(data);
    } catch (e) {
      console.error("Error loading links:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
    // const intervalId = setInterval(loadLinks, 10000); // Auto-refresh every 10s (commented out)
    // return () => clearInterval(intervalId);
  }, [loadLinks]);

  const addItem = async () => {
    setError(null);
    setSuccess(null);

    if (!target.trim()) {
      setError("Target URL is required.");
      return;
    }

    setFormLoading(true);
    try {
      const payload: { target: string; code?: string } = { target };
      if (code.trim()) payload.code = code.trim();

      const saved: LinkItem = await createLink(payload);
      setItems((prev) => [...prev, saved]);
      setTarget("");
      setCode("");
      setSuccess("Link created successfully!");
      setTimeout(() => {
        closeModal();
      }, 900);
    } catch (err: any) {
      console.error("Create failed:", err);
      if (err?.status === 409) {
        setError("Custom code already exists. Please choose another.");
      } else if (err?.status === 400) {
        setError(err.message || "Invalid URL or code format.");
      } else {
        setError(
          err?.message || "An unexpected error occurred while creating the link."
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const removeItem = async (id: number, shortCode: string) => {
    if (!window.confirm(`Are you sure you want to delete the link /${shortCode}?`))
      return;
    try {
      await deleteLink(shortCode);
      window.location.reload(); // Refresh page after delete
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Delete failed. Link may not exist.");
    }
  };

  const copyShortLink = (shortCode: string) => {
    const shortLink = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(shortLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const visitLink = (shortCode: string) => {
    window.open(`/${shortCode}`, "_blank");
    setTimeout(() => window.location.reload(), 500); // Refresh page after visit
  };

  const closeModal = () => {
    setShowModal(false);
    setTarget("");
    setCode("");
    setError(null);
    setSuccess(null);
  };

  const navigateToStats = async (code: string) => {
    setStatsCode(code);
    setStatsLoading(true);
    setCurrentView("stats");

    try {
      const data = await fetchLinkStats(code);
      setStatsData(data);
    } catch (err) {
      setStatsData(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const navigateToDashboard = () => {
    setStatsCode(null);
    setCurrentView("dashboard");
  };

  const Header = () => (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          L
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
            TinyURLManager
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Shrink Long URL To Short
          </p>
        </div>
      </div>
    </header>
  );

  const Footer = () => (
    <footer className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400">
      © {new Date().getFullYear()} TinyURLManager
    </footer>
  );

  const DashboardView = () => (
    <>
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6 mt-4">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100">
          Link Dashboard
        </h2>
        <button
          onClick={() => {
            setShowModal(true);
            setError(null);
            setSuccess(null);
          }}
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95"
        >
          + Add New Link
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-800 dark:text-slate-200 min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <th className="py-3 px-4 font-semibold text-sm rounded-tl-xl">
                  Short Code
                </th>
                <th className="py-3 px-4 font-semibold text-sm">Target URL</th>
                <th className="py-3 px-4 font-semibold text-sm">Clicks</th>
                <th className="py-3 px-4 font-semibold text-sm">Last Clicked</th>
                <th className="py-3 px-4 font-semibold text-sm text-center rounded-tr-xl">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-indigo-500 flex items-center justify-center gap-2"
                  >
                    Loading links...
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No links added yet. Click "+ Add New Link" to get started!
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b dark:border-gray-700 ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"
                      } hover:bg-indigo-50 dark:hover:bg-gray-700 transition`}
                    onClick={() => navigateToStats(item.shortCode)}
                  >
                    <td className="py-3 px-4 font-mono text-sm text-indigo-600 dark:text-indigo-400">
                      {item.shortCode}
                    </td>

                    <td
                      className="py-3 px-4 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-sm"
                      title={item.target}
                    >
                      <a
                        href={item.target}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        {item.target}
                      </a>
                    </td>

                    <td className="py-3 px-4 font-bold text-lg text-green-600 dark:text-green-400">
                      {item.totalClicks}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(item.lastClicked)}
                    </td>

                    <td className="py-3 px-4 flex justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyShortLink(item.shortCode); }}
                        className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-600 transition"
                        title="Copy Short Link"
                      >
                        <Clipboard className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); visitLink(item.shortCode); }}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
                        title="Visit Link"
                      >
                        <Zap className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); removeItem(item.id, item.shortCode); }}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                        title="Delete Link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const StatsView = () => {
    if (statsLoading) {
      return (
        <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg mt-10 text-center">
          <p className="text-indigo-600 dark:text-indigo-400 text-xl font-semibold">
            Loading stats...
          </p>
        </div>
      );
    }

    const stats = statsData;

    if (!stats) {
      return (
        <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg mt-10 text-center">
          <p className="text-2xl font-bold text-red-500">404 - Link Not Found</p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            The link short code <code>/{statsCode}</code> does not exist.
          </p>
          <button
            onClick={navigateToDashboard}
            className="mt-6 px-4 py-2 flex items-center gap-2 mx-auto bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      );
    }

    const StatCard = ({
      title,
      value,
      highlight,
      isLink,
    }: {
      title: string;
      value: string;
      highlight?: boolean;
      isLink?: boolean;
    }) => (
      <div className="border-b dark:border-gray-700 pb-4 last:border-b-0">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 break-words hover:underline mt-1 block font-mono text-sm"
          >
            {value}
          </a>
        ) : (
          <p
            className={`text-xl font-semibold mt-1 ${highlight
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-900 dark:text-slate-100"
              }`}
          >
            {value}
          </p>
        )}
      </div>
    );

    return (
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl mt-10 border border-gray-200 dark:border-gray-700">
        <button
          onClick={navigateToDashboard}
          className="mb-4 text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-6 border-b pb-4">
          Stats for:{" "}
          <code className="bg-gray-100 dark:bg-gray-700 p-1 rounded">
            /{stats.shortCode}
          </code>
        </h1>

        <div className="space-y-6 pt-2">
          <StatCard title="Target URL" value={stats.target} isLink />
          <StatCard title="Total Clicks" value={stats.totalClicks.toString()} highlight />
          <StatCard title="Last Clicked" value={formatTime(stats.lastClicked)} />
          <StatCard title="Created At" value={formatTime(stats.createdAt ?? null)} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="max-w-6xl mx-auto p-4">
        <Header />
        <main className="min-h-[60vh] pb-10">
          {currentView === "dashboard" && <DashboardView />}
          {currentView === "stats" && <StatsView />}
        </main>
        <Footer />
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-slate-100">Create New Link</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 border border-green-300 rounded-xl">
                {success}
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target URL</label>
            <input
              type="url"
              placeholder="e.g., https://your-very-long-link.com/path"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                setError(null);
              }}
              className="w-full mb-4 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-slate-100 placeholder-gray-400"
            />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Code (Optional)</label>
            <div className="flex mb-6">
              <span className="inline-flex items-center px-3 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-xl">
                {window.location.origin}/
              </span>
              <input
                type="text"
                placeholder="Short code (e.g., mylink)"
                value={code}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
                  setCode(cleanValue);
                  setError(null);
                }}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-r-xl focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-slate-100 placeholder-gray-400"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-slate-100 font-medium rounded-xl hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>

              <button
                onClick={addItem}
                disabled={formLoading || !target.trim()}
                className={`px-6 py-2 text-white font-medium rounded-xl transition transform active:scale-95 ${formLoading || !target.trim()
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/50"
                  }`}
              >
                {formLoading ? "Creating..." : "Create Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Confirmation Toast */}
      {isCopied && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-xl shadow-2xl transition-all duration-300 transform animate-pulse">
          <Clipboard className="inline-block mr-2 h-5 w-5" /> Link Copied to Clipboard!
        </div>
      )}
    </div>
  );
};

export default App;
