import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Github,
  BookOpen,
  Code,
  Terminal,
  Layout,
  Database,
  Search,
  ExternalLink,
  Moon,
  Sun,
  Tag,
  Save,
  Upload,
  CheckCircle2,
} from 'lucide-react';

// --- Icon Helpers ---
const getIconForType = (type) => {
  switch (type) {
    case 'github':
      return <Github className="w-4 h-4" />;
    case 'article':
      return <BookOpen className="w-4 h-4" />;
    case 'code':
      return <Code className="w-4 h-4" />;
    case 'tool':
      return <Terminal className="w-4 h-4" />;
    default:
      return <Layout className="w-4 h-4" />;
  }
};

// --- Keyword Logic for Auto-Categorization ---
const categorizeContent = (text) => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('github.com') || lowerText.includes('gitlab')) {
    return { type: 'github', category: 'Repositories' };
  }
  if (
    lowerText.includes('medium.com') ||
    lowerText.includes('dev.to') ||
    lowerText.includes('blog')
  ) {
    return { type: 'article', category: 'Articles' };
  }

  // Frameworks & Languages
  if (
    lowerText.includes('react') ||
    lowerText.includes('vue') ||
    lowerText.includes('angular') ||
    lowerText.includes('next.js')
  ) {
    return { type: 'code', category: 'Frontend' };
  }
  if (
    lowerText.includes('python') ||
    lowerText.includes('node') ||
    lowerText.includes('django') ||
    lowerText.includes('fastapi')
  ) {
    return { type: 'code', category: 'Backend' };
  }
  if (
    lowerText.includes('css') ||
    lowerText.includes('tailwind') ||
    lowerText.includes('sass') ||
    lowerText.includes('figma')
  ) {
    return { type: 'code', category: 'Design/CSS' };
  }
  if (
    lowerText.includes('sql') ||
    lowerText.includes('mongo') ||
    lowerText.includes('firebase') ||
    lowerText.includes('supabase')
  ) {
    return { type: 'tool', category: 'Database' };
  }
  if (
    lowerText.includes('docker') ||
    lowerText.includes('kubernetes') ||
    lowerText.includes('aws') ||
    lowerText.includes('linux')
  ) {
    return { type: 'tool', category: 'DevOps' };
  }
  if (
    lowerText.includes('ai') ||
    lowerText.includes('llm') ||
    lowerText.includes('gpt') ||
    lowerText.includes('machine learning')
  ) {
    return { type: 'tool', category: 'AI & ML' };
  }

  return { type: 'article', category: 'General' }; // Default
};

