document.addEventListener("DOMContentLoaded", () => {
    // Entrance choreography for the splash screen.
    // (The 3D bottle runs its own intro + mouse rotation in js/perfume.js.)
    const tl = gsap.timeline();

    tl.from(".navbar", { y: -50, opacity: 0, duration: 1, ease: "power3.out" })
      .from(".hero-title", { y: 50, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=0.5")
      .from(".hero-subtitle", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8")
      .from(".hero-cta .btn", { y: 20, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }, "-=0.6")
      .from(".perfume-stage", { opacity: 0, duration: 1.6, ease: "power2.out" }, "-=1.4")
      .from(".scroll-indicator", { opacity: 0, y: -20, duration: 1, ease: "power2.out" }, "-=0.5");
});
