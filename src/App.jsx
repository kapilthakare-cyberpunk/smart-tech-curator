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
  // Load initial state from localStorage if available
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('smart-curator-items');
    return saved
      ? JSON.parse(saved)
      : [
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

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('smart-curator-items', JSON.stringify(items));
  }, [items]);

  // --- Handlers ---
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const { type, category } = categorizeContent(`${inputValue} ${inputNote}`);

    const newItem = {
      id: Date.now(),
      title: inputValue.startsWith('http')
        ? new URL(inputValue).hostname + new URL(inputValue).pathname
        : inputValue,
      url: inputValue.startsWith('http') ? inputValue : null,
      note: inputNote,
      category,
      type,
      date: new Date().toLocaleDateString(),
    };

    setItems([newItem, ...items]);
    setInputValue('');
    setInputNote('');

    // Show quick success feedback
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
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
  };

  // Import Data
  const importData = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], 'UTF-8');
    fileReader.onload = (e) => {
      try {
        const importedItems = JSON.parse(e.target.result);
        setItems(importedItems);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(filter.toLowerCase()) ||
      item.note.toLowerCase().includes(filter.toLowerCase()) ||
      item.category.toLowerCase().includes(filter.toLowerCase())
  );

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
          <span>Added to {items[0]?.category}</span>
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
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </form>
          <div className="mt-3 text-[10px] sm:text-xs opacity-50 flex items-center gap-2">
            <Search className="w-3 h-3" />
            <span>Smart Sort enabled: Keywords like "React", "Python", "Linux" will auto-categorize.</span>
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
    </div>
  );
};

export default App;
