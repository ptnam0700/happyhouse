'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LandingClient } from './LandingClient'

export function LandingPage() {
  // Scroll reveal + tab switcher
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)'
        }
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.lp-reveal').forEach(el => {
      const h = el as HTMLElement
      h.style.opacity = '0'
      h.style.transform = 'translateY(24px)'
      h.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
      observer.observe(el)
    })

    const handleScroll = () => {
      const header = document.getElementById('lp-header')
      if (header) header.style.boxShadow = window.scrollY > 10
        ? '0 4px 24px rgba(0,0,0,0.12)' : '0 2px 16px rgba(0,0,0,0.08)'
    }
    window.addEventListener('scroll', handleScroll)
    return () => { observer.disconnect(); window.removeEventListener('scroll', handleScroll) }
  }, [])

  const scrollToTest = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('test-entry')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <style>{`
        :root {
          --lp-red: #E8303A; --lp-red-dark: #C0222B;
          --lp-navy: #1A2744; --lp-gold: #F5A623;
          --lp-gray-50: #F9FAFB; --lp-gray-100: #F3F4F6;
          --lp-gray-200: #E5E7EB; --lp-gray-400: #9CA3AF;
          --lp-gray-600: #4B5563; --lp-gray-800: #1F2937;
          --lp-shadow: 0 4px 24px rgba(0,0,0,0.08);
          --lp-shadow-lg: 0 12px 48px rgba(0,0,0,0.14);
        }
        .lp-wrap { font-family: 'Be Vietnam Pro', sans-serif; color: #111827; background:#fff; line-height:1.6; overflow-x:hidden; }

        /* Topbar */
        .lp-topbar { background:var(--lp-navy); color:#ccc; font-size:12.5px; padding:6px 0; }
        .lp-topbar-inner { max-width:1200px; margin:auto; padding:0 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; }
        .lp-topbar a { color:#ccc; text-decoration:none; } .lp-topbar a:hover { color:#fff; }
        .lp-topbar-left { display:flex; gap:20px; flex-wrap:wrap; }
        .lp-topbar-right { display:flex; gap:16px; align-items:center; }
        .lp-tsocial { display:flex; gap:8px; }
        .lp-tsocial a { width:22px; height:22px; background:rgba(255,255,255,.12); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:11px; color:#fff; text-decoration:none; }
        .lp-tsocial a:hover { background:var(--lp-red); }

        /* Header */
        .lp-header { background:#fff; position:sticky; top:0; z-index:100; box-shadow:0 2px 16px rgba(0,0,0,.08); }
        .lp-header-inner { max-width:1200px; margin:auto; padding:0 24px; height:72px; display:flex; align-items:center; gap:32px; }
        .lp-logo { display:flex; align-items:center; gap:10px; text-decoration:none; flex-shrink:0; }
        .lp-logo-text { font-weight:800; font-size:20px; color:var(--lp-navy); line-height:1.1; }
        .lp-logo-sub { font-size:9px; font-weight:500; letter-spacing:1.5px; color:var(--lp-red); text-transform:uppercase; }
        .lp-nav { flex:1; display:flex; gap:0; }
        .lp-nav a { padding:0 14px; height:72px; display:flex; align-items:center; font-weight:600; font-size:13.5px; color:var(--lp-gray-800); text-decoration:none; border-bottom:3px solid transparent; transition:all .2s; white-space:nowrap; }
        .lp-nav a:hover,.lp-nav a.active { color:var(--lp-red); border-bottom-color:var(--lp-red); }
        .lp-nav .lp-badge { background:var(--lp-red); color:#fff; font-size:9px; padding:1px 5px; border-radius:20px; margin-left:4px; font-weight:700; }
        .lp-hactions { display:flex; gap:10px; align-items:center; margin-left:auto; }
        .lp-btn-outline { border:2px solid var(--lp-red); color:var(--lp-red); padding:8px 18px; border-radius:8px; font-weight:700; font-size:13px; text-decoration:none; transition:all .2s; white-space:nowrap; }
        .lp-btn-outline:hover { background:var(--lp-red); color:#fff; }
        .lp-btn-primary { background:var(--lp-red); color:#fff; padding:9px 20px; border-radius:8px; font-weight:700; font-size:13px; text-decoration:none; transition:all .2s; white-space:nowrap; border:none; cursor:pointer; display:inline-block; }
        .lp-btn-primary:hover { background:var(--lp-red-dark); transform:translateY(-1px); box-shadow:0 4px 12px rgba(232,48,58,.3); }

        /* Hero */
        .lp-hero { background:linear-gradient(135deg,#1A2744 0%,#1e3060 40%,#16305a 100%); position:relative; overflow:hidden; padding:80px 0 0; }
        .lp-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 80% at 80% 60%,rgba(232,48,58,.15) 0%,transparent 60%),radial-gradient(ellipse 40% 40% at 20% 30%,rgba(245,166,35,.08) 0%,transparent 50%); }
        .lp-hero-grid { max-width:1200px; margin:auto; padding:0 24px; display:grid; grid-template-columns:1fr 480px; gap:60px; align-items:end; position:relative; }
        .lp-hero-tag { display:inline-flex; align-items:center; gap:8px; background:rgba(232,48,58,.15); border:1px solid rgba(232,48,58,.4); border-radius:100px; padding:6px 16px; font-size:12px; font-weight:700; color:#FF8A8C; letter-spacing:.5px; margin-bottom:20px; text-transform:uppercase; }
        .lp-hero-tag span { width:6px; height:6px; background:var(--lp-red); border-radius:50%; animation:lp-blink 1.5s infinite; }
        @keyframes lp-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .lp-hero h1 { font-weight:900; font-size:54px; line-height:1.08; color:#fff; margin-bottom:20px; }
        .lp-hero h1 .lp-hl { color:var(--lp-red); position:relative; }
        .lp-hero h1 .lp-hl::after { content:''; position:absolute; bottom:-4px; left:0; right:0; height:3px; background:var(--lp-red); border-radius:2px; opacity:.4; }
        .lp-hero-desc { color:rgba(255,255,255,.72); font-size:16px; line-height:1.7; margin-bottom:32px; max-width:520px; }
        .lp-hero-actions { display:flex; gap:12px; margin-bottom:48px; flex-wrap:wrap; }
        .lp-btn-hp { background:var(--lp-red); color:#fff; padding:14px 28px; border-radius:10px; font-weight:700; font-size:15px; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:all .25s; box-shadow:0 8px 24px rgba(232,48,58,.35); border:none; cursor:pointer; }
        .lp-btn-hp:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(232,48,58,.45); }
        .lp-btn-hs { background:rgba(255,255,255,.1); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,.2); color:#fff; padding:14px 28px; border-radius:10px; font-weight:600; font-size:15px; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:all .25s; }
        .lp-btn-hs:hover { background:rgba(255,255,255,.18); }
        .lp-hero-stats { display:flex; gap:32px; flex-wrap:wrap; }
        .lp-stat-num { font-weight:800; font-size:30px; color:#fff; line-height:1; }
        .lp-stat-num span { color:var(--lp-red); }
        .lp-stat-label { font-size:12px; color:rgba(255,255,255,.5); font-weight:500; margin-top:2px; }
        .lp-hero-visual { position:relative; align-self:end; }
        .lp-hero-card { background:linear-gradient(135deg,#fff 0%,#F8FAFF 100%); border-radius:20px 20px 0 0; padding:32px; box-shadow:0 -8px 40px rgba(0,0,0,.3); }
        .lp-card-label { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--lp-red); margin-bottom:10px; }
        .lp-card-title { font-weight:800; font-size:18px; color:var(--lp-navy); margin-bottom:6px; }
        .lp-card-sub { font-size:13px; color:var(--lp-gray-600); margin-bottom:20px; }
        .lp-score-pills { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
        .lp-score-pill { background:var(--lp-gray-100); border-radius:100px; padding:6px 14px; font-size:13px; font-weight:700; color:var(--lp-navy); }
        .lp-score-pill.on { background:var(--lp-red); color:#fff; }
        .lp-meta { display:flex; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
        .lp-meta-chip { display:flex; align-items:center; gap:5px; font-size:12.5px; color:var(--lp-gray-600); }
        .lp-card-btn { width:100%; background:var(--lp-red); color:#fff; border:none; border-radius:10px; padding:13px; font-weight:700; font-size:14px; cursor:pointer; transition:all .2s; font-family:inherit; }
        .lp-card-btn:hover { background:var(--lp-red-dark); }
        .lp-fb { position:absolute; background:#fff; border-radius:12px; padding:10px 14px; box-shadow:0 8px 24px rgba(0,0,0,.15); display:flex; align-items:center; gap:10px; }
        .lp-fb-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .lp-fb-text { font-size:11px; color:var(--lp-gray-600); }
        .lp-fb-val { font-weight:800; font-size:15px; color:var(--lp-navy); line-height:1; }
        .lp-fb1 { top:-32px; left:-24px; } .lp-fb2 { top:-16px; right:-16px; }

        /* Ticker */
        .lp-ticker { background:var(--lp-red); padding:10px 0; overflow:hidden; }
        .lp-ticker-inner { display:flex; animation:lp-ticker 35s linear infinite; white-space:nowrap; width:max-content; }
        @keyframes lp-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .lp-ticker-item { padding:0 32px; font-weight:700; font-size:13px; color:rgba(255,255,255,.9); letter-spacing:.3px; display:inline-flex; align-items:center; gap:12px; }
        .lp-ticker-item::after { content:'★'; color:rgba(255,255,255,.4); }

        /* Shared */
        .lp-section { padding:72px 0; }
        .lp-container { max-width:1200px; margin:auto; padding:0 24px; }
        .lp-sec-head { text-align:center; margin-bottom:52px; }
        .lp-sec-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(232,48,58,.08); border:1px solid rgba(232,48,58,.2); border-radius:100px; padding:5px 14px; font-size:11.5px; font-weight:700; color:var(--lp-red); letter-spacing:.8px; text-transform:uppercase; margin-bottom:14px; }
        .lp-sec-title { font-weight:800; font-size:34px; color:var(--lp-navy); line-height:1.2; margin-bottom:12px; }
        .lp-sec-desc { color:var(--lp-gray-600); font-size:15.5px; max-width:580px; margin:auto; line-height:1.65; }

        /* Partners */
        .lp-partners { padding:48px 0; border-top:1px solid var(--lp-gray-200); border-bottom:1px solid var(--lp-gray-200); }
        .lp-partners-label { text-align:center; font-size:12px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--lp-gray-400); margin-bottom:24px; }
        .lp-partners-logos { display:flex; align-items:center; justify-content:center; gap:40px; flex-wrap:wrap; }
        .lp-plogo { font-weight:800; font-size:16px; color:var(--lp-gray-400); letter-spacing:-.5px; cursor:default; transition:color .2s; }
        .lp-plogo:hover { color:var(--lp-red); }

        /* Why */
        .lp-why { background:var(--lp-gray-50); }
        .lp-why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
        .lp-why-card { background:#fff; border-radius:12px; padding:28px 24px; text-align:center; border:1px solid var(--lp-gray-200); transition:all .3s; position:relative; overflow:hidden; }
        .lp-why-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--lp-red); transform:scaleX(0); transition:transform .3s; }
        .lp-why-card:hover { box-shadow:var(--lp-shadow-lg); transform:translateY(-4px); }
        .lp-why-card:hover::before { transform:scaleX(1); }
        .lp-why-icon { width:60px; height:60px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:28px; margin:0 auto 16px; }
        .lp-why-num { font-weight:900; font-size:38px; color:var(--lp-red); line-height:1; margin-bottom:4px; }
        .lp-why-label { font-weight:700; font-size:15px; color:var(--lp-navy); margin-bottom:8px; }
        .lp-why-desc { font-size:13px; color:var(--lp-gray-600); line-height:1.6; }

        /* Courses */
        .lp-tabs { display:flex; gap:8px; justify-content:center; margin-bottom:40px; flex-wrap:wrap; }
        .lp-tab { padding:9px 22px; border-radius:100px; border:2px solid var(--lp-gray-200); background:#fff; font-weight:700; font-size:13px; color:var(--lp-gray-600); cursor:pointer; transition:all .2s; font-family:inherit; }
        .lp-tab:hover { border-color:var(--lp-red); color:var(--lp-red); }
        .lp-tab.on { background:var(--lp-red); border-color:var(--lp-red); color:#fff; }
        .lp-courses-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .lp-course-card { background:#fff; border-radius:16px; border:1px solid var(--lp-gray-200); overflow:hidden; transition:all .3s; cursor:pointer; }
        .lp-course-card:hover { box-shadow:var(--lp-shadow-lg); transform:translateY(-4px); }
        .lp-course-thumb { height:190px; position:relative; display:flex; align-items:center; justify-content:center; font-size:60px; }
        .lp-cbadge { position:absolute; top:14px; left:14px; padding:4px 12px; border-radius:100px; font-size:11px; font-weight:800; letter-spacing:.5px; text-transform:uppercase; }
        .lp-badge-hot { background:var(--lp-red); color:#fff; }
        .lp-badge-new { background:var(--lp-gold); color:#fff; }
        .lp-badge-sale { background:#10B981; color:#fff; }
        .lp-clevel { position:absolute; top:14px; right:14px; background:rgba(255,255,255,.95); border-radius:100px; padding:4px 12px; font-size:11px; font-weight:700; color:var(--lp-navy); }
        .lp-cbody { padding:20px; }
        .lp-ccategory { font-size:11px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:var(--lp-red); margin-bottom:6px; }
        .lp-cname { font-weight:800; font-size:16px; color:var(--lp-navy); margin-bottom:8px; line-height:1.3; }
        .lp-cdesc { font-size:13px; color:var(--lp-gray-600); line-height:1.5; margin-bottom:14px; }
        .lp-cinfo { display:flex; gap:14px; margin-bottom:14px; padding-top:12px; border-top:1px solid var(--lp-gray-100); flex-wrap:wrap; }
        .lp-ci { display:flex; align-items:center; gap:4px; font-size:12.5px; color:var(--lp-gray-600); font-weight:500; }
        .lp-cfooter { display:flex; justify-content:space-between; align-items:center; }
        .lp-cprice { font-weight:800; font-size:20px; color:var(--lp-red); }
        .lp-cprice-old { font-size:13px; color:var(--lp-gray-400); text-decoration:line-through; font-weight:500; margin-bottom:-2px; }
        .lp-enroll-sm { background:var(--lp-red); color:#fff; padding:9px 18px; border-radius:8px; font-weight:700; font-size:13px; text-decoration:none; transition:all .2s; border:none; cursor:pointer; font-family:inherit; }
        .lp-enroll-sm:hover { background:var(--lp-red-dark); }

        /* Teachers */
        .lp-teachers { background:var(--lp-gray-50); }
        .lp-teachers-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
        .lp-teacher-card { background:#fff; border-radius:16px; overflow:hidden; border:1px solid var(--lp-gray-200); transition:all .3s; text-align:center; }
        .lp-teacher-card:hover { box-shadow:var(--lp-shadow-lg); transform:translateY(-4px); }
        .lp-teacher-ava { height:200px; display:flex; align-items:center; justify-content:center; font-size:80px; position:relative; }
        .lp-teacher-score { position:absolute; bottom:12px; right:12px; background:var(--lp-red); color:#fff; font-weight:800; font-size:13px; padding:4px 12px; border-radius:100px; }
        .lp-tbody { padding:18px 16px; }
        .lp-tname { font-weight:800; font-size:16px; color:var(--lp-navy); margin-bottom:4px; }
        .lp-trole { font-size:12.5px; color:var(--lp-gray-600); margin-bottom:10px; }
        .lp-ttags { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; margin-bottom:12px; }
        .lp-ttag { background:var(--lp-gray-100); border-radius:100px; padding:3px 10px; font-size:11px; font-weight:600; color:var(--lp-gray-600); }
        .lp-tstats { display:flex; gap:0; border-top:1px solid var(--lp-gray-100); }
        .lp-tstat { flex:1; padding:10px 0; text-align:center; }
        .lp-tstat:not(:last-child) { border-right:1px solid var(--lp-gray-100); }
        .lp-tstat-val { font-weight:800; font-size:15px; color:var(--lp-navy); }
        .lp-tstat-label { font-size:10px; color:var(--lp-gray-400); }

        /* Results */
        .lp-results { background:linear-gradient(135deg,#1A2744 0%,#16305a 100%); position:relative; overflow:hidden; }
        .lp-results::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 70% at 90% 50%,rgba(232,48,58,.12) 0%,transparent 60%); }
        .lp-results .lp-sec-title { color:#fff; }
        .lp-results .lp-sec-desc { color:rgba(255,255,255,.6); }
        .lp-results .lp-sec-tag { background:rgba(232,48,58,.2); border-color:rgba(232,48,58,.4); }
        .lp-results-grid { display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center; position:relative; }
        .lp-score-show { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .lp-score-card { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:20px 16px; text-align:center; transition:all .3s; }
        .lp-score-card:hover { background:rgba(232,48,58,.15); border-color:rgba(232,48,58,.3); }
        .lp-score-card.feat { background:var(--lp-red); border-color:var(--lp-red); }
        .lp-sc-stu { font-size:26px; margin-bottom:6px; }
        .lp-sc-name { font-weight:700; font-size:13px; color:rgba(255,255,255,.9); margin-bottom:2px; }
        .lp-sc-score { font-weight:900; font-size:30px; color:#fff; }
        .lp-sc-score span { font-size:14px; font-weight:500; opacity:.7; }
        .lp-sc-skill { font-size:11px; color:rgba(255,255,255,.5); }
        .lp-sc-skill.feat { color:rgba(255,255,255,.85); }
        .lp-rpoints { display:flex; flex-direction:column; gap:20px; margin-top:32px; }
        .lp-rpoint { display:flex; gap:16px; align-items:flex-start; }
        .lp-rp-icon { width:44px; height:44px; background:rgba(232,48,58,.15); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .lp-rp-title { font-weight:700; font-size:15px; color:#fff; margin-bottom:4px; }
        .lp-rp-desc { font-size:13px; color:rgba(255,255,255,.55); line-height:1.55; }

        /* Testimonials */
        .lp-testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .lp-testi-card { background:#fff; border-radius:16px; border:1px solid var(--lp-gray-200); padding:24px; transition:all .3s; position:relative; }
        .lp-testi-card:hover { box-shadow:var(--lp-shadow-lg); }
        .lp-testi-quote { font-size:48px; color:var(--lp-red); line-height:.6; margin-bottom:14px; font-family:Georgia,serif; opacity:.3; }
        .lp-testi-text { font-size:14px; color:var(--lp-gray-800); line-height:1.65; margin-bottom:20px; font-style:italic; }
        .lp-testi-author { display:flex; gap:12px; align-items:center; }
        .lp-testi-ava { width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
        .lp-testi-name { font-weight:700; font-size:14px; color:var(--lp-navy); }
        .lp-testi-info { font-size:12px; color:var(--lp-gray-600); }
        .lp-testi-score { position:absolute; top:20px; right:20px; background:var(--lp-red); color:#fff; font-weight:800; font-size:14px; padding:4px 12px; border-radius:100px; }
        .lp-stars { color:#F5A623; font-size:13px; }

        /* Blog */
        .lp-blog { background:var(--lp-gray-50); }
        .lp-blog-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:24px; }
        .lp-blog-card { background:#fff; border-radius:16px; overflow:hidden; border:1px solid var(--lp-gray-200); transition:all .3s; cursor:pointer; }
        .lp-blog-card:hover { box-shadow:var(--lp-shadow-lg); }
        .lp-blog-thumb { height:200px; display:flex; align-items:center; justify-content:center; font-size:60px; position:relative; }
        .lp-blog-card.feat .lp-blog-thumb { height:260px; }
        .lp-blog-tag { position:absolute; bottom:12px; left:12px; background:var(--lp-red); color:#fff; font-size:10.5px; font-weight:700; padding:3px 10px; border-radius:100px; letter-spacing:.5px; text-transform:uppercase; }
        .lp-blog-body { padding:20px; }
        .lp-blog-date { font-size:11.5px; color:var(--lp-gray-400); margin-bottom:8px; }
        .lp-blog-title { font-weight:700; font-size:15px; color:var(--lp-navy); margin-bottom:8px; line-height:1.35; }
        .lp-blog-card.feat .lp-blog-title { font-size:18px; }
        .lp-blog-excerpt { font-size:13px; color:var(--lp-gray-600); line-height:1.55; }
        .lp-blog-more { display:inline-flex; align-items:center; gap:4px; font-size:13px; font-weight:700; color:var(--lp-red); margin-top:12px; text-decoration:none; }

        /* CTA band */
        .lp-cta-band { background:linear-gradient(135deg,var(--lp-red) 0%,#C0222B 100%); padding:64px 0; text-align:center; position:relative; overflow:hidden; }
        .lp-cta-band::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 100% at 10% 50%,rgba(255,255,255,.05) 0%,transparent 60%),radial-gradient(ellipse 40% 80% at 90% 50%,rgba(0,0,0,.1) 0%,transparent 60%); }
        .lp-cta-band h2 { font-weight:900; font-size:40px; color:#fff; margin-bottom:14px; position:relative; }
        .lp-cta-band p { color:rgba(255,255,255,.8); font-size:16px; margin-bottom:32px; position:relative; }
        .lp-cta-actions { display:flex; gap:12px; justify-content:center; position:relative; flex-wrap:wrap; }
        .lp-btn-cta-w { background:#fff; color:var(--lp-red); padding:14px 32px; border-radius:10px; font-weight:700; font-size:15px; text-decoration:none; transition:all .2s; box-shadow:0 8px 24px rgba(0,0,0,.15); }
        .lp-btn-cta-w:hover { transform:translateY(-2px); }
        .lp-btn-cta-o { background:transparent; color:#fff; border:2px solid rgba(255,255,255,.6); padding:14px 32px; border-radius:10px; font-weight:700; font-size:15px; text-decoration:none; transition:all .2s; }
        .lp-btn-cta-o:hover { border-color:#fff; background:rgba(255,255,255,.1); }

        /* Footer */
        .lp-footer { background:#0D1117; color:rgba(255,255,255,.6); padding:64px 0 0; }
        .lp-footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; margin-bottom:48px; }
        .lp-footer-desc { font-size:13.5px; line-height:1.7; margin-bottom:20px; margin-top:16px; }
        .lp-fci { display:flex; align-items:flex-start; gap:10px; font-size:13px; margin-bottom:10px; }
        .lp-footer-col h4 { font-weight:700; font-size:14px; color:#fff; margin-bottom:16px; letter-spacing:.3px; }
        .lp-flinks { display:flex; flex-direction:column; gap:10px; }
        .lp-flinks a { font-size:13.5px; color:rgba(255,255,255,.55); text-decoration:none; transition:color .2s; display:flex; align-items:center; gap:6px; }
        .lp-flinks a::before { content:'→'; font-size:10px; opacity:.5; }
        .lp-flinks a:hover { color:#fff; }
        .lp-footer-bottom { border-top:1px solid rgba(255,255,255,.08); padding:20px 0; display:flex; justify-content:space-between; align-items:center; font-size:12.5px; flex-wrap:wrap; gap:12px; }
        .lp-fsocial { display:flex; gap:8px; }
        .lp-fsocial a { width:34px; height:34px; background:rgba(255,255,255,.08); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; color:rgba(255,255,255,.6); text-decoration:none; transition:all .2s; }
        .lp-fsocial a:hover { background:var(--lp-red); color:#fff; }

        /* Sticky CTA */
        .lp-sticky { position:fixed; bottom:24px; right:24px; z-index:200; display:flex; flex-direction:column; gap:10px; align-items:flex-end; }
        .lp-sticky-btn { width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,.2); transition:all .2s; text-decoration:none; border:none; font-family:inherit; }
        .lp-sticky-btn:hover { transform:scale(1.1); }
        .lp-sticky-btn.ph { background:#25D366; color:#fff; }
        .lp-sticky-btn.za { background:#0068FF; color:#fff; }
        .lp-sticky-btn.tp { background:var(--lp-red); color:#fff; }
        .lp-sticky-row { position:relative; display:flex; align-items:center; }
        .lp-sticky-label { background:rgba(0,0,0,.8); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:100px; opacity:0; pointer-events:none; white-space:nowrap; position:absolute; right:58px; top:50%; transform:translateY(-50%) translateX(-8px); transition:all .2s; }
        .lp-sticky-row:hover .lp-sticky-label { opacity:1; transform:translateY(-50%) translateX(0); }

        /* Responsive */
        @media(max-width:900px) {
          .lp-hero-grid { grid-template-columns:1fr; }
          .lp-hero-visual { display:none; }
          .lp-hero h1 { font-size:36px; }
          .lp-why-grid,.lp-teachers-grid { grid-template-columns:repeat(2,1fr); }
          .lp-courses-grid { grid-template-columns:1fr 1fr; }
          .lp-results-grid,.lp-testi-grid { grid-template-columns:1fr; }
          .lp-blog-grid { grid-template-columns:1fr; }
          .lp-footer-grid { grid-template-columns:1fr 1fr; }
          .lp-nav { display:none; }
        }
        @media(max-width:600px) {
          .lp-why-grid,.lp-courses-grid,.lp-teachers-grid,.lp-footer-grid { grid-template-columns:1fr; }
          .lp-cta-band h2 { font-size:28px; }
        }
      `}</style>

      <div className="lp-wrap">

        {/* Topbar */}
        <div className="lp-topbar">
          <div className="lp-topbar-inner">
            <div className="lp-topbar-left">
              <span>📞 Hotline: <a href="tel:0901234567">0901 234 567</a></span>
              <span>✉️ <a href="mailto:hello@happyhouseielts.com">hello@happyhouseielts.com</a></span>
              <span>⏰ Thứ 2 – Chủ nhật: 8:00 – 21:00</span>
            </div>
            <div className="lp-topbar-right">
              <Link href="/portal/login">Đăng nhập</Link>
              <a href="#test-entry" onClick={scrollToTest}>Kiểm tra ngay</a>
              <div className="lp-tsocial">
                <a href="#" title="Facebook">f</a>
                <a href="#" title="YouTube">▶</a>
                <a href="#" title="TikTok">♪</a>
                <a href="#" title="Zalo">Z</a>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="lp-header" id="lp-header">
          <div className="lp-header-inner">
            <a className="lp-logo" href="/">
              <Image src="/happy_house_sun.png" alt="HappyHouse" width={44} height={44} style={{ borderRadius: 8, objectFit: 'contain' }} />
              <div>
                <div className="lp-logo-text">HappyHouse</div>
                <div className="lp-logo-sub">English Center</div>
              </div>
            </a>
            <nav className="lp-nav">
              <a href="/" className="active">Trang chủ</a>
              <a href="#courses">Khoá học <span className="lp-badge">HOT</span></a>
              <a href="#teachers">Giáo viên</a>
              <a href="#results">Kết quả</a>
              <a href="/test">Thi thử IELTS</a>
              <a href="#blog">Blog</a>
            </nav>
            <div className="lp-hactions">
              <a className="lp-btn-outline" href="/test">Thi thử miễn phí</a>
              <a className="lp-btn-primary" href="#test-entry" onClick={scrollToTest}>Đăng ký ngay</a>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-hero-tag"><span></span>Trung tâm Anh ngữ IELTS chuyên sâu</div>
              <h1>Chinh phục <span className="lp-hl">IELTS</span><br />cùng đội ngũ<br />8.5+ HappyHouse</h1>
              <p className="lp-hero-desc">
                HappyHouse đồng hành cùng hàng nghìn học viên trên hành trình IELTS. Phương pháp học hiệu quả, giáo viên tận tâm và lộ trình cá nhân hoá cho từng mục tiêu.
              </p>
              <div className="lp-hero-actions">
                <a className="lp-btn-hp" href="#test-entry" onClick={scrollToTest}>✦ Kiểm tra trình độ miễn phí</a>
                <a className="lp-btn-hs" href="#courses">▶ Xem các khoá học</a>
              </div>
              <div className="lp-hero-stats">
                <div><div className="lp-stat-num">5<span>+</span></div><div className="lp-stat-label">Năm kinh nghiệm</div></div>
                <div><div className="lp-stat-num">2<span>K+</span></div><div className="lp-stat-label">Học viên</div></div>
                <div><div className="lp-stat-num">8.5<span>★</span></div><div className="lp-stat-label">IELTS giáo viên</div></div>
                <div><div className="lp-stat-num">4.9<span>/5</span></div><div className="lp-stat-label">Đánh giá học viên</div></div>
              </div>
            </div>
            <div className="lp-hero-visual">
              <div className="lp-fb lp-fb1">
                <div className="lp-fb-icon" style={{ background: '#FEF3C7' }}>🏆</div>
                <div><div className="lp-fb-text">Học viên xuất sắc</div><div className="lp-fb-val">IELTS 8.0</div></div>
              </div>
              <div className="lp-fb lp-fb2">
                <div className="lp-fb-icon" style={{ background: '#DCFCE7' }}>📈</div>
                <div><div className="lp-fb-text">Tỷ lệ đạt mục tiêu</div><div className="lp-fb-val">92%</div></div>
              </div>
              <div className="lp-hero-card">
                <div className="lp-card-label">🔥 Khoá học phổ biến nhất</div>
                <div className="lp-card-title">IELTS Foundation to Advanced</div>
                <div className="lp-card-sub">Từ 4.5 lên 7.0+ trong 6 tháng · Online & Offline</div>
                <div className="lp-score-pills">
                  <div className="lp-score-pill on">Target 6.5</div>
                  <div className="lp-score-pill">Target 7.0</div>
                  <div className="lp-score-pill">Target 7.5+</div>
                  <div className="lp-score-pill">8.0+</div>
                </div>
                <div className="lp-meta">
                  <div className="lp-meta-chip">👥 Lớp nhỏ ≤ 12 HV</div>
                  <div className="lp-meta-chip">⏱ 4–6 tháng</div>
                  <div className="lp-meta-chip">💬 1-1 feedback</div>
                </div>
                <button className="lp-card-btn" onClick={scrollToTest}>Đăng ký tư vấn miễn phí →</button>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker */}
        <div className="lp-ticker">
          <div className="lp-ticker-inner">
            {[
              '🎓 Nguyễn Minh Anh – IELTS 8.0',
              '🏅 Trần Thị Hoa – IELTS 7.5 Writing',
              '⭐ Phạm Hữu Đức – IELTS 8.0 Overall',
              '🎯 Lê Thị Mai – 7.5 Speaking',
              '🔥 Hoàng Văn Nam – IELTS 7.5 (từ 5.5)',
              '🌟 Đỗ Thanh Huyền – IELTS 7.0 trong 3 tháng',
              '💪 Vũ Khánh Linh – 8.0 Listening',
              '🎓 Nguyễn Minh Anh – IELTS 8.0',
              '🏅 Trần Thị Hoa – IELTS 7.5 Writing',
              '⭐ Phạm Hữu Đức – IELTS 8.0 Overall',
              '🎯 Lê Thị Mai – 7.5 Speaking',
              '🔥 Hoàng Văn Nam – IELTS 7.5 (từ 5.5)',
              '🌟 Đỗ Thanh Huyền – IELTS 7.0 trong 3 tháng',
              '💪 Vũ Khánh Linh – 8.0 Listening',
            ].map((item, i) => <span key={i} className="lp-ticker-item">{item}</span>)}
          </div>
        </div>

        {/* Partners */}
        <div className="lp-partners">
          <div className="lp-container">
            <div className="lp-partners-label">Học viên HappyHouse hiện đang học tại & làm việc tại</div>
            <div className="lp-partners-logos">
              {['VinGroup', 'FPT', 'RMIT', 'British Council', 'BIDV', 'Viettel', 'VTV', 'VnExpress'].map(p => (
                <div key={p} className="lp-plogo">{p}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Why HappyHouse */}
        <section className="lp-section lp-why" id="why">
          <div className="lp-container">
            <div className="lp-sec-head">
              <div className="lp-sec-tag">Tại sao chọn HappyHouse?</div>
              <h2 className="lp-sec-title">Khác biệt tạo nên<br />sự thành công</h2>
              <p className="lp-sec-desc">HappyHouse xây dựng phương pháp học IELTS thực chiến, phù hợp với từng học viên Việt Nam với mọi trình độ và mục tiêu.</p>
            </div>
            <div className="lp-why-grid">
              {[
                { icon: '🧠', bg: '#FEF2F2', num: '5+', label: 'Năm kinh nghiệm', desc: 'Chuyên đào tạo IELTS với phương pháp không ngừng cải tiến, cập nhật theo format thi mới nhất.' },
                { icon: '👩‍🏫', bg: '#EFF6FF', num: '15+', label: 'Giáo viên xuất sắc', desc: 'Đội ngũ 100% IELTS 8.0+, tận tâm và có kinh nghiệm giảng dạy thực tế cho nhiều trình độ.' },
                { icon: '🎓', bg: '#F0FDF4', num: '2K+', label: 'Học viên thành công', desc: 'Hàng nghìn học viên đạt 6.5–8.5 IELTS, nhận học bổng và cơ hội việc làm quốc tế.' },
                { icon: '📚', bg: '#FFFBEB', num: '100%', label: 'Lộ trình cá nhân', desc: 'Mỗi học viên có lộ trình và kế hoạch học tập riêng, phù hợp với thời gian và mục tiêu.' },
              ].map((c, i) => (
                <div key={i} className="lp-why-card lp-reveal">
                  <div className="lp-why-icon" style={{ background: c.bg }}>{c.icon}</div>
                  <div className="lp-why-num">{c.num}</div>
                  <div className="lp-why-label">{c.label}</div>
                  <div className="lp-why-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="lp-section" id="courses">
          <div className="lp-container">
            <div className="lp-sec-head">
              <div className="lp-sec-tag">Khoá học</div>
              <h2 className="lp-sec-title">Lựa chọn khoá học<br />phù hợp với bạn</h2>
              <p className="lp-sec-desc">Từ người mới bắt đầu đến mục tiêu 8.0+, HappyHouse có lộ trình phù hợp cho mọi trình độ.</p>
            </div>
            <div className="lp-tabs">
              {['Tất cả', 'Tổng hợp', 'Luyện kỹ năng', 'Online', 'Offline'].map((t, i) => (
                <button key={t} className={`lp-tab${i === 0 ? ' on' : ''}`}
                  onClick={e => { document.querySelectorAll('.lp-tab').forEach(b => b.classList.remove('on')); (e.target as HTMLElement).classList.add('on') }}>
                  {t}
                </button>
              ))}
            </div>
            <div className="lp-courses-grid">
              {[
                { emoji: '🚀', bg: 'linear-gradient(135deg,#FEF2F2,#FECACA)', badge: 'HOT', badgeCls: 'lp-badge-hot', level: '4.5 → 6.5+', cat: 'Khoá tổng hợp', name: 'IELTS Foundation – Nền tảng vững chắc', desc: 'Xây dựng nền tảng ngữ pháp, từ vựng và 4 kỹ năng từ đầu. Phù hợp học viên band 4.0–5.0.', info: ['📅 3 buổi/tuần', '⏱ 4 tháng', '👥 Max 12 HV'], old: '6.500.000đ', price: '5.200.000đ' },
                { emoji: '🎯', bg: 'linear-gradient(135deg,#EFF6FF,#BFDBFE)', badge: 'NEW', badgeCls: 'lp-badge-new', level: '5.5 → 7.0+', cat: 'Khoá tổng hợp', name: 'IELTS Intermediate – Nâng cao hiệu quả', desc: 'Chiến lược làm bài thực tế, luyện đề theo format Cambridge mới nhất, phân tích chi tiết.', info: ['📅 3 buổi/tuần', '⏱ 5 tháng', '👥 Max 10 HV'], old: '7.800.000đ', price: '6.500.000đ' },
                { emoji: '🏆', bg: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)', badge: '7.5+', badgeCls: 'lp-badge-sale', level: '6.5 → 8.5', cat: 'Khoá chuyên sâu', name: 'IELTS Advanced – Chinh phục band cao', desc: 'Chiến lược chuyên biệt cho 7.5–8.5. Lớp học nhỏ, feedback cá nhân hoá mỗi buổi.', info: ['📅 4 buổi/tuần', '⏱ 3 tháng', '👥 Max 8 HV'], old: '9.500.000đ', price: '8.200.000đ' },
                { emoji: '✍️', bg: 'linear-gradient(135deg,#FFFBEB,#FDE68A)', badge: 'HOT', badgeCls: 'lp-badge-hot', level: 'Writing', cat: 'Luyện kỹ năng', name: 'IELTS Writing Intensive – Task 1 & 2', desc: 'Tập trung Writing với framework riêng, chấm chữa chi tiết từng bài, feedback âm thanh.', info: ['📅 2 buổi/tuần', '⏱ 2 tháng', '👥 Max 10 HV'], old: '4.500.000đ', price: '3.800.000đ' },
                { emoji: '🗣️', bg: 'linear-gradient(135deg,#F5F3FF,#DDD6FE)', badge: 'NEW', badgeCls: 'lp-badge-new', level: 'Speaking', cat: 'Luyện kỹ năng', name: 'IELTS Speaking Club – Luyện nói thực chiến', desc: 'Luyện Speaking cùng giáo viên IELTS 8.0+, sửa lỗi phát âm, vocabulary và fluency.', info: ['📅 Linh hoạt', '⏱ Theo buổi', '👥 1-1 hoặc nhóm'], old: '450.000đ/buổi', price: '350.000đ' },
                { emoji: '💻', bg: 'linear-gradient(135deg,#FFF1F2,#FFE4E6)', badge: 'ONLINE', badgeCls: 'lp-badge-sale', level: 'Mọi trình độ', cat: 'Khoá online', name: 'IELTS Online – Học mọi lúc mọi nơi', desc: 'Chất lượng như học offline. Live class, video ghi lại, chữa bài và mock test định kỳ.', info: ['📅 Linh hoạt', '⏱ 6 tháng', '👥 Toàn quốc'], old: '5.500.000đ', price: '4.200.000đ' },
              ].map((c, i) => (
                <div key={i} className="lp-course-card lp-reveal">
                  <div className="lp-course-thumb" style={{ background: c.bg }}>
                    {c.emoji}
                    <div className={`lp-cbadge ${c.badgeCls}`}>{c.badge}</div>
                    <div className="lp-clevel">{c.level}</div>
                  </div>
                  <div className="lp-cbody">
                    <div className="lp-ccategory">{c.cat}</div>
                    <div className="lp-cname">{c.name}</div>
                    <div className="lp-cdesc">{c.desc}</div>
                    <div className="lp-cinfo">{c.info.map(x => <div key={x} className="lp-ci">{x}</div>)}</div>
                    <div className="lp-cfooter">
                      <div><div className="lp-cprice-old">{c.old}</div><div className="lp-cprice">{c.price}</div></div>
                      <button className="lp-enroll-sm" onClick={scrollToTest}>Đăng ký</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <a className="lp-btn-primary" href="#test-entry" onClick={scrollToTest} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', fontSize: 14, borderRadius: 10 }}>
                Tư vấn khoá học phù hợp →
              </a>
            </div>
          </div>
        </section>

        {/* Teachers */}
        <section className="lp-section lp-teachers" id="teachers">
          <div className="lp-container">
            <div className="lp-sec-head">
              <div className="lp-sec-tag">Đội ngũ giáo viên</div>
              <h2 className="lp-sec-title">Học cùng những<br />chuyên gia IELTS</h2>
              <p className="lp-sec-desc">100% giáo viên IELTS 8.0+, tận tâm, truyền cảm hứng và có phương pháp giảng dạy được học viên yêu thích.</p>
            </div>
            <div className="lp-teachers-grid">
              {[
                { bg: 'linear-gradient(135deg,#FEF2F2,#FECACA)', emoji: '👨‍🏫', score: 'IELTS 8.5', name: 'Phạm Hồng Long', role: 'Giám đốc Học thuật · 8 năm kinh nghiệm', tags: ['Reading', 'Writing', 'Strategy'], students: '1.800+', rating: '4.9★' },
                { bg: 'linear-gradient(135deg,#EFF6FF,#BFDBFE)', emoji: '👩‍🏫', score: 'IELTS 8.0', name: 'Nguyễn Khánh Linh', role: 'Giảng viên Speaking · CELTA Certified', tags: ['Speaking', 'Pronunciation'], students: '900+', rating: '4.9★' },
                { bg: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)', emoji: '👨‍💻', score: 'IELTS 8.0', name: 'Trần Công Minh', role: 'Giảng viên Writing · Du học Anh Quốc', tags: ['Writing', 'Grammar'], students: '700+', rating: '4.8★' },
                { bg: 'linear-gradient(135deg,#FFFBEB,#FDE68A)', emoji: '👩‍🎓', score: 'IELTS 8.5', name: 'Lê Huyền Thương', role: 'Giảng viên Listening & Reading', tags: ['Listening', 'Reading'], students: '600+', rating: '4.9★' },
              ].map((t, i) => (
                <div key={i} className="lp-teacher-card lp-reveal">
                  <div className="lp-teacher-ava" style={{ background: t.bg }}>
                    {t.emoji}
                    <div className="lp-teacher-score">{t.score}</div>
                  </div>
                  <div className="lp-tbody">
                    <div className="lp-tname">{t.name}</div>
                    <div className="lp-trole">{t.role}</div>
                    <div className="lp-ttags">{t.tags.map(tag => <span key={tag} className="lp-ttag">{tag}</span>)}</div>
                    <div className="lp-tstats">
                      <div className="lp-tstat"><div className="lp-tstat-val">{t.students}</div><div className="lp-tstat-label">Học viên</div></div>
                      <div className="lp-tstat"><div className="lp-tstat-val">{t.rating}</div><div className="lp-tstat-label">Đánh giá</div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="lp-section lp-results" id="results">
          <div className="lp-container">
            <div className="lp-results-grid">
              <div>
                <div className="lp-sec-head" style={{ textAlign: 'left' }}>
                  <div className="lp-sec-tag">Kết quả học viên</div>
                  <h2 className="lp-sec-title">Hàng nghìn học viên<br />đã chinh phục IELTS</h2>
                  <p className="lp-sec-desc" style={{ maxWidth: '100%' }}>Với phương pháp giảng dạy hiệu quả và đội ngũ giáo viên tận tâm, học viên HappyHouse đạt kết quả vượt mong đợi.</p>
                </div>
                <div className="lp-rpoints">
                  {[
                    { icon: '🎯', title: '92% học viên đạt mục tiêu', desc: 'Tỷ lệ học viên đạt band điểm mục tiêu đã đặt ra, với cam kết hỗ trợ đến khi đạt.' },
                    { icon: '⚡', title: 'Tăng 1.0–1.5 band trong 3–5 tháng', desc: 'Phương pháp học thực chiến giúp học viên tiến bộ nhanh và bền vững.' },
                    { icon: '🏅', title: 'Nhiều học viên đạt 7.5–8.5 IELTS', desc: 'Học viên HappyHouse đang học tập và làm việc tại UK, Úc, Canada, Singapore.' },
                  ].map((p, i) => (
                    <div key={i} className="lp-rpoint">
                      <div className="lp-rp-icon">{p.icon}</div>
                      <div><div className="lp-rp-title">{p.title}</div><div className="lp-rp-desc">{p.desc}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lp-score-show">
                {[
                  { stu: '👩', name: 'Minh Anh', score: '8.0', sub: 'Overall', skill: 'W:7.5 · S:8.0 · R:8.5 · L:8.0', feat: false },
                  { stu: '👨', name: 'Hữu Đức', score: '8.0', sub: 'Overall', skill: 'W:7.5 · S:8.0 · R:8.5 · L:8.0', feat: true },
                  { stu: '👩', name: 'Bảo Châu', score: '7.5', sub: 'Overall', skill: 'W:7.0 · S:7.5 · R:8.0 · L:7.5', feat: false },
                  { stu: '👨', name: 'Văn Nam', score: '7.0', sub: 'từ 5.5', skill: 'Tăng 1.5 band · 4 tháng', feat: false },
                  { stu: '👩', name: 'Khánh Hà', score: '7.5', sub: 'Overall', skill: 'W:7.5 · S:7.5 · R:8.0 · L:7.5', feat: false },
                  { stu: '👨', name: 'Tiến Dũng', score: '6.5', sub: 'từ 5.0', skill: 'Tăng 1.5 band · 3 tháng', feat: false },
                ].map((s, i) => (
                  <div key={i} className={`lp-score-card lp-reveal${s.feat ? ' feat' : ''}`}>
                    <div className="lp-sc-stu">{s.stu}</div>
                    <div className="lp-sc-name">{s.name}</div>
                    <div className="lp-sc-score">{s.score} <span>{s.sub}</span></div>
                    <div className={`lp-sc-skill${s.feat ? ' feat' : ''}`}>{s.skill}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="lp-section">
          <div className="lp-container">
            <div className="lp-sec-head">
              <div className="lp-sec-tag">Học viên nói gì</div>
              <h2 className="lp-sec-title">2.000+ học viên<br />tin tưởng HappyHouse</h2>
            </div>
            <div className="lp-testi-grid">
              {[
                { score: 'IELTS 8.0', text: 'HappyHouse hoàn toàn thay đổi cách mình học IELTS. Thầy Long dạy mình cách phân tích đề, xử lý thời gian và tư duy đúng cách. Từ 6.0 lên 8.0 chỉ trong 5 tháng!', name: 'Nguyễn Minh Anh', info: 'Du học sinh Đại học Edinburgh · 2025', bg: '#FEF2F2', emoji: '😊' },
                { score: 'IELTS 7.5', text: 'Cô Khánh Linh chỉ mình đúng chỗ sai trong Speaking, framework Writing của thầy Minh cực kỳ rõ ràng. Đã thử nhiều trung tâm nhưng HappyHouse hiệu quả nhất!', name: 'Trần Bảo Châu', info: 'Học bổng Chính phủ Úc · 2025', bg: '#EFF6FF', emoji: '😄' },
                { score: 'IELTS 8.0', text: 'Điều ấn tượng nhất là sự tận tâm của giáo viên. Thầy chữa bài Writing rất chi tiết, hệ thống mock test bài bản, giúp mình tự tin vào phòng thi thật sự.', name: 'Phạm Hữu Đức', info: 'Du học UCL London · 2024', bg: '#F0FDF4', emoji: '🙂' },
              ].map((t, i) => (
                <div key={i} className="lp-testi-card lp-reveal">
                  <div className="lp-testi-score">{t.score}</div>
                  <div className="lp-testi-quote">&ldquo;</div>
                  <div className="lp-stars">★★★★★</div>
                  <div className="lp-testi-text">{t.text}</div>
                  <div className="lp-testi-author">
                    <div className="lp-testi-ava" style={{ background: t.bg }}>{t.emoji}</div>
                    <div><div className="lp-testi-name">{t.name}</div><div className="lp-testi-info">{t.info}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog */}
        <section className="lp-section lp-blog" id="blog">
          <div className="lp-container">
            <div className="lp-sec-head">
              <div className="lp-sec-tag">Blog IELTS</div>
              <h2 className="lp-sec-title">Kiến thức & chiến lược<br />IELTS miễn phí</h2>
            </div>
            <div className="lp-blog-grid">
              <div className="lp-blog-card feat lp-reveal">
                <div className="lp-blog-thumb" style={{ background: 'linear-gradient(135deg,#FEF2F2,#FECACA)', height: 260 }}>
                  📝
                  <div className="lp-blog-tag">Writing Task 2</div>
                </div>
                <div className="lp-blog-body">
                  <div className="lp-blog-date">10 Tháng 5, 2025</div>
                  <div className="lp-blog-title">Bí kíp viết IELTS Writing Task 2 đạt band 7.0+ – Framework độc quyền HappyHouse</div>
                  <div className="lp-blog-excerpt">Phân tích cấu trúc bài essay theo tiêu chí Task Achievement, Coherence & Cohesion, Lexical Resource và Grammatical Range. Áp dụng ngay để tăng ít nhất 0.5 band Writing...</div>
                  <a className="lp-blog-more" href="#">Đọc tiếp →</a>
                </div>
              </div>
              <div className="lp-blog-card lp-reveal">
                <div className="lp-blog-thumb" style={{ background: 'linear-gradient(135deg,#EFF6FF,#BFDBFE)' }}>
                  🗣️
                  <div className="lp-blog-tag">Speaking</div>
                </div>
                <div className="lp-blog-body">
                  <div className="lp-blog-date">7 Tháng 5, 2025</div>
                  <div className="lp-blog-title">Top 50 cụm từ Speaking Part 2 giúp bạn nói tự nhiên và tự tin</div>
                  <a className="lp-blog-more" href="#">Đọc tiếp →</a>
                </div>
              </div>
              <div className="lp-blog-card lp-reveal">
                <div className="lp-blog-thumb" style={{ background: 'linear-gradient(135deg,#F0FDF4,#BBF7D0)' }}>
                  👂
                  <div className="lp-blog-tag">Listening</div>
                </div>
                <div className="lp-blog-body">
                  <div className="lp-blog-date">4 Tháng 5, 2025</div>
                  <div className="lp-blog-title">Chiến lược làm Listening Section 4 đạt điểm tối đa – Không bỏ sót đáp án</div>
                  <a className="lp-blog-more" href="#">Đọc tiếp →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TEST ENTRY SECTION ── */}
        <section id="test-entry" style={{ background: '#F7F6F2', padding: '72px 0' }}>
          <div className="lp-container">
            <div className="lp-sec-head" style={{ marginBottom: 0 }}>
              <div className="lp-sec-tag">Kiểm tra trình độ miễn phí</div>
              <h2 className="lp-sec-title">Bắt đầu hành trình IELTS<br />của bạn ngay hôm nay</h2>
              <p className="lp-sec-desc" style={{ marginBottom: 0 }}>Làm bài kiểm tra chuẩn hoá, nhận kết quả ngay và lộ trình học phù hợp nhất.</p>
            </div>
            <LandingClient />
          </div>
        </section>

        {/* CTA band */}
        <section className="lp-cta-band">
          <div className="lp-container">
            <h2>Sẵn sàng chinh phục IELTS<br />cùng HappyHouse?</h2>
            <p>Tư vấn miễn phí · Xếp lớp theo trình độ · Lộ trình cá nhân hoá</p>
            <div className="lp-cta-actions">
              <a className="lp-btn-cta-w" href="#test-entry" onClick={scrollToTest}>Kiểm tra trình độ ngay</a>
              <Link className="lp-btn-cta-o" href="/portal/login">Đăng nhập học viên</Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="lp-footer">
          <div className="lp-container">
            <div className="lp-footer-grid">
              <div>
                <a className="lp-logo" href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                  <Image src="/happy_house_sun.png" alt="HappyHouse" width={40} height={40} style={{ borderRadius: 8, objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>HappyHouse</div>
                    <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '1.5px', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>English Center</div>
                  </div>
                </a>
                <div className="lp-footer-desc">Trung tâm Anh ngữ IELTS chuyên sâu. Đồng hành cùng học viên trên hành trình chinh phục mục tiêu quốc tế.</div>
                <div className="lp-fci"><span>📍</span><span>Địa chỉ: [Thêm địa chỉ trung tâm]</span></div>
                <div className="lp-fci"><span>📞</span><span>Hotline: 0901 234 567</span></div>
                <div className="lp-fci"><span>✉️</span><span>hello@happyhouseielts.com</span></div>
              </div>
              <div className="lp-footer-col">
                <h4>Khoá học</h4>
                <div className="lp-flinks">
                  <a href="#courses">IELTS Foundation</a>
                  <a href="#courses">IELTS Intermediate</a>
                  <a href="#courses">IELTS Advanced</a>
                  <a href="#courses">Writing Intensive</a>
                  <a href="#courses">Speaking Club</a>
                  <a href="#courses">IELTS Online</a>
                </div>
              </div>
              <div className="lp-footer-col">
                <h4>HappyHouse</h4>
                <div className="lp-flinks">
                  <a href="#why">Giới thiệu</a>
                  <a href="#teachers">Đội ngũ giáo viên</a>
                  <a href="#results">Kết quả học viên</a>
                  <a href="#blog">Blog IELTS</a>
                  <Link href="/portal/login">Cổng học viên</Link>
                </div>
              </div>
              <div className="lp-footer-col">
                <h4>Tài nguyên</h4>
                <div className="lp-flinks">
                  <a href="#test-entry" onClick={scrollToTest}>Kiểm tra trình độ</a>
                  <Link href="/test">Thi thử IELTS</Link>
                  <a href="#blog">Blog IELTS</a>
                  <a href="#courses">Lộ trình học</a>
                </div>
              </div>
            </div>
            <div className="lp-footer-bottom">
              <div>© 2025 HappyHouse English Center. All rights reserved.</div>
              <div className="lp-fsocial">
                <a href="#" title="Facebook">f</a>
                <a href="#" title="YouTube">▶</a>
                <a href="#" title="Zalo">Z</a>
                <a href="#" title="TikTok">♪</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Sticky CTA */}
        <div className="lp-sticky">
          <div className="lp-sticky-row">
            <div className="lp-sticky-label">Gọi ngay</div>
            <a className="lp-sticky-btn ph" href="tel:0901234567">📞</a>
          </div>
          <div className="lp-sticky-row">
            <div className="lp-sticky-label">Chat Zalo</div>
            <a className="lp-sticky-btn za" href="#">Z</a>
          </div>
          <div className="lp-sticky-row">
            <div className="lp-sticky-label">Lên đầu trang</div>
            <button className="lp-sticky-btn tp" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
          </div>
        </div>

      </div>
    </>
  )
}
