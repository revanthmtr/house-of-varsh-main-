import { useEffect, useCallback } from 'react';
import Lenis from 'lenis';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import Hero from './components/Hero';
import Header from './components/Header';
import LatestCollection from './components/LatestCollection';
import ShopByCollection from './components/ShopByCollection';
import BrandStory from './components/BrandStory';
import PhotoGallery from './components/PhotoGallery';
import VoicesMuses from './components/VoicesMuses';
import PrivateAtelier from './components/PrivateAtelier';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SiteContentProvider } from './context/SiteContentContext';

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  // High-performance, zero-latency springs
  const dotSpringConfig = { damping: 40, stiffness: 1000, mass: 0.04 };
  const cursorXSpring = useSpring(cursorX, dotSpringConfig);
  const cursorYSpring = useSpring(cursorY, dotSpringConfig);
  
  const ringSpringConfig = { damping: 28, stiffness: 480, mass: 0.08 };
  const ringXSpring = useSpring(ringX, ringSpringConfig);
  const ringYSpring = useSpring(ringY, ringSpringConfig);

  useEffect(() => {
    let isHoveringInteractive = false;
    const dotElem = document.querySelector('.cursor-dot');
    const ringElem = document.querySelector('.cursor-ring');

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 5);
      cursorY.set(e.clientY - 5);
      ringX.set(e.clientX - 18);
      ringY.set(e.clientY - 18);

      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest('a, button, input, textarea, select, [role="button"], .product-card, .fc-card, .tab, .wishlist-btn, .header-icon, .user-avatar-btn');
      
      if (isInteractive !== isHoveringInteractive) {
        isHoveringInteractive = isInteractive;
        if (isInteractive) {
          ringElem?.classList.add('cursor-hover');
          dotElem?.classList.add('cursor-hover');
        } else {
          ringElem?.classList.remove('cursor-hover');
          dotElem?.classList.remove('cursor-hover');
        }
      }
    };

    const handleMouseDown = () => {
      ringElem?.classList.add('cursor-active');
    };
    const handleMouseUp = () => {
      ringElem?.classList.remove('cursor-active');
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY, ringX, ringY]);

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ x: cursorXSpring, y: cursorYSpring }}
      />
      <motion.div
        className="cursor-ring"
        style={{ x: ringXSpring, y: ringYSpring }}
      />
    </>
  );
};


// ── Google One Tap — fires automatically for unauthenticated visitors ──────────
const GoogleOneTap = () => {
  const { user, login } = useAuth();

  const handleOneTapSuccess = useCallback(async (credentialResponse: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json().catch(() => null);
        if (res.ok && data?.token && data?.user) {
          login(data.token, data.user);
        }
      }
    } catch (err) {
      console.error('One Tap error:', err);
    }
  }, [login]);


  useGoogleOneTapLogin({
    onSuccess: handleOneTapSuccess,
    onError: () => console.log('One Tap dismissed'),
    disabled: !!user, // Don't show if already logged in
    cancel_on_tap_outside: false,
    prompt_parent_id: 'one-tap-container',
  });

  return <div id="one-tap-container" style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 50000 }} />;
};
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      syncTouch: true
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <AuthProvider>
      <SiteContentProvider>
        <CartProvider>
          <CustomCursor />
          <GoogleOneTap />
          <Header />
          <main>
            <Hero />
            <LatestCollection />
            <PhotoGallery />
            <ShopByCollection />
            <BrandStory />
            <VoicesMuses />
            <PrivateAtelier />
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </SiteContentProvider>
    </AuthProvider>
  );
}

export default App;
