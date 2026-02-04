import { useState, useEffect, useCallback } from 'react';

interface Section {
  id: string;
  label: string;
}

interface ScrollProgressResult {
  progress: number;
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export function useScrollProgress(sections: Section[]): ScrollProgressResult {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));

      // Find active section based on scroll position
      let currentSection = sections[0]?.id || '';
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Consider section active when its top is above the middle of viewport
          if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  }, []);

  return { progress, activeSection, scrollToSection };
}
