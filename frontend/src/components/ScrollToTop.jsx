import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-4 md:bottom-8 md:left-8 z-40 p-3 rounded-full bg-card border-2 border-border hover:border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
