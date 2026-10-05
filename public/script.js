document.addEventListener("DOMContentLoaded", () => {
    // Entrance choreography for the splash screen.
    // (The 3D bottle runs its own intro + mouse rotation in js/perfume.js.)
    const tl = gsap.timeline();

    tl.from(".navbar", { y: -50, autoAlpha: 0, duration: 1, ease: "power3.out" })
      .from(".hero-title", { y: 50, autoAlpha: 0, duration: 1.2, ease: "power3.out" }, "-=0.5")
      .from(".hero-subtitle", { y: 30, autoAlpha: 0, duration: 1, ease: "power3.out" }, "-=0.8")
      .from(".hero-cta .btn", { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" }, "-=0.6")
      .from(".perfume-stage", { autoAlpha: 0, duration: 1.6, ease: "power2.out" }, "-=1.4")
      .from(".scroll-indicator", { autoAlpha: 0, y: -20, duration: 1, ease: "power2.out" }, "-=0.5");

    // Smooth scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(element => {
        observer.observe(element);
    });
});
