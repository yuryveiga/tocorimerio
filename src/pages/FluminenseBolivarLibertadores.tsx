import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

const TARGET_DATE = new Date('2026-05-19T21:30:00-03:00');
const BOOKING_URL = "https://tocorimerio.com/match/fluminense-vs-bolivar-2026-05-19";

const FluminenseBolivarLibertadores = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
    isLive: false
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = TARGET_DATE.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(prev => ({ ...prev, isLive: true }));
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
        isLive: false
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fadeEls = document.querySelectorAll('.fade-in');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });
    
    fadeEls.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="libertadores-page">
      <Helmet>
        <title>Tocorimerio — Fluminense vs Bolívar | Copa Libertadores 2026</title>
        <meta name="description" content="Live Fluminense vs Bolívar at Maracanã. MUST-WIN match for the Tricolor. Book your matchday package now." />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,400&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>

      <style dangerouslySetInnerHTML={{ __html: `
        .libertadores-page {
          --green: #1a7a2e;
          --green-light: #2ecc5a;
          --garnet: #8b0000;
          --garnet-light: #c0392b;
          --gold: #d4a843;
          --gold-light: #f0c84a;
          --cream: #f5f0e8;
          --dark: #0a0a0a;
          --dark-2: #111111;
          --dark-3: #1a1a1a;
          --mid: #2a2a2a;
          --text: #e8e0d0;
          --text-dim: #888880;
          
          background: var(--dark);
          color: var(--text);
          font-family: 'Barlow', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .libertadores-page * { margin: 0; padding: 0; box-sizing: border-box; }

        /* ── NAV ── */
        .libertadores-page nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 2.5rem;
          background: rgba(10,10,10,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212,168,67,0.2);
        }
        .libertadores-page .logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.7rem;
          letter-spacing: 0.12em;
          color: var(--gold);
        }
        .libertadores-page .logo span { color: var(--green-light); }
        .libertadores-page nav a {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-dim);
          text-decoration: none;
          transition: color 0.2s;
        }
        .libertadores-page nav a:hover { color: var(--gold); }
        .libertadores-page .nav-links { display: flex; gap: 2rem; align-items: center; }
        .libertadores-page .nav-cta {
          background: var(--green);
          color: #fff !important;
          padding: 0.5rem 1.2rem;
          border-radius: 2px;
        }
        .libertadores-page .nav-cta:hover { background: var(--green-light) !important; color: var(--dark) !important; }

        /* ── HERO ── */
        .libertadores-page .hero {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 6rem 1.5rem 4rem;
          overflow: hidden;
        }

        .libertadores-page .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(26,122,46,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(139,0,0,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 80% 60%, rgba(212,168,67,0.08) 0%, transparent 50%),
            linear-gradient(180deg, rgba(10,10,10,0.78) 0%, rgba(13,13,13,0.92) 100%),
            url('https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .libertadores-page .hero-bg::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 48px,
              rgba(255,255,255,0.02) 48px,
              rgba(255,255,255,0.02) 49px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 48px,
              rgba(255,255,255,0.015) 48px,
              rgba(255,255,255,0.015) 49px
            );
        }

        .libertadores-page .competition-badge {
          position: relative; z-index: 2;
          display: inline-flex; align-items: center; gap: 0.6rem;
          background: rgba(212,168,67,0.12);
          border: 1px solid rgba(212,168,67,0.35);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 2rem;
          animation: fadeDown 0.8s ease both;
        }
        .libertadores-page .badge-dot {
          width: 6px; height: 6px;
          background: var(--gold);
          border-radius: 50%;
          animation: pulse 1.5s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        .libertadores-page .match-header {
          position: relative; z-index: 2;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.8rem;
          animation: fadeDown 0.8s 0.15s ease both;
        }

        .libertadores-page .team-block { text-align: center; }
        .libertadores-page .team-logo {
          width: clamp(80px, 12vw, 140px);
          height: clamp(80px, 12vw, 140px);
          object-fit: contain;
          margin: 0 auto 0.8rem;
          display: block;
          filter: drop-shadow(0 6px 20px rgba(0,0,0,0.5));
        }
        .libertadores-page .team-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.5rem, 7vw, 5.5rem);
          line-height: 1;
          letter-spacing: 0.05em;
        }
        .libertadores-page .team-name.flu { color: var(--green-light); }
        .libertadores-page .team-name.blv { color: var(--cream); opacity: 0.85; }
        .libertadores-page .team-sub {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-top: 0.3rem;
        }

        .libertadores-page .vs-block {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.4rem;
        }
        .libertadores-page .vs-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          color: var(--gold);
          text-transform: uppercase;
        }
        .libertadores-page .vs-divider {
          width: 1px; height: 50px;
          background: linear-gradient(180deg, transparent, var(--gold), transparent);
        }

        .libertadores-page .hero-headline {
          position: relative; z-index: 2;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.2rem, 3.5vw, 2rem);
          letter-spacing: 0.12em;
          color: var(--text-dim);
          text-transform: uppercase;
          margin-bottom: 0.8rem;
          animation: fadeDown 0.8s 0.25s ease both;
        }

        .libertadores-page .match-meta {
          position: relative; z-index: 2;
          display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;
          margin-bottom: 3rem;
          animation: fadeDown 0.8s 0.35s ease both;
        }
        .libertadores-page .meta-item {
          display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
        }
        .libertadores-page .meta-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-dim);
        }
        .libertadores-page .meta-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--cream);
        }

        /* ── COUNTDOWN ── */
        .libertadores-page .countdown {
          position: relative; z-index: 2;
          display: flex; gap: 0.4rem;
          margin-bottom: 3rem;
          animation: fadeDown 0.8s 0.45s ease both;
        }
        .libertadores-page .cd-block {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 0.9rem 1.2rem;
          min-width: 72px;
        }
        .libertadores-page .cd-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem;
          line-height: 1;
          color: var(--gold-light);
        }
        .libertadores-page .cd-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-top: 0.2rem;
        }
        .libertadores-page .cd-sep {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem;
          color: var(--text-dim);
          align-self: flex-start;
          padding-top: 0.9rem;
          opacity: 0.4;
        }

        .libertadores-page .hero-ctas {
          position: relative; z-index: 2;
          display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
          animation: fadeDown 0.8s 0.55s ease both;
        }
        .libertadores-page .btn-primary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 1rem 2.5rem;
          background: var(--green);
          color: #fff;
          border: none; cursor: pointer; text-decoration: none;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .libertadores-page .btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
        }
        .libertadores-page .btn-primary:hover { background: var(--green-light); color: var(--dark); transform: translateY(-2px); }
        .libertadores-page .btn-secondary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 1rem 2rem;
          background: transparent;
          color: var(--text);
          border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer; text-decoration: none;
          transition: all 0.2s;
        }
        .libertadores-page .btn-secondary:hover { border-color: var(--gold); color: var(--gold); }

        .libertadores-page .scroll-hint {
          position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
          z-index: 2;
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          opacity: 0.4;
          animation: bounce 2s ease infinite;
        }
        .libertadores-page .scroll-hint span {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
        }
        .libertadores-page .scroll-arrow {
          width: 18px; height: 18px;
          border-right: 2px solid currentColor;
          border-bottom: 2px solid currentColor;
          transform: rotate(45deg);
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }

        /* ── URGENCY BANNER ── */
        .libertadores-page .urgency-bar {
          background: linear-gradient(90deg, var(--garnet) 0%, #a01010 50%, var(--garnet) 100%);
          padding: 0.8rem 1.5rem;
          text-align: center;
          display: flex; justify-content: center; align-items: center; gap: 1rem;
          flex-wrap: wrap;
        }
        .libertadores-page .urgency-bar p {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .libertadores-page .urgency-highlight { color: var(--gold-light); }

        /* ── PACKAGES ── */
        .libertadores-page section { padding: 5rem 2rem; }
        .libertadores-page .section-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.8rem;
        }
        .libertadores-page .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          letter-spacing: 0.06em;
          line-height: 1;
          margin-bottom: 1rem;
        }
        .libertadores-page .section-sub {
          font-size: 1rem;
          color: var(--text-dim);
          max-width: 520px;
          line-height: 1.65;
        }

        .libertadores-page .packages-section { background: var(--dark-2); }
        .libertadores-page .packages-header { text-align: center; margin-bottom: 3.5rem; }
        .libertadores-page .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 1.5px;
          max-width: 1100px; margin: 0 auto;
          background: rgba(255,255,255,0.06);
        }

        .libertadores-page .pkg-card {
          background: var(--dark-2);
          padding: 2.5rem 2rem;
          position: relative;
          transition: background 0.3s;
          cursor: default;
        }
        .libertadores-page .pkg-card:hover { background: var(--dark-3); }
        .libertadores-page .pkg-card.featured {
          background: linear-gradient(160deg, rgba(26,122,46,0.12) 0%, var(--dark-2) 60%);
          border-top: 3px solid var(--green-light);
        }
        .libertadores-page .pkg-badge {
          position: absolute; top: 0; right: 2rem;
          background: var(--green-light); color: var(--dark);
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.25rem 0.6rem;
          transform: translateY(-50%);
        }
        .libertadores-page .pkg-tier {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.5rem;
        }
        .libertadores-page .pkg-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          letter-spacing: 0.1em;
          color: var(--cream);
          margin-bottom: 0.3rem;
        }
        .libertadores-page .pkg-price {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--gold-light);
          line-height: 1;
          margin-bottom: 0.2rem;
        }
        .libertadores-page .pkg-price sub {
          font-size: 1rem;
          vertical-align: baseline;
          color: var(--text-dim);
        }
        .libertadores-page .pkg-per {
          font-size: 0.8rem;
          color: var(--text-dim);
          margin-bottom: 1.5rem;
        }
        .libertadores-page .pkg-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin-bottom: 1.5rem;
        }
        .libertadores-page .pkg-features { list-style: none; display: flex; flex-direction: column; gap: 0.7rem; }
        .libertadores-page .pkg-features li {
          display: flex; gap: 0.7rem; align-items: flex-start;
          font-size: 0.9rem; color: var(--text-dim); line-height: 1.4;
        }
        .libertadores-page .pkg-features li .check {
          color: var(--green-light);
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }
        .libertadores-page .pkg-features li.inactive { opacity: 0.3; text-decoration: line-through; }
        .libertadores-page .pkg-cta {
          display: block; width: 100%;
          margin-top: 2rem;
          padding: 0.85rem;
          text-align: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s;
        }
        .libertadores-page .pkg-cta.green { background: var(--green); color: #fff; }
        .libertadores-page .pkg-cta.green:hover { background: var(--green-light); color: var(--dark); }
        .libertadores-page .pkg-cta.outline { border: 1px solid rgba(255,255,255,0.2); color: var(--text); }
        .libertadores-page .pkg-cta.outline:hover { border-color: var(--gold); color: var(--gold); }

        /* ── WHAT'S INCLUDED ── */
        .libertadores-page .included-section { background: var(--dark); }
        .libertadores-page .included-layout {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 5rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .libertadores-page .included-layout { grid-template-columns: 1fr; gap: 3rem; }
        }
        .libertadores-page .included-list { display: flex; flex-direction: column; gap: 1.8rem; }
        .libertadores-page .included-item {
          display: flex; gap: 1.2rem; align-items: flex-start;
        }
        .libertadores-page .included-icon {
          width: 42px; height: 42px; flex-shrink: 0;
          background: rgba(46,204,90,0.1);
          border: 1px solid rgba(46,204,90,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
        }
        .libertadores-page .included-text h4 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--cream);
          margin-bottom: 0.3rem;
        }
        .libertadores-page .included-text p { font-size: 0.85rem; color: var(--text-dim); line-height: 1.55; }

        /* ── MATCHDAY URGENCY ── */
        .libertadores-page .stakes-section {
          background: linear-gradient(135deg, rgba(139,0,0,0.25) 0%, rgba(10,10,10,0.9) 50%, rgba(26,122,46,0.15) 100%),
                      var(--dark-3);
          text-align: center; padding: 5rem 2rem;
        }
        .libertadores-page .stakes-section .section-title { font-size: clamp(2.5rem, 6vw, 4.5rem); }
        .libertadores-page .stakes-lead {
          max-width: 660px; margin: 1.5rem auto 2.5rem;
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--text-dim);
        }
        .libertadores-page .stakes-lead strong { color: var(--gold-light); }

        /* ── REVIEWS ── */
        .libertadores-page .reviews-section { background: var(--dark-2); }
        .libertadores-page .reviews-header { text-align: center; margin-bottom: 3rem; }
        .libertadores-page .stars {
          color: var(--gold);
          font-size: 1.1rem;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }
        .libertadores-page .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5px; max-width: 1000px; margin: 0 auto;
          background: rgba(255,255,255,0.06);
        }
        .libertadores-page .review-card {
          background: var(--dark-2);
          padding: 1.8rem;
        }
        .libertadores-page .review-stars { color: var(--gold); font-size: 0.8rem; margin-bottom: 0.8rem; }
        .libertadores-page .review-text {
          font-size: 0.88rem;
          line-height: 1.65;
          color: var(--text-dim);
          margin-bottom: 1.2rem;
          font-style: italic;
        }
        .libertadores-page .review-author {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cream);
        }
        .libertadores-page .review-country { color: var(--text-dim); font-weight: 400; }
        .libertadores-page .review-badge {
          display: flex; align-items: center; gap: 1rem;
          justify-content: center; margin-top: 3rem;
        }
        .libertadores-page .review-badge .big-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 4rem; line-height: 1;
          color: var(--gold);
        }
        .libertadores-page .review-badge .badge-text p:first-child {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--text-dim);
        }
        .libertadores-page .review-badge .badge-text p:last-child {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem; color: var(--cream);
        }

        /* ── HOW IT WORKS ── */
        .libertadores-page .how-section { background: var(--dark); }
        .libertadores-page .steps-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0; max-width: 1000px; margin: 3rem auto 0;
        }
        .libertadores-page .step {
          padding: 2rem 1.5rem;
          border-left: 1px solid rgba(255,255,255,0.06);
          position: relative;
        }
        .libertadores-page .step:first-child { border-left: none; }
        .libertadores-page .step-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3.5rem; line-height: 1;
          color: rgba(212,168,67,0.15);
          position: absolute; top: 1rem; right: 1rem;
        }
        .libertadores-page .step-icon { font-size: 1.6rem; margin-bottom: 1rem; }
        .libertadores-page .step h4 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--cream); margin-bottom: 0.5rem;
        }
        .libertadores-page .step p { font-size: 0.83rem; color: var(--text-dim); line-height: 1.55; }

        /* ── FINAL CTA ── */
        .libertadores-page .final-cta {
          background:
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(26,122,46,0.2) 0%, transparent 60%),
            var(--dark-3);
          text-align: center;
          padding: 6rem 2rem;
        }
        .libertadores-page .final-cta .section-title { font-size: clamp(2.5rem, 6vw, 5rem); }
        .libertadores-page .cta-price-row {
          margin: 2rem 0 2.5rem;
          font-family: 'Barlow Condensed', sans-serif;
        }
        .libertadores-page .cta-price-row .from { font-size: 0.9rem; color: var(--text-dim); letter-spacing: 0.1em; }
        .libertadores-page .cta-price-row .amount {
          font-size: 3rem; font-weight: 700;
          color: var(--gold-light); line-height: 1;
        }
        .libertadores-page .cta-note { font-size: 0.8rem; color: var(--text-dim); margin-top: 1.5rem; }

        /* ── FOOTER ── */
        .libertadores-page footer {
          background: var(--dark);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 2.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .libertadores-page footer .logo { font-size: 1.3rem; }
        .libertadores-page .footer-links {
          display: flex; gap: 1.5rem; flex-wrap: wrap;
        }
        .libertadores-page .footer-links a {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-dim);
          text-decoration: none;
          transition: color 0.2s;
        }
        .libertadores-page .footer-links a:hover { color: var(--gold); }
        .libertadores-page .footer-copy {
          font-size: 0.75rem;
          color: var(--text-dim);
          opacity: 0.5;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .libertadores-page .fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .libertadores-page .fade-in.visible {
          opacity: 1;
          transform: none;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 600px) {
          .libertadores-page nav { padding: 0.9rem 1.2rem; }
          .libertadores-page .nav-links { gap: 1rem; }
          .libertadores-page .match-header { gap: 0.8rem; }
          .libertadores-page .countdown { gap: 0.3rem; }
          .libertadores-page .cd-block { min-width: 58px; padding: 0.7rem 0.8rem; }
          .libertadores-page .cd-num { font-size: 2rem; }
          .libertadores-page .step { border-left: none; border-top: 1px solid rgba(255,255,255,0.06); }
          .libertadores-page .step:first-child { border-top: none; }
        }
      `}} />

      {/* NAV */}
      <nav>
        <div className="logo">Tocori<span>merio</span></div>
        <div className="nav-links">
          <a href="#packages">Packages</a>
          <a href="#included">What's Included</a>
          <a href={BOOKING_URL} className="nav-cta">Book Now</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>

        <div className="competition-badge">
          <span className="badge-dot"></span>
          CONMEBOL Libertadores 2026 · Group C
        </div>

        <div className="match-header">
          <div className="team-block">
            <img src="https://crests.football-data.org/1765.png" alt="Fluminense FC" className="team-logo" loading="eager" />
            <div className="team-name flu">Fluminense</div>
            <div className="team-sub">Rio de Janeiro · BRA</div>
          </div>
          <div className="vs-block">
            <div className="vs-divider"></div>
            <div className="vs-text">VS</div>
            <div className="vs-divider"></div>
          </div>
          <div className="team-block">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Club_Bol%C3%ADvar_logo.svg/240px-Club_Bol%C3%ADvar_logo.svg.png" alt="Club Bolívar" className="team-logo" loading="eager" />
            <div className="team-name blv">Bolívar</div>
            <div className="team-sub">La Paz · BOL</div>
          </div>
        </div>

        <div className="hero-headline">Live at Maracanã — The Cathedral of Football</div>

        <div className="match-meta">
          <div className="meta-item">
            <span className="meta-label">Date</span>
            <span className="meta-value">Tue, May 19 · 2026</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Kickoff</span>
            <span className="meta-value">21:30 BRT</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Venue</span>
            <span className="meta-value">Estádio do Maracanã</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Stage</span>
            <span className="meta-value">Group C · Matchday 5</span>
          </div>
        </div>

        <div className="countdown" id="countdown">
          {timeLeft.isLive ? (
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.4rem", letterSpacing: "0.2em", color: "var(--gold)" }}>MATCH IS LIVE 🔴</p>
          ) : (
            <>
              <div className="cd-block"><div className="cd-num">{timeLeft.days}</div><div className="cd-label">Days</div></div>
              <div className="cd-sep">:</div>
              <div className="cd-block"><div className="cd-num">{timeLeft.hours}</div><div className="cd-label">Hours</div></div>
              <div className="cd-sep">:</div>
              <div className="cd-block"><div className="cd-num">{timeLeft.minutes}</div><div className="cd-label">Mins</div></div>
              <div className="cd-sep">:</div>
              <div className="cd-block"><div className="cd-num">{timeLeft.seconds}</div><div className="cd-label">Secs</div></div>
            </>
          )}
        </div>

        <div className="hero-ctas">
          <a href={BOOKING_URL} className="btn-primary">Get My Tickets</a>
          <a href="#included" className="btn-secondary">See What's Included</a>
        </div>

        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* URGENCY BAR */}
      <div className="urgency-bar">
        <p>🔴 <span className="urgency-highlight">MUST-WIN</span> — Fluminense need a <span className="urgency-highlight">3-goal margin</span> to advance. Don't miss the most intense Maracanã night of 2026.</p>
      </div>

      {/* MATCH VIDEO */}
      <section className="video-section fade-in" style={{ padding: "60px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="section-label">Watch</div>
          <div className="section-title">Feel the Maracanã Atmosphere</div>
        </div>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <iframe
            src="https://www.youtube.com/embed/cCyYRbMyBpk"
            title="Fluminense vs Bolívar — Maracanã"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </section>

      {/* PACKAGES */}
      <section className="packages-section" id="packages">
        <div className="packages-header fade-in">
          <div className="section-label">Choose Your Experience</div>
          <div className="section-title">Setores & Pacotes</div>
          <p className="section-sub" style={{ margin: "0 auto" }}>Setores oficiais do Maracanã. Todos os pacotes incluem ingresso, transfer ida e volta (Ipanema / Copa) e guia trilíngue.</p>
        </div>

        <div className="packages-grid fade-in">
          <div className="pkg-card featured">
            <div className="pkg-badge">Disponível</div>
            <div className="pkg-tier">Melhor Custo-Benefício</div>
            <div className="pkg-name">Regular Oeste Superior</div>
            <div className="pkg-price"><sub>R$ </sub>500</div>
            <div className="pkg-per">por pessoa</div>
            <div className="pkg-divider"></div>
            <ul className="pkg-features">
              <li><span className="check">✓</span> Setor Oeste Superior (sem lugar marcado)</li>
              <li><span className="check">✓</span> Sem cadastro biométrico</li>
              <li><span className="check">✓</span> Acesso pelo estacionamento (entrada rápida e segura)</li>
              <li><span className="check">✓</span> Transfer ida e volta (Ipanema / Copa)</li>
              <li><span className="check">✓</span> Guia trilíngue (PT / EN / ES)</li>
              <li><span className="check">✓</span> Staff de apoio durante todo o evento</li>
            </ul>
            <a href={BOOKING_URL} className="pkg-cta green">Reservar Oeste Superior</a>
          </div>

          <div className="pkg-card">
            <div className="pkg-tier">Sob Consulta</div>
            <div className="pkg-name">Regular Oeste Inferior</div>
            <div className="pkg-price"><sub>R$ </sub>550</div>
            <div className="pkg-per">por pessoa</div>
            <div className="pkg-divider"></div>
            <ul className="pkg-features">
              <li><span className="check">✓</span> Setor Oeste Inferior — assento colado ao campo</li>
              <li><span className="check">✓</span> Cadastro biométrico facial obrigatório (auxiliamos)</li>
              <li><span className="check">✓</span> Transfer ida e volta + guia trilíngue</li>
              <li className="inactive"><span className="check">—</span> Não inclui acesso pelo estacionamento</li>
            </ul>
            <a href={BOOKING_URL} className="pkg-cta outline">Consultar Disponibilidade</a>
          </div>

          <div className="pkg-card">
            <div className="pkg-tier">All-Inclusive</div>
            <div className="pkg-name">Regular + Maracanã Club</div>
            <div className="pkg-price"><sub>R$ </sub>750</div>
            <div className="pkg-per">por pessoa</div>
            <div className="pkg-divider"></div>
            <ul className="pkg-features">
              <li><span className="check">✓</span> Setor Oeste Superior + acesso ao Maracanã Club</li>
              <li><span className="check">✓</span> Comidas inclusas: petiscos, hot dogs, sanduíches, pratos quentes, sobremesas</li>
              <li><span className="check">✓</span> Bar aberto: água, Coca-Cola, mate e Chopp Brahma</li>
              <li><span className="check">✓</span> Estacionamento, transfer e guia trilíngue</li>
            </ul>
            <a href={BOOKING_URL} className="pkg-cta outline">Consultar Maracanã Club</a>
          </div>

          <div className="pkg-card">
            <div className="pkg-tier">Premium</div>
            <div className="pkg-name">Premium Maracanã Mais</div>
            <div className="pkg-price"><sub>R$ </sub>1.400</div>
            <div className="pkg-per">por pessoa</div>
            <div className="pkg-divider"></div>
            <ul className="pkg-features">
              <li><span className="check">✓</span> Hospitalidade premium ao lado do campo</li>
              <li><span className="check">✓</span> Lugar marcado colado ao gramado</li>
              <li><span className="check">✓</span> Cadastro biométrico facial obrigatório (auxiliamos)</li>
              <li><span className="check">✓</span> Comidas e bebidas inclusas (chopp à parte)</li>
              <li><span className="check">✓</span> Estacionamento, transfer e guia trilíngue</li>
            </ul>
            <a href={BOOKING_URL} className="pkg-cta outline">Consultar Premium</a>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="included-section" id="included">
        <div className="included-layout">
          <div className="fade-in">
            <div className="section-label">The Tocorimerio Way</div>
            <div className="section-title">Everything <br/>Handled.</div>
            <p className="section-sub">We've been taking travellers to Brazilian football since the very beginning. You just show up — we do the rest.</p>
          </div>
          <div className="included-list fade-in">
            <div className="included-item">
              <div className="included-icon">🎟️</div>
              <div className="included-text">
                <h4>Official Tickets</h4>
                <p>Guaranteed authentic, seated tickets — no third-party resellers or scalper risk. Your seat is confirmed before you book.</p>
              </div>
            </div>
            <div className="included-item">
              <div className="included-icon">🚌</div>
              <div className="included-text">
                <h4>Round-Trip Transfer</h4>
                <p>Comfortable, air-conditioned pickup from Ipanema or Copacabana. We navigate traffic so you don't have to.</p>
              </div>
            </div>
            <div className="included-item">
              <div className="included-icon">🗣️</div>
              <div className="included-text">
                <h4>English-Speaking Guide</h4>
                <p>A passionate local football fan walks you through the rituals, chants, history and madness of Flu at the Maracanã.</p>
              </div>
            </div>
            <div className="included-item">
              <div className="included-icon">🍺</div>
              <div className="included-text">
                <h4>Pre-Match Meetup</h4>
                <p>Join your group at a local bar near the stadium. Cold chopp, street food, and genuine tricolor atmosphere.</p>
              </div>
            </div>
            <div className="included-item">
              <div className="included-icon">🛡️</div>
              <div className="included-text">
                <h4>Safety & Peace of Mind</h4>
                <p>We know the city. From the moment you're picked up to when you're dropped back, you're in safe hands.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MATCH STAKES */}
      <section className="stakes-section fade-in">
        <div className="section-label">Why This Match Matters</div>
        <div className="section-title">A Night of High Stakes<br/>at the Maracanã</div>
        <p className="stakes-lead">
          Fluminense must win — and win <strong>big</strong>. After falling 2–0 in La Paz, the Tricolor need at least a <strong>3-goal margin</strong> to leapfrog Bolívar on head-to-head. With 78,000 fans roaring under the Maracanã lights, this is Copa Libertadores football at its most dramatic.
        </p>
        <a href={BOOKING_URL} className="btn-primary">I Want to Be There</a>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }} className="fade-in">
          <div className="section-label">Simple Process</div>
          <div className="section-title">How It Works</div>
        </div>
        <div className="steps-row fade-in">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-icon">📋</div>
            <h4>Book Online</h4>
            <p>Choose your package and complete checkout in under 3 minutes. Instant confirmation email.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-icon">📍</div>
            <h4>We Pick You Up</h4>
            <p>Your guide meets you at your hotel or designated Ipanema / Copacabana pickup point.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-icon">🍺</div>
            <h4>Pre-Match Vibes</h4>
            <p>Join the group for food, drinks and pre-match energy at a local favourite near the stadium.</p>
          </div>
          <div className="step">
            <div className="step-num">04</div>
            <div className="step-icon">⚽</div>
            <h4>The Beautiful Game</h4>
            <p>Experience Copa Libertadores football live inside the greatest stadium in South America.</p>
          </div>
          <div className="step">
            <div className="step-num">05</div>
            <div className="step-icon">🏠</div>
            <h4>Safe Return</h4>
            <p>We bring you back after the final whistle, relaxed and with memories to last a lifetime.</p>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="reviews-section">
        <div className="reviews-header fade-in">
          <div className="section-label">What People Say</div>
          <div className="section-title">Real Reviews</div>
          <div className="review-badge">
            <div className="big-num">5.0</div>
            <div className="badge-text">
              <p>Google Rating</p>
              <p>1,090+ verified reviews ★★★★★</p>
            </div>
          </div>
        </div>
        <div className="reviews-grid fade-in">
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">"Absolutely unforgettable. The guide knew everything — the history, the chants, where to sit for the best view. Flu scored twice in injury time and I cried. 10/10 would do again."</p>
            <div className="review-author">James H. <span className="review-country">· United Kingdom</span></div>
          </div>
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">"I was nervous about going alone as a solo traveller. The team made it so easy. I ended up befriending locals, shared beer and sang like I'd been a Flu fan for years."</p>
            <div className="review-author">Sofia M. <span className="review-country">· Germany</span></div>
          </div>
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">"The transfer was super comfortable and the guide was hilarious and incredibly knowledgeable. Seeing Maracanã at night lit up for a Libertadores match — there's nothing like it."</p>
            <div className="review-author">Daniel K. <span className="review-country">· United States</span></div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta fade-in">
        <div className="section-label">Limited Availability</div>
        <div className="section-title">Don't Miss<br/>May 19</div>
        <div className="cta-price-row">
          <div className="from">Packages from</div>
          <div className="amount">USD 79</div>
        </div>
        <a href={BOOKING_URL} className="btn-primary" style={{ fontSize: "1.1rem", padding: "1.1rem 3rem" }}>Secure My Spot Now</a>
        <p className="cta-note">Instant confirmation · Secure payment · Free cancellation up to 72h before</p>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="logo">Tocori<span>merio</span></div>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Contact</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
        <div className="footer-copy">© 2026 Tocorimerio.com · Rio de Janeiro</div>
      </footer>
    </div>
  );
};

export default FluminenseBolivarLibertadores;
