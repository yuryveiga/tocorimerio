import{x as u,r as o,j as e}from"./vendor-8laeIfBe.js";import{H as v,g as i,E as j,i as N}from"./index-Bks20TxF.js";import"./supabase-BgQJfCCH.js";import"./icons-Cxz3YDqC.js";const k="/assets/bolivar-crest-BwZ7zaAR.png",p=new Date("2026-05-19T21:30:00-03:00"),a="https://tocorimerio.com/match/fluminense-vs-bolivar-2026-05-19",d="/fluminense-bolivar-libertadores",z=()=>{const c=u();o.useEffect(()=>{const s=setTimeout(()=>{c("/maracana-calendario")},3e3);return()=>clearTimeout(s)},[c]);const[t,m]=o.useState({days:"00",hours:"00",minutes:"00",seconds:"00",isLive:!1});return o.useEffect(()=>{const s=()=>{const n=new Date,r=p.getTime()-n.getTime();if(r<=0){m(b=>({...b,isLive:!0}));return}const g=Math.floor(r/864e5),h=Math.floor(r%864e5/36e5),x=Math.floor(r%36e5/6e4),f=Math.floor(r%6e4/1e3);m({days:String(g).padStart(2,"0"),hours:String(h).padStart(2,"0"),minutes:String(x).padStart(2,"0"),seconds:String(f).padStart(2,"0"),isLive:!1})};s();const l=setInterval(s,1e3);return()=>clearInterval(l)},[]),o.useEffect(()=>{const s=document.querySelectorAll(".fade-in"),l=new IntersectionObserver(n=>{n.forEach(r=>{r.isIntersecting&&r.target.classList.add("visible")})},{threshold:.12});return s.forEach(n=>l.observe(n)),()=>l.disconnect()},[]),e.jsxs("div",{className:"libertadores-page",children:[e.jsxs(v,{children:[e.jsx("title",{children:"Tocorimerio — Fluminense vs Bolívar | Copa Libertadores 2026"}),e.jsx("meta",{name:"description",content:"Live Fluminense vs Bolívar at Maracanã. MUST-WIN match for the Tricolor. Book your matchday package now."}),e.jsx("link",{rel:"canonical",href:i(d)}),e.jsx("meta",{property:"og:type",content:"website"}),e.jsx("meta",{property:"og:url",content:i(d)}),e.jsx("meta",{property:"og:title",content:"Fluminense vs Bolívar — Copa Libertadores 2026 | Maracanã Matchday"}),e.jsx("meta",{property:"og:description",content:"Live Fluminense vs Bolívar at Maracanã on May 19, 2026. Book your matchday package: tickets, transfer and bilingual guide."}),e.jsx("meta",{property:"og:image",content:"https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg"}),e.jsx("meta",{property:"og:site_name",content:"Tocorime Rio"}),e.jsx("meta",{name:"twitter:card",content:"summary_large_image"}),e.jsx("meta",{name:"twitter:title",content:"Fluminense vs Bolívar — Copa Libertadores 2026"}),e.jsx("meta",{name:"twitter:description",content:"Live Fluminense vs Bolívar at Maracanã. Matchday packages with tickets, transfer and bilingual guide."}),e.jsx("script",{type:"application/ld+json",children:JSON.stringify(j({name:"Fluminense vs Bolívar — Copa Libertadores 2026",description:"Copa Libertadores 2026 group stage match between Fluminense and Bolívar at Maracanã Stadium, Rio de Janeiro.",startDate:p.toISOString(),imageUrl:"https://lncimg.lance.com.br/cdn-cgi/image/width=1600,quality=80,fit=cover,format=webp/uploads/2016/10/19/5807e137e598d.jpeg",url:i(d),homeTeam:"Fluminense FC",awayTeam:"Club Bolívar",venueName:"Estádio do Maracanã",offerUrl:a}))}),e.jsx("script",{type:"application/ld+json",children:JSON.stringify(N([{name:"Home",url:i("/")},{name:"Maracanã Matchday",url:i("/passeio/maracana-matchday")},{name:"Fluminense vs Bolívar",url:i(d)}]))}),e.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,400&family=Barlow:wght@400;500&display=swap",rel:"stylesheet"})]}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5px;
          max-width: 1400px; margin: 0 auto;
          background: rgba(255,255,255,0.06);
        }
        @media (max-width: 1100px) {
          .libertadores-page .packages-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .libertadores-page .packages-grid { grid-template-columns: 1fr; }
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
        .libertadores-page footer,
        .libertadores-page footer * { text-align: center; }
        .libertadores-page footer ul { list-style: none; padding-left: 0; }
        .libertadores-page footer ul li,
        .libertadores-page footer .flex { justify-content: center; align-items: center; }
        .libertadores-page footer .flex.flex-col { align-items: center; }

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
      `}}),e.jsxs("nav",{children:[e.jsxs("div",{className:"logo",children:["Tocori",e.jsx("span",{children:"merio"})]}),e.jsxs("div",{className:"nav-links",children:[e.jsx("a",{href:"#packages",children:"Packages"}),e.jsx("a",{href:"#included",children:"What's Included"}),e.jsx("a",{href:a,className:"nav-cta",children:"Book Now"})]})]}),e.jsxs("section",{className:"hero",children:[e.jsx("div",{className:"hero-bg"}),e.jsxs("div",{className:"competition-badge",children:[e.jsx("span",{className:"badge-dot"}),"CONMEBOL Libertadores 2026 · Group C"]}),e.jsxs("div",{className:"match-header",children:[e.jsxs("div",{className:"team-block",children:[e.jsx("img",{src:"https://crests.football-data.org/1765.png",alt:"Fluminense FC",className:"team-logo",loading:"eager"}),e.jsx("div",{className:"team-name flu",children:"Fluminense"}),e.jsx("div",{className:"team-sub",children:"Rio de Janeiro · BRA"})]}),e.jsxs("div",{className:"vs-block",children:[e.jsx("div",{className:"vs-divider"}),e.jsx("div",{className:"vs-text",children:"VS"}),e.jsx("div",{className:"vs-divider"})]}),e.jsxs("div",{className:"team-block",children:[e.jsx("img",{src:k,alt:"Club Bolívar",className:"team-logo",loading:"eager"}),e.jsx("div",{className:"team-name blv",children:"Bolívar"}),e.jsx("div",{className:"team-sub",children:"La Paz · BOL"})]})]}),e.jsx("div",{className:"hero-headline",children:"Live at Maracanã — The Cathedral of Football"}),e.jsxs("div",{className:"match-meta",children:[e.jsxs("div",{className:"meta-item",children:[e.jsx("span",{className:"meta-label",children:"Date"}),e.jsx("span",{className:"meta-value",children:"Tue, May 19 · 2026"})]}),e.jsxs("div",{className:"meta-item",children:[e.jsx("span",{className:"meta-label",children:"Kickoff"}),e.jsx("span",{className:"meta-value",children:"21:30 BRT"})]}),e.jsxs("div",{className:"meta-item",children:[e.jsx("span",{className:"meta-label",children:"Venue"}),e.jsx("span",{className:"meta-value",children:"Estádio do Maracanã"})]}),e.jsxs("div",{className:"meta-item",children:[e.jsx("span",{className:"meta-label",children:"Stage"}),e.jsx("span",{className:"meta-value",children:"Group C · Matchday 5"})]})]}),e.jsx("div",{className:"countdown",id:"countdown",children:t.isLive?e.jsx("p",{style:{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.4rem",letterSpacing:"0.2em",color:"var(--gold)"},children:"MATCH IS LIVE 🔴"}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"cd-block",children:[e.jsx("div",{className:"cd-num",children:t.days}),e.jsx("div",{className:"cd-label",children:"Days"})]}),e.jsx("div",{className:"cd-sep",children:":"}),e.jsxs("div",{className:"cd-block",children:[e.jsx("div",{className:"cd-num",children:t.hours}),e.jsx("div",{className:"cd-label",children:"Hours"})]}),e.jsx("div",{className:"cd-sep",children:":"}),e.jsxs("div",{className:"cd-block",children:[e.jsx("div",{className:"cd-num",children:t.minutes}),e.jsx("div",{className:"cd-label",children:"Mins"})]}),e.jsx("div",{className:"cd-sep",children:":"}),e.jsxs("div",{className:"cd-block",children:[e.jsx("div",{className:"cd-num",children:t.seconds}),e.jsx("div",{className:"cd-label",children:"Secs"})]})]})}),e.jsxs("div",{className:"hero-ctas",children:[e.jsx("a",{href:a,className:"btn-primary",children:"Get My Tickets"}),e.jsx("a",{href:"#included",className:"btn-secondary",children:"See What's Included"})]}),e.jsxs("div",{className:"scroll-hint",children:[e.jsx("span",{children:"Scroll"}),e.jsx("div",{className:"scroll-arrow"})]})]}),e.jsx("div",{className:"urgency-bar",children:e.jsxs("p",{children:["🔴 ",e.jsx("span",{className:"urgency-highlight",children:"MUST-WIN"})," — Fluminense need a ",e.jsx("span",{className:"urgency-highlight",children:"3-goal margin"})," to advance. Don't miss the most intense Maracanã night of 2026."]})}),e.jsxs("section",{className:"video-section fade-in",style:{padding:"60px 20px",maxWidth:1100,margin:"0 auto"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:32},children:[e.jsx("div",{className:"section-label",children:"Watch"}),e.jsx("div",{className:"section-title",children:"Feel the Maracanã Atmosphere"})]}),e.jsx("div",{style:{position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,0.4)"},children:e.jsx("iframe",{src:"https://www.youtube.com/embed/cCyYRbMyBpk",title:"Fluminense vs Bolívar — Maracanã",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",allowFullScreen:!0,loading:"lazy",style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:0}})})]}),e.jsxs("section",{className:"packages-section",id:"packages",children:[e.jsxs("div",{className:"packages-header fade-in",children:[e.jsx("div",{className:"section-label",children:"Choose Your Experience"}),e.jsx("div",{className:"section-title",children:"Sectors & Packages"}),e.jsx("p",{className:"section-sub",style:{margin:"0 auto"},children:"Official Maracanã sectors. Every package includes the official ticket, round-trip transfer (Ipanema / Copacabana) and a trilingual guide."})]}),e.jsxs("div",{className:"packages-grid fade-in",children:[e.jsxs("div",{className:"pkg-card featured",children:[e.jsx("div",{className:"pkg-badge",children:"Available"}),e.jsx("div",{className:"pkg-tier",children:"Best Value"}),e.jsx("div",{className:"pkg-name",children:"Regular — West Upper"}),e.jsxs("div",{className:"pkg-price",children:[e.jsx("sub",{children:"R$ "}),"500"]}),e.jsx("div",{className:"pkg-per",children:"per person"}),e.jsx("div",{className:"pkg-divider"}),e.jsxs("ul",{className:"pkg-features",children:[e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Upper West Sector (unassigned seating)"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," No biometric registration required"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Parking lot access (faster, safer entry)"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Round-trip transfer (Ipanema / Copa)"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Trilingual guide (EN / PT / ES)"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Support staff throughout the event"]})]}),e.jsx("a",{href:a,className:"pkg-cta green",children:"Book West Upper"})]}),e.jsxs("div",{className:"pkg-card",children:[e.jsx("div",{className:"pkg-tier",children:"On Request"}),e.jsx("div",{className:"pkg-name",children:"Regular — West Lower"}),e.jsxs("div",{className:"pkg-price",children:[e.jsx("sub",{children:"R$ "}),"550"]}),e.jsx("div",{className:"pkg-per",children:"per person"}),e.jsx("div",{className:"pkg-divider"}),e.jsxs("ul",{className:"pkg-features",children:[e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Lower West Sector — seat right next to the pitch"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Biometric facial registration required (we assist)"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Round-trip transfer + trilingual guide"]}),e.jsxs("li",{className:"inactive",children:[e.jsx("span",{className:"check",children:"—"})," Does not include parking lot access"]})]}),e.jsx("a",{href:a,className:"pkg-cta outline",children:"Check Availability"})]}),e.jsxs("div",{className:"pkg-card",children:[e.jsx("div",{className:"pkg-tier",children:"All-Inclusive"}),e.jsx("div",{className:"pkg-name",children:"Regular + Maracanã Club"}),e.jsxs("div",{className:"pkg-price",children:[e.jsx("sub",{children:"R$ "}),"750"]}),e.jsx("div",{className:"pkg-per",children:"per person"}),e.jsx("div",{className:"pkg-divider"}),e.jsxs("ul",{className:"pkg-features",children:[e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Upper West Sector + Maracanã Club access"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Food included: appetizers, hot dogs, sandwiches, hot dishes, desserts"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Open bar: water, Coca-Cola, mate and Brahma draft beer"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Parking access, transfer and trilingual guide"]})]}),e.jsx("a",{href:a,className:"pkg-cta outline",children:"Check Maracanã Club"})]}),e.jsxs("div",{className:"pkg-card",children:[e.jsx("div",{className:"pkg-tier",children:"Premium"}),e.jsx("div",{className:"pkg-name",children:"Premium Maracanã Mais"}),e.jsxs("div",{className:"pkg-price",children:[e.jsx("sub",{children:"R$ "}),"1.400"]}),e.jsx("div",{className:"pkg-per",children:"per person"}),e.jsx("div",{className:"pkg-divider"}),e.jsxs("ul",{className:"pkg-features",children:[e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Premium pitch-side hospitality"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Assigned seat next to the field"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Biometric facial registration required (we assist)"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Food & drinks included (draft beer sold separately)"]}),e.jsxs("li",{children:[e.jsx("span",{className:"check",children:"✓"})," Parking access, transfer and trilingual guide"]})]}),e.jsx("a",{href:a,className:"pkg-cta outline",children:"Check Premium"})]})]})]}),e.jsx("section",{className:"included-section",id:"included",children:e.jsxs("div",{className:"included-layout",children:[e.jsxs("div",{className:"fade-in",children:[e.jsx("div",{className:"section-label",children:"The Tocorimerio Way"}),e.jsxs("div",{className:"section-title",children:["Everything ",e.jsx("br",{}),"Handled."]}),e.jsx("p",{className:"section-sub",children:"We've been taking travellers to Brazilian football since the very beginning. You just show up — we do the rest."})]}),e.jsxs("div",{className:"included-list fade-in",children:[e.jsxs("div",{className:"included-item",children:[e.jsx("div",{className:"included-icon",children:"🎟️"}),e.jsxs("div",{className:"included-text",children:[e.jsx("h4",{children:"Official Tickets"}),e.jsx("p",{children:"Guaranteed authentic, seated tickets — no third-party resellers or scalper risk. Your seat is confirmed before you book."})]})]}),e.jsxs("div",{className:"included-item",children:[e.jsx("div",{className:"included-icon",children:"🚌"}),e.jsxs("div",{className:"included-text",children:[e.jsx("h4",{children:"Round-Trip Transfer"}),e.jsx("p",{children:"Comfortable, air-conditioned pickup from Ipanema or Copacabana. We navigate traffic so you don't have to."})]})]}),e.jsxs("div",{className:"included-item",children:[e.jsx("div",{className:"included-icon",children:"🗣️"}),e.jsxs("div",{className:"included-text",children:[e.jsx("h4",{children:"English-Speaking Guide"}),e.jsx("p",{children:"A passionate local football fan walks you through the rituals, chants, history and madness of Flu at the Maracanã."})]})]}),e.jsxs("div",{className:"included-item",children:[e.jsx("div",{className:"included-icon",children:"🍺"}),e.jsxs("div",{className:"included-text",children:[e.jsx("h4",{children:"Pre-Match Meetup"}),e.jsx("p",{children:"Join your group at a local bar near the stadium. Cold chopp, street food, and genuine tricolor atmosphere."})]})]}),e.jsxs("div",{className:"included-item",children:[e.jsx("div",{className:"included-icon",children:"🛡️"}),e.jsxs("div",{className:"included-text",children:[e.jsx("h4",{children:"Safety & Peace of Mind"}),e.jsx("p",{children:"We know the city. From the moment you're picked up to when you're dropped back, you're in safe hands."})]})]})]})]})}),e.jsxs("section",{className:"stakes-section fade-in",children:[e.jsx("div",{className:"section-label",children:"Why This Match Matters"}),e.jsxs("div",{className:"section-title",children:["A Night of High Stakes",e.jsx("br",{}),"at the Maracanã"]}),e.jsxs("p",{className:"stakes-lead",children:["Fluminense must win — and win ",e.jsx("strong",{children:"big"}),". After falling 2–0 in La Paz, the Tricolor need at least a ",e.jsx("strong",{children:"3-goal margin"})," to leapfrog Bolívar on head-to-head. With 78,000 fans roaring under the Maracanã lights, this is Copa Libertadores football at its most dramatic."]}),e.jsx("a",{href:a,className:"btn-primary",children:"I Want to Be There"})]}),e.jsxs("section",{className:"how-section",children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"0.5rem"},className:"fade-in",children:[e.jsx("div",{className:"section-label",children:"Simple Process"}),e.jsx("div",{className:"section-title",children:"How It Works"})]}),e.jsxs("div",{className:"steps-row fade-in",children:[e.jsxs("div",{className:"step",children:[e.jsx("div",{className:"step-num",children:"01"}),e.jsx("div",{className:"step-icon",children:"📋"}),e.jsx("h4",{children:"Book Online"}),e.jsx("p",{children:"Choose your package and complete checkout in under 3 minutes. Instant confirmation email."})]}),e.jsxs("div",{className:"step",children:[e.jsx("div",{className:"step-num",children:"02"}),e.jsx("div",{className:"step-icon",children:"📍"}),e.jsx("h4",{children:"We Pick You Up"}),e.jsx("p",{children:"Your guide meets you at your hotel or designated Ipanema / Copacabana pickup point."})]}),e.jsxs("div",{className:"step",children:[e.jsx("div",{className:"step-num",children:"03"}),e.jsx("div",{className:"step-icon",children:"🍺"}),e.jsx("h4",{children:"Pre-Match Vibes"}),e.jsx("p",{children:"Join the group for food, drinks and pre-match energy at a local favourite near the stadium."})]}),e.jsxs("div",{className:"step",children:[e.jsx("div",{className:"step-num",children:"04"}),e.jsx("div",{className:"step-icon",children:"⚽"}),e.jsx("h4",{children:"The Beautiful Game"}),e.jsx("p",{children:"Experience Copa Libertadores football live inside the greatest stadium in South America."})]}),e.jsxs("div",{className:"step",children:[e.jsx("div",{className:"step-num",children:"05"}),e.jsx("div",{className:"step-icon",children:"🏠"}),e.jsx("h4",{children:"Safe Return"}),e.jsx("p",{children:"We bring you back after the final whistle, relaxed and with memories to last a lifetime."})]})]})]}),e.jsxs("section",{className:"reviews-section",children:[e.jsxs("div",{className:"reviews-header fade-in",children:[e.jsx("div",{className:"section-label",children:"What People Say"}),e.jsx("div",{className:"section-title",children:"Real Reviews"}),e.jsxs("div",{className:"review-badge",children:[e.jsx("div",{className:"big-num",children:"5.0"}),e.jsxs("div",{className:"badge-text",children:[e.jsx("p",{children:"Google Rating"}),e.jsx("p",{children:"1,090+ verified reviews ★★★★★"})]})]})]}),e.jsxs("div",{className:"reviews-grid fade-in",children:[e.jsxs("div",{className:"review-card",children:[e.jsx("div",{className:"review-stars",children:"★★★★★"}),e.jsx("p",{className:"review-text",children:'"Absolutely unforgettable. The guide knew everything — the history, the chants, where to sit for the best view. Flu scored twice in injury time and I cried. 10/10 would do again."'}),e.jsxs("div",{className:"review-author",children:["James H. ",e.jsx("span",{className:"review-country",children:"· United Kingdom"})]})]}),e.jsxs("div",{className:"review-card",children:[e.jsx("div",{className:"review-stars",children:"★★★★★"}),e.jsx("p",{className:"review-text",children:`"I was nervous about going alone as a solo traveller. The team made it so easy. I ended up befriending locals, shared beer and sang like I'd been a Flu fan for years."`}),e.jsxs("div",{className:"review-author",children:["Sofia M. ",e.jsx("span",{className:"review-country",children:"· Germany"})]})]}),e.jsxs("div",{className:"review-card",children:[e.jsx("div",{className:"review-stars",children:"★★★★★"}),e.jsx("p",{className:"review-text",children:`"The transfer was super comfortable and the guide was hilarious and incredibly knowledgeable. Seeing Maracanã at night lit up for a Libertadores match — there's nothing like it."`}),e.jsxs("div",{className:"review-author",children:["Daniel K. ",e.jsx("span",{className:"review-country",children:"· United States"})]})]})]})]}),e.jsxs("section",{className:"final-cta fade-in",children:[e.jsx("div",{className:"section-label",children:"Limited Availability"}),e.jsxs("div",{className:"section-title",children:["Don't Miss",e.jsx("br",{}),"May 19"]}),e.jsxs("div",{className:"cta-price-row",children:[e.jsx("div",{className:"from",children:"Packages from"}),e.jsx("div",{className:"amount",children:"USD 79"})]}),e.jsx("a",{href:a,className:"btn-primary",style:{fontSize:"1.1rem",padding:"1.1rem 3rem"},children:"Secure My Spot Now"}),e.jsx("p",{className:"cta-note",children:"Instant confirmation · Secure payment · Free cancellation up to 72h before"})]})]})};export{z as default};