const App = () => {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';
  const GEMINI_MODEL = 'gemini-1.5-flash';

  // Load initial state from localStorage if available
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('smart-curator-items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        return [];
      }
    }
    return [
      {
        id: 1,
        title: 'Tailwind CSS Documentation',
        url: 'https://tailwindcss.com',
        note: 'Great utility-first CSS framework',
        category: 'Design/CSS',
        type: 'code',
        date: new Date().toLocaleDateString(),
      },
      {
        id: 2,
        title: 'Awesome React Repo',
        url: 'https://github.com/enaqx/awesome-react',
        note: 'Collection of React resources',
        category: 'Repositories',
        type: 'github',
        date: new Date().toLocaleDateString(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [inputNote, setInputNote] = useState('');
  const [filter, setFilter] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCategory, setNotificationCategory] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiAddLoading, setAiAddLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [roadmapContent, setRoadmapContent] = useState('');
  const [roadmapError, setRoadmapError] = useState('');

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('smart-curator-items', JSON.stringify(items));
  }, [items]);

  const callGeminiAPI = async ({ prompt, responseMimeType = 'application/json' }) => {
    if (!GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key.');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }
    return text;
  };

  const parseJsonSafe = (value) => {
    try {
      return JSON.parse(value);
    } catch (err) {
      return null;
    }
  };

  // --- Handlers ---
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (aiEnabled) {
      await handleAIAdd();
    } else {
      const { type, category } = categorizeContent(`${inputValue} ${inputNote}`);

      let displayTitle = inputValue;
      let parsedUrl = null;

      if (inputValue.startsWith('http')) {
        try {
          parsedUrl = new URL(inputValue);
          displayTitle = `${parsedUrl.hostname}${parsedUrl.pathname}`;
        } catch (err) {
          parsedUrl = null;
          displayTitle = inputValue;
        }
      }

      const newItem = {
        id: Date.now(),
        title: displayTitle,
        url: parsedUrl ? inputValue : null,
        note: inputNote,
        category,
        type,
        date: new Date().toLocaleDateString(),
      };

      setItems((prev) => [newItem, ...prev]);
      setInputValue('');
      setInputNote('');

      // Show quick success feedback
      setNotificationCategory(category);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Group items by category for the board view
  const categories = [...new Set(items.map((i) => i.category))].sort();

  // Export Data
  const exportData = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tech_curator_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAIAdd = async () => {
    if (!GEMINI_API_KEY) {
      alert('Add a Gemini API key to enable AI Smart Add.');
      return;
    }

    setAiAddLoading(true);
    try {
      const prompt = [
        'You are an assistant for a tech resource organizer.',
        'Return JSON only with keys: title, category, type, note.',
        'Types must be one of: github, article, code, tool.',
        'Keep the note concise (max 140 chars).',
        `Input: ${inputValue}`,
        inputNote ? `Note: ${inputNote}` : 'Note: (none)',
      ].join('\n');

      const responseText = await callGeminiAPI({ prompt });
      const responseJson = parseJsonSafe(responseText);

      const fallback = categorizeContent(`${inputValue} ${inputNote}`);
      const aiCategory = responseJson?.category ?? fallback.category;
      const aiType = responseJson?.type ?? fallback.type;
      const aiTitle = responseJson?.title ?? inputValue;
      const aiNote = responseJson?.note ?? inputNote;

      let parsedUrl = null;
      if (inputValue.startsWith('http')) {
        try {
          parsedUrl = new URL(inputValue);
        } catch (err) {
          parsedUrl = null;
        }
      }

      const newItem = {
        id: Date.now(),
        title: aiTitle,
        url: parsedUrl ? inputValue : null,
        note: aiNote,
        category: aiCategory,
        type: aiType,
        date: new Date().toLocaleDateString(),
      };

      setItems((prev) => [newItem, ...prev]);
      setInputValue('');
      setInputNote('');
      setNotificationCategory(aiCategory);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (err) {
      alert('AI Smart Add failed. Try again or use standard add.');
    } finally {
      setAiAddLoading(false);
    }
  };

  // Import Data
  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = (e) => {
      try {
        const importedItems = JSON.parse(e.target.result);
        const normalized = Array.isArray(importedItems)
          ? importedItems.map((item) => ({
              id: item.id ?? Date.now() + Math.random(),
              title: item.title ?? 'Untitled',
              url: item.url ?? null,
              note: item.note ?? '',
              category: item.category ?? 'General',
              type: item.type ?? 'article',
              date: item.date ?? new Date().toLocaleDateString(),
            }))
          : [];
        setItems(normalized);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
  };

  const handleGenerateRoadmap = async () => {
    if (!GEMINI_API_KEY) {
      alert('Add a Gemini API key to enable AI Insights.');
      return;
    }

    setRoadmapLoading(true);
    setRoadmapError('');
    setRoadmapOpen(true);

    try {
      const itemsSnapshot = items
        .map((item) => `${item.title} | ${item.category} | ${item.note ?? ''}`)
        .slice(0, 80)
        .join('\n');

      const prompt = [
        'You are a learning assistant.',
        'Return JSON only with keys: profile, roadmap, insights, next_steps.',
        'profile: short sentence.',
        'roadmap: array of 4-6 steps.',
        'insights: 2-4 bullet-style sentences.',
        'next_steps: array of 3 items.',
        'Keep output concise.',
        `Library:\n${itemsSnapshot || 'No items yet.'}`,
      ].join('\n');

      const responseText = await callGeminiAPI({ prompt });
      const responseJson = parseJsonSafe(responseText);

      if (!responseJson) {
        throw new Error('Roadmap parse failed.');
      }

      const roadmapLines = [
        `Profile: ${responseJson.profile ?? 'Learning explorer'}`,
        '',
        'Roadmap:',
        ...(responseJson.roadmap ?? []).map((step, index) => `${index + 1}. ${step}`),
        '',
        'Insights:',
        ...(responseJson.insights ?? []).map((insight) => `- ${insight}`),
        '',
        'Next Steps:',
        ...(responseJson.next_steps ?? []).map((step, index) => `${index + 1}. ${step}`),
      ];

      setRoadmapContent(roadmapLines.join('\n'));
    } catch (err) {
      setRoadmapError('Unable to generate a roadmap. Try again later.');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const title = item.title?.toLowerCase() ?? '';
    const note = item.note?.toLowerCase() ?? '';
    const category = item.category?.toLowerCase() ?? '';
    const query = filter.toLowerCase();
    return title.includes(query) || note.includes(query) || category.includes(query);
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-gray-900'
      } font-sans`}
    >
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Added to {notificationCategory || 'General'}</span>
        </div>
      )}

      {/* Navbar */}
      <nav
        className={`sticky top-0 z-10 border-b ${
          darkMode
            ? 'bg-slate-900/90 border-slate-700'
            : 'bg-white/90 border-gray-200'
        } backdrop-blur-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Tech Curator</h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleGenerateRoadmap}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold hover:from-amber-500 hover:to-orange-600 transition-colors"
                title="AI Insights & Roadmap"
              >
                AI Insights
              </button>
              <button
                onClick={exportData}
                className="p-2 rounded-full hover:bg-slate-700/20"
                title="Export JSON"
              >
                <Save className="w-5 h-5 opacity-70" />
              </button>
              <label
                className="p-2 rounded-full hover:bg-slate-700/20 cursor-pointer"
                title="Import JSON"
              >
                <Upload className="w-5 h-5 opacity-70" />
                <input type="file" className="hidden" onChange={importData} accept=".json" />
              </label>
              <div className="h-6 w-px bg-gray-500/20 mx-2"></div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-slate-700/20"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 opacity-70" />
                ) : (
                  <Moon className="w-5 h-5 opacity-70" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div
          className={`mb-10 p-6 rounded-2xl shadow-sm border ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}
        >
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
                New Resource
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Paste URL or Title..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={`flex-1 p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    darkMode
                      ? 'bg-slate-900 border-slate-700 placeholder-slate-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  className={`flex-1 p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    darkMode
                      ? 'bg-slate-900 border-slate-700 placeholder-slate-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-6 py-3 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 whitespace-nowrap ${
                    aiEnabled
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={aiAddLoading}
                >
                  <Plus className="w-5 h-5" />
                  <span>{aiAddLoading ? 'Analyzing...' : aiEnabled ? 'Smart Add' : 'Add'}</span>
                </button>
              </div>
            </div>
          </form>
          <div className="mt-3 flex items-center justify-between gap-4 text-[10px] sm:text-xs opacity-60">
            <div className="flex items-center gap-2">
              <Search className="w-3 h-3" />
              <span>Smart Sort enabled: Keywords like "React", "Python", "Linux" will auto-categorize.</span>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-500 text-blue-500"
              />
              <span className="uppercase tracking-wider">AI Auto-Tagging</span>
            </label>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div
            className={`relative max-w-md rounded-lg overflow-hidden ${
              darkMode ? 'bg-slate-800' : 'bg-white'
            } border ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}
          >
            <Search className="absolute left-3 top-3 w-5 h-5 opacity-40" />
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`w-full pl-10 p-3 bg-transparent outline-none ${
                darkMode ? 'placeholder-slate-500' : 'placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Kanban / Masonry Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const catItems = filteredItems.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="flex flex-col space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/10">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      darkMode
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {cat}
                  </span>
                  <span className="text-[10px] opacity-40 font-mono">{catItems.length}</span>
                </div>

                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative p-4 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-1 ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50'
                        : 'bg-white border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div
                        className={`p-1.5 rounded-md ${
                          darkMode ? 'bg-slate-900 text-blue-400' : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {getIconForType(item.type)}
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:text-blue-500 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm leading-snug mb-2 pr-1 break-words">
                      {item.title}
                    </h3>

                    {item.note && (
                      <p
                        className={`text-xs mb-3 line-clamp-3 ${
                          darkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}
                      >
                        {item.note}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200/5">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3 h-3 opacity-30" />
                        <span className="text-[10px] opacity-50 uppercase">{item.type}</span>
                      </div>
                      <span className="text-[10px] opacity-30 font-mono">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No items found.</p>
          </div>
        )}
      </main>

      {roadmapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className={`w-full max-w-2xl rounded-2xl border p-6 shadow-xl ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold">AI Learning Roadmap</h2>
              <button
                onClick={() => setRoadmapOpen(false)}
                className="px-3 py-1 text-xs rounded-full border border-slate-500/40 hover:border-slate-400"
              >
                Close
              </button>
            </div>
            {roadmapLoading ? (
              <p className="text-sm opacity-70">Analyzing your library...</p>
            ) : roadmapError ? (
              <p className="text-sm text-red-400">{roadmapError}</p>
            ) : (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{roadmapContent}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
