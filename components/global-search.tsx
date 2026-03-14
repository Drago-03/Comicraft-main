'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SearchResult {
  _id: string;
  title: string;
  author: {
    username?: string;
    auth0Id?: string;
  };
  coverImage?: string;
  slug?: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/comics/search/text?q=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.data || []);
          setIsOpen(true);
        } else {
          console.error('Failed to fetch search results');
          setResults([]);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleResultClick = (slug: string, id: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/story/${id}`); // Assuming /story/:slug is the path based on your route structure, if it's /story/:slug change this
  };

  return (
    <div className="relative w-full max-w-sm lg:w-[250px]" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
        <Input
          type="text"
          placeholder="Search comics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length < 2) setIsOpen(false);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          className="pl-9 pr-4 py-2 w-full bg-black/40 border border-white/10 rounded-full text-sm text-white focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:bg-black/60"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="max-h-[300px] overflow-y-auto w-full p-2 space-y-1 no-scrollbar">
            {results.map((result) => (
              <div
                key={result._id}
                onClick={() => handleResultClick(result.slug || result._id, result._id)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
              >
                {result.coverImage ? (
                  <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                    <Image
                      src={result.coverImage}
                      alt={result.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Search className="h-4 w-4 text-white/30" />
                  </div>
                )}
                <div className="flex flex-col min-w-0 overflow-hidden text-left flex-1">
                  <span className="text-sm font-medium text-white truncate w-full block">
                    {result.title}
                  </span>
                  <span className="text-xs text-white/50 truncate w-full block">
                    {result.author?.username || 'Unknown Author'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-white/5 bg-white/5 text-xs text-center text-white/40">
            Press Enter to search all results &rarr;
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full mt-2 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-4 text-center">
          <p className="text-sm text-white/60">No comics found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
