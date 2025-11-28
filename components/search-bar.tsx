"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Clock, Sparkles, Mic, MicOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

// Mock data removed - using API for search suggestions

const recentSearches = ["ChatGPT", "AI Art Tools", "Code Assistant"];
const trendingSearches = ["Midjourney", "AI Video", "Voice AI", "Image Generator"];

// Animated tool names for placeholder
const animatedToolNames = [
  "ChatGPT",
  "Midjourney",
  "GitHub Copilot",
  "DALL-E",
  "Notion AI",
  "Claude",
  "Jasper AI",
];

export function SearchBar({
  className,
  placeholder = "Search AI tools...",
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; category: string; trending: boolean }>>([]);
  const [animatedText, setAnimatedText] = useState("");
  const [toolIndex, setToolIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setQuery(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (query) return; // Don't animate when user is typing

    const currentToolName = animatedToolNames[toolIndex];
    
    const typingTimeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (animatedText.length < currentToolName.length) {
          setAnimatedText(currentToolName.slice(0, animatedText.length + 1));
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (animatedText.length > 0) {
          setAnimatedText(animatedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setToolIndex((prev) => (prev + 1) % animatedToolNames.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(typingTimeout);
  }, [animatedText, isDeleting, toolIndex, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search suggestions from API
  useEffect(() => {
    if (query.trim().length > 0) {
      const fetchSuggestions = async () => {
        try {
          const response = await fetch(`/api/tools?search=${encodeURIComponent(query)}&limit=5`);
          if (response.ok) {
            const data = await response.json();
            const formatted = (data.tools || []).map((tool: any) => ({
              id: tool.id,
              name: tool.name,
              category: tool.categories?.[0]?.name || "AI Tools",
              trending: tool.is_trending || false,
            }));
            setSuggestions(formatted);
      setIsOpen(true);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
      };
      
      // Debounce API calls
      const timeoutId = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/tools?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (toolName: string) => {
    setQuery(toolName);
    setIsOpen(false);
    router.push(`/tools?search=${encodeURIComponent(toolName)}`);
  };

  const toggleVoiceSearch = () => {
    if (!voiceSupported) {
      alert("Voice search is not supported in your browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start voice recognition:", error);
      }
    }
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <form onSubmit={handleSearch}>
        <div className="relative group">
          <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors z-10" />
          <Input
            type="text"
            placeholder={query ? placeholder : `Search for ${animatedText}${!isDeleting && animatedText.length < animatedToolNames[toolIndex].length ? '|' : ''}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length === 0 && setIsOpen(true)}
            autoFocus={autoFocus}
            className="pl-10 sm:pl-12 pr-20 sm:pr-24 h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200/60 dark:border-blue-800/60 rounded-lg shadow-lg focus:shadow-xl focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/30 dark:focus:border-blue-600/70 dark:focus:ring-blue-500/20 hover:border-blue-300/70 dark:hover:border-blue-700/70 transition-all duration-300"
          />
          
          {/* Voice Search Button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`absolute right-12 sm:right-14 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full transition-all duration-300 z-10 ${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50 animate-pulse scale-110"
                  : "text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:scale-105 hover:shadow-md"
              }`}
              title={isListening ? "Listening... Click to stop" : "Start voice search"}
            >
              {isListening ? (
                <div className="relative">
                  <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
                </div>
              ) : (
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          )}
          
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors z-10"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown with suggestions */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full max-w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Live search results */}
          {query.length > 0 && suggestions.length > 0 && (
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
                Search Results
              </h3>
              {suggestions.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleSuggestionClick(tool.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {tool.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {tool.category}
                    </div>
                  </div>
                  {tool.trending && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                      <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Trending
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.length > 0 && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <div className="text-slate-400 dark:text-slate-500 mb-2">
                <Search className="h-8 w-8 mx-auto mb-2" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No results found for "{query}"
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Try searching with different keywords
              </p>
            </div>
          )}

          {/* Recent searches */}
          {query.length === 0 && (
            <>
              <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </h3>
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left text-sm text-slate-700 dark:text-slate-300"
                  >
                    <Clock className="h-4 w-4 text-slate-400" />
                    {search}
                  </button>
                ))}
              </div>

              <div className="p-3">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Trending Searches
                </h3>
                <div className="flex flex-wrap gap-2 px-3">
                  {trendingSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(search)}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors text-sm text-slate-700 dark:text-slate-300"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

