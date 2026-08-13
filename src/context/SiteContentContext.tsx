import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Shape: { section: { key: { value: string, type: 'text' | 'image' } } }
type ContentField = { value: string; type: 'text' | 'image' };
type SiteContentMap = Record<string, Record<string, ContentField>>;

interface SiteContentContextType {
  content: SiteContentMap;
  isLoading: boolean;
  get: (section: string, key: string, fallback?: string) => string;
  update: (section: string, key: string, value: string) => Promise<boolean>;
  updateSection: (section: string, data: any) => void;
  refresh: () => void;
}

const SiteContentContext = createContext<SiteContentContextType>({
  content: {},
  isLoading: true,
  get: (_s, _k, fallback = '') => fallback,
  update: async () => false,
  updateSection: () => {},
  refresh: () => {},
});

export const useSiteContent = () => useContext(SiteContentContext);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [content, setContent] = useState<SiteContentMap>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = useCallback(() => {
    setIsLoading(true);
    // Append timestamp to bust aggressive browser cache that was serving stale /api/content
    fetch(`/api/content?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load site content:', err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Push an entire section update instantly into context (used by bulk save)
  const updateSection = (section: string, data: any) => {
    setContent(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Helper to read a value with a fallback
  const get = (section: string, key: string, fallback = '') => {
    return content?.[section]?.[key]?.value ?? fallback;
  };

  // Admin: update a single field via API
  const update = async (section: string, key: string, value: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/content/${section}/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) return false;
      const updatedSection = await res.json();
      // Use the returned section data from Django (correctly formatted {key: {value, type}})
      setContent(prev => ({
        ...prev,
        [section]: updatedSection,
      }));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <SiteContentContext.Provider value={{ content, isLoading, get, update, updateSection, refresh: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
};
