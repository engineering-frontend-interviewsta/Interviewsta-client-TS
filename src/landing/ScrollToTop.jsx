import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // For React Router v6, use document.documentElement.scrollTo
    document.documentElement.scrollTo({
      top: 0,
      right: 0,
      behavior: "instant", // or "smooth" for animated scrolling
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
