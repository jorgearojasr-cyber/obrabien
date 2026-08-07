"use client";
import { useRef, useState, useLayoutEffect } from "react";

// Sprint 25 (item 3): el contenido ahora es visible por defecto — la
// animación es solo una mejora progresiva, nunca un ocultamiento permanente.
// Antes, `visible` arrancaba en false y dependía de que el IntersectionObserver
// disparara; si no lo hacía (hydration lenta, error de JS, una herramienta que
// capture la página sin scrollear), la sección quedaba oculta para siempre
// aunque ocupara su espacio en el layout.
//
// Ahora: si el elemento YA está dentro del viewport en el momento en que el
// componente se monta, se muestra directo, sin animación. Solo si está más
// abajo (fuera del viewport) se anima al hacer scroll — y de todas formas hay
// un timeout de seguridad que lo revela igual aunque el observer nunca dispare.
export default function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const alreadyInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyInViewport) return; // nada que animar, se queda visible

    setVisible(false);
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);

    // Red de seguridad: nunca ocultar para siempre, aunque el observer falle.
    const timeout = setTimeout(() => setVisible(true), 2000);

    return () => { obs.disconnect(); clearTimeout(timeout); };
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(22px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}
