'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LandingClient } from './LandingClient'


export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [consultForm, setConsultForm] = useState({
    name: '', phone: '', childAge: '', program: '', note: '',
  })
  const [consultSubmitted, setConsultSubmitted] = useState(false)
  const [consultError, setConsultError] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          ;(e.target as HTMLElement).style.opacity = '1'
          ;(e.target as HTMLElement).style.transform = 'translateY(0)'
        }
      }),
      { threshold: 0.08 },
    )
    document.querySelectorAll('.lp-reveal').forEach(el => {
      const h = el as HTMLElement
      h.style.opacity = '0'
      h.style.transform = 'translateY(28px)'
      h.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      observer.observe(el)
    })

    const handleScroll = () => {
      const header = document.getElementById('lp-header')
      if (header) {
        if (window.scrollY > 8) {
          header.style.boxShadow = '0 4px 24px rgba(23,43,85,0.10)'
          header.style.backdropFilter = 'blur(12px)'
        } else {
          header.style.boxShadow = 'none'
          header.style.backdropFilter = 'none'
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => { observer.disconnect(); window.removeEventListener('scroll', handleScroll) }
  }, [])

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consultForm.name.trim() || !consultForm.phone.trim()) {
      setConsultError('Vui lòng điền họ tên và số điện thoại để tiếp tục.')
      return
    }
    setConsultError('')
    setConsultSubmitted(true)
  }

  return (
    <>
      <style>{`
        /* ─── Reset + Base ─── */
        html { scroll-padding-top: 80px; }
        :root {
          --lp-navy:    #172B55;
          --lp-red:     #E8303A;
          --lp-red-dk:  #C0222B;
          --lp-cream:   #FFF9F5;
          --lp-pink:    #FFF1F3;
          --lp-mint:    #EDF9F1;
          --lp-sky:     #EEF5FF;
          --lp-yellow:  #FFF4D8;
          --lp-text:    #17233D;
          --lp-muted:   #667085;
          --lp-gray1:   #F8F9FB;
          --lp-gray2:   #E5E7EB;
          --lp-gray4:   #9CA3AF;
          --lp-shadow:  0 4px 24px rgba(23,43,85,0.08);
          --lp-shadowlg:0 12px 48px rgba(23,43,85,0.14);
        }
        .lp-wrap { font-family: 'Be Vietnam Pro', sans-serif; color: var(--lp-text); background: #fff; line-height: 1.6; overflow-x: hidden; }
        .lp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .lp-section  { padding: 88px 0; }
        .lp-sec-head { text-align: center; margin-bottom: 56px; }
        .lp-sec-eye  { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--lp-red); margin-bottom: 10px; }
        .lp-sec-h2   { font-weight: 800; font-size: clamp(24px, 3.5vw, 36px); color: var(--lp-navy); line-height: 1.2; margin: 0 0 14px; }
        .lp-sec-desc { color: var(--lp-muted); font-size: 15.5px; max-width: 600px; margin: 0 auto; line-height: 1.7; }

/* ─── Topbar ─── */
        .lp-topbar { background: var(--lp-navy); color: rgba(255,255,255,.65); font-size: 12px; padding: 7px 0; }
        .lp-topbar-in { max-width: 1200px; margin: auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
        .lp-topbar a { color: rgba(255,255,255,.7); text-decoration: none; transition: color .15s; }
        .lp-topbar a:hover { color: #fff; }
        .lp-topbar-left { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
        .lp-topbar-right { display: flex; gap: 14px; align-items: center; }

        /* ─── Header ─── */
        .lp-header { background: rgba(255,255,255,.96); position: sticky; top: 0; z-index: 100; transition: box-shadow .2s, backdrop-filter .2s; border-bottom: 1px solid rgba(23,43,85,.06); }
        .lp-header-in { max-width: 1200px; margin: auto; padding: 0 24px; height: 72px; display: flex; align-items: center; gap: 24px; }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .lp-logo-text { font-weight: 800; font-size: 19px; color: var(--lp-navy); }
        .lp-logo-sub  { font-size: 9px; font-weight: 600; letter-spacing: 1.6px; color: var(--lp-red); text-transform: uppercase; }
        .lp-nav { flex: 1; display: flex; gap: 0; align-items: center; }
        .lp-nav a { padding: 0 13px; height: 72px; display: inline-flex; align-items: center; font-weight: 600; font-size: 13px; color: var(--lp-text); text-decoration: none; border-bottom: 3px solid transparent; white-space: nowrap; transition: color .2s, border-color .2s; }
        .lp-nav a:hover { color: var(--lp-red); border-bottom-color: var(--lp-red); }
        .lp-hactions { display: flex; gap: 8px; align-items: center; margin-left: auto; flex-shrink: 0; }
        .lp-btn-ghost  { border: 1.5px solid var(--lp-navy); color: var(--lp-navy); padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none; transition: all .2s; white-space: nowrap; }
        .lp-btn-ghost:hover { background: var(--lp-navy); color: #fff; }
        .lp-btn-primary { background: var(--lp-red); color: #fff; padding: 9px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none; transition: all .2s; white-space: nowrap; border: none; cursor: pointer; font-family: inherit; }
        .lp-btn-primary:hover { background: var(--lp-red-dk); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(232,48,58,.28); }
        .lp-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; flex-direction: column; gap: 5px; margin-left: auto; }
        .lp-hamburger span { display: block; width: 22px; height: 2px; background: var(--lp-navy); border-radius: 2px; transition: all .25s; }
        .lp-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .lp-hamburger.open span:nth-child(2) { opacity: 0; }
        .lp-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile Nav Drawer */
        .lp-mobile-nav { position: fixed; inset: 0; z-index: 99; pointer-events: none; }
        .lp-mobile-nav.open { pointer-events: all; }
        .lp-mobile-overlay { position: absolute; inset: 0; background: rgba(23,43,85,.4); opacity: 0; transition: opacity .25s; }
        .lp-mobile-nav.open .lp-mobile-overlay { opacity: 1; }
        .lp-mobile-drawer { position: absolute; top: 72px; left: 0; right: 0; background: #fff; padding: 16px 20px 24px; transform: translateY(-8px); opacity: 0; transition: transform .25s, opacity .25s; box-shadow: 0 12px 40px rgba(23,43,85,.15); }
        .lp-mobile-nav.open .lp-mobile-drawer { transform: translateY(0); opacity: 1; }
        .lp-mobile-links { display: flex; flex-direction: column; gap: 0; border-bottom: 1px solid var(--lp-gray2); margin-bottom: 16px; }
        .lp-mobile-links a { padding: 13px 0; font-weight: 600; font-size: 15px; color: var(--lp-text); text-decoration: none; border-bottom: 1px solid rgba(23,43,85,.06); display: block; }
        .lp-mobile-links a:last-child { border-bottom: none; }
        .lp-mobile-cta { display: block; text-align: center; background: var(--lp-red); color: #fff; padding: 14px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; }

        /* ─── Hero ─── */
        .lp-hero { background: var(--lp-cream); padding: 80px 0 0; position: relative; overflow: hidden; }
        .lp-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 80% 80%, rgba(232,48,58,.06) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 20% 20%, rgba(23,43,85,.04) 0%, transparent 60%); pointer-events: none; }
        .lp-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; position: relative; }
        .lp-hero-eye  { display: inline-block; background: rgba(232,48,58,.1); border: 1px solid rgba(232,48,58,.25); border-radius: 100px; padding: 5px 14px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--lp-red); text-transform: uppercase; margin-bottom: 20px; }
        .lp-hero h1  { font-weight: 900; font-size: clamp(28px, 4.5vw, 50px); line-height: 1.1; color: var(--lp-navy); margin: 0 0 20px; }
        .lp-hero h1 em { font-style: normal; color: var(--lp-red); }
        .lp-hero-p  { color: var(--lp-muted); font-size: 16px; line-height: 1.75; margin: 0 0 32px; max-width: 520px; }
        .lp-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .lp-btn-hp { background: var(--lp-red); color: #fff; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all .25s; box-shadow: 0 6px 20px rgba(232,48,58,.28); border: none; cursor: pointer; font-family: inherit; }
        .lp-btn-hp:hover { background: var(--lp-red-dk); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(232,48,58,.38); }
        .lp-btn-hs { background: rgba(23,43,85,.08); border: 1.5px solid rgba(23,43,85,.15); color: var(--lp-navy); padding: 13px 26px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all .25s; }
        .lp-btn-hs:hover { background: rgba(23,43,85,.14); }
        .lp-hero-trust { font-size: 12.5px; color: var(--lp-muted); display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .lp-hero-trust::before { content: '✓'; color: #22C55E; font-weight: 700; }

        /* Hero image collage */
        .lp-hero-visual { position: relative; align-self: end; }
        .lp-hero-col-main { border-radius: 24px; overflow: hidden; width: 100%; aspect-ratio: 4/3; }
        .lp-hero-col-smalls { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
        .lp-hero-col-small  { border-radius: 16px; overflow: hidden; aspect-ratio: 5/3; }
        .lp-hero-float { position: absolute; bottom: 28px; left: -24px; background: #fff; border-radius: 14px; padding: 12px 16px; box-shadow: 0 8px 28px rgba(23,43,85,.18); display: flex; align-items: center; gap: 12px; z-index: 10; min-width: 200px; }
        .lp-hero-float-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--lp-sky); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .lp-hero-float-text { font-size: 11.5px; color: var(--lp-muted); line-height: 1.3; }
        .lp-hero-float-val  { font-weight: 800; font-size: 13px; color: var(--lp-navy); }

        /* ─── Trust Strip ─── */
        .lp-trust { background: #fff; border-top: 1px solid var(--lp-gray2); border-bottom: 1px solid var(--lp-gray2); padding: 32px 0; }
        .lp-trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .lp-trust-item { display: flex; align-items: center; gap: 14px; }
        .lp-trust-icon { width: 44px; height: 44px; border-radius: 10px; background: var(--lp-sky); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .lp-trust-text h4 { font-weight: 700; font-size: 13.5px; color: var(--lp-navy); margin: 0 0 2px; }
        .lp-trust-text p  { font-size: 12px; color: var(--lp-muted); margin: 0; line-height: 1.4; }

        /* ─── Age Programs Section ─── */
        .lp-progs { background: var(--lp-cream); }
        .lp-progs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
        .lp-prog-card { background: #fff; border-radius: 24px; overflow: hidden; border: 1px solid rgba(23,43,85,.08); box-shadow: var(--lp-shadow); transition: all .3s; }
        .lp-prog-card:hover { box-shadow: var(--lp-shadowlg); transform: translateY(-4px); }
        .lp-prog-img  { height: 200px; overflow: hidden; }
        .lp-prog-body { padding: 24px 28px 28px; }
        .lp-prog-age  { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--lp-red); margin-bottom: 6px; }
        .lp-prog-h3   { font-weight: 800; font-size: 20px; color: var(--lp-navy); margin: 0 0 10px; }
        .lp-prog-desc { font-size: 14px; color: var(--lp-muted); line-height: 1.65; margin: 0 0 16px; }
        .lp-prog-goals { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
        .lp-prog-goal  { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--lp-text); }
        .lp-prog-goal::before { content: '✓'; color: #22C55E; font-weight: 700; font-size: 12px; margin-top: 1px; flex-shrink: 0; }
        .lp-prog-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 700; color: var(--lp-red); text-decoration: none; transition: gap .2s; }
        .lp-prog-link:hover { gap: 10px; }
        .lp-prog-card.ielts-card { border-color: rgba(23,43,85,.12); background: var(--lp-sky); }
        .lp-prog-card.ielts-card .lp-prog-img { background: var(--lp-navy); }

        /* ─── Gallery ─── */
        .lp-gallery { background: var(--lp-navy); padding: 88px 0; }
        .lp-gallery .lp-sec-h2 { color: #fff; }
        .lp-gallery .lp-sec-desc { color: rgba(255,255,255,.65); }
        .lp-gallery .lp-sec-eye { color: rgba(255,255,255,.5); }
        .lp-gallery-bento { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: auto auto; gap: 14px; }
        .lp-gal-main  { grid-row: 1 / 3; border-radius: 20px; overflow: hidden; min-height: 420px; }
        .lp-gal-small { border-radius: 16px; overflow: hidden; min-height: 190px; }
        .lp-gal-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(to top, rgba(23,43,85,.7) 0%, transparent 100%); color: #fff; font-size: 12px; font-weight: 600; letter-spacing: .3px; }
        .lp-gal-item { position: relative; }
        .lp-gallery-cta { text-align: center; margin-top: 28px; }
        .lp-gallery-cta a { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,.75); font-size: 14px; font-weight: 600; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,.3); padding-bottom: 2px; transition: all .2s; }
        .lp-gallery-cta a:hover { color: #fff; border-color: rgba(255,255,255,.7); }

        /* ─── Pathway ─── */
        .lp-path { background: #fff; }
        .lp-path-stages { display: flex; gap: 0; align-items: flex-start; position: relative; margin: 0; padding: 0; list-style: none; }
        .lp-path-stages::before { content: ''; position: absolute; top: 28px; left: 28px; right: 28px; height: 2px; background: linear-gradient(to right, #22C55E, var(--lp-red)); z-index: 0; }
        .lp-path-stage { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 1; padding: 0 8px; }
        .lp-path-dot { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; flex-shrink: 0; border: 3px solid #fff; box-shadow: 0 0 0 2px; }
        .lp-path-stage:nth-child(1) .lp-path-dot { background: #EDF9F1; box-shadow: 0 0 0 2px #22C55E; }
        .lp-path-stage:nth-child(2) .lp-path-dot { background: #EEF5FF; box-shadow: 0 0 0 2px #60A5FA; }
        .lp-path-stage:nth-child(3) .lp-path-dot { background: #FFF4D8; box-shadow: 0 0 0 2px #FBBF24; }
        .lp-path-stage:nth-child(4) .lp-path-dot { background: #FFF1F3; box-shadow: 0 0 0 2px #F87171; }
        .lp-path-stage:nth-child(5) .lp-path-dot { background: var(--lp-navy); box-shadow: 0 0 0 2px var(--lp-navy); }
        .lp-path-stage:nth-child(5) .lp-path-dot span { filter: brightness(0) invert(1); }
        .lp-path-label { font-weight: 700; font-size: 14px; color: var(--lp-navy); margin-bottom: 6px; line-height: 1.3; }
        .lp-path-sub   { font-size: 12px; color: var(--lp-muted); line-height: 1.45; }
        .lp-path-stage:nth-child(5) .lp-path-label { color: var(--lp-muted); font-weight: 600; }
        .lp-path-stage:nth-child(5) .lp-path-sub   { font-size: 11.5px; }
        .lp-path-cta { text-align: center; margin-top: 52px; }

        /* ─── Benefits ─── */
        .lp-benefits { background: var(--lp-mint); }
        .lp-ben-grid  { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .lp-ben-card  { background: #fff; border-radius: 20px; padding: 28px; border: 1px solid rgba(34,197,94,.12); }
        .lp-ben-icon  { width: 52px; height: 52px; border-radius: 14px; background: var(--lp-mint); display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
        .lp-ben-h4    { font-weight: 700; font-size: 17px; color: var(--lp-navy); margin: 0 0 10px; }
        .lp-ben-p     { font-size: 14px; color: var(--lp-muted); line-height: 1.65; margin: 0; }

        /* ─── Teachers ─── */
        .lp-teachers { background: var(--lp-sky); }
        .lp-teach-split { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .lp-teach-img { border-radius: 24px; overflow: hidden; aspect-ratio: 4/5; }
        .lp-teach-points { display: flex; flex-direction: column; gap: 28px; }
        .lp-teach-pt { display: flex; gap: 18px; align-items: flex-start; }
        .lp-teach-pt-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--lp-navy); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .lp-teach-pt-h4 { font-weight: 700; font-size: 16px; color: var(--lp-navy); margin: 0 0 6px; }
        .lp-teach-pt-p  { font-size: 13.5px; color: var(--lp-muted); margin: 0; line-height: 1.6; }
        .lp-teach-head { margin-bottom: 36px; }
        .lp-teach-head .lp-sec-eye { display: block; margin-bottom: 8px; }
        .lp-teach-head h2 { font-weight: 800; font-size: clamp(22px, 3vw, 32px); color: var(--lp-navy); margin: 0 0 12px; }
        .lp-teach-head p  { font-size: 15px; color: var(--lp-muted); line-height: 1.7; margin: 0; }

        /* ─── Testimonials ─── */
        .lp-testi { background: var(--lp-pink); }
        .lp-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .lp-testi-card { background: #fff; border-radius: 20px; padding: 28px; border: 1px solid rgba(232,48,58,.08); box-shadow: 0 2px 16px rgba(23,43,85,.05); }
        .lp-testi-quote { font-size: 40px; color: var(--lp-red); line-height: .8; margin-bottom: 10px; font-family: Georgia, serif; opacity: .3; }
        .lp-testi-text  { font-size: 13.5px; color: #374151; line-height: 1.7; margin: 0 0 20px; font-style: italic; }
        .lp-testi-author { display: flex; gap: 12px; align-items: center; }
        .lp-testi-ava   { width: 44px; height: 44px; border-radius: 50%; background: var(--lp-cream); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .lp-testi-name  { font-weight: 700; font-size: 13.5px; color: var(--lp-navy); }
        .lp-testi-role  { font-size: 12px; color: var(--lp-muted); }
        .lp-testi-placeholder { font-size: 12px; color: #B0B8C9; font-style: italic; line-height: 1.6; }

        /* ─── Advanced / IELTS ─── */
        .lp-advanced { background: var(--lp-navy); padding: 72px 0; }
        .lp-adv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .lp-adv-eye  { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,.5); margin-bottom: 10px; }
        .lp-adv-h2   { font-weight: 800; font-size: clamp(22px, 3vw, 32px); color: #fff; line-height: 1.25; margin: 0 0 16px; }
        .lp-adv-p    { font-size: 15px; color: rgba(255,255,255,.65); line-height: 1.75; margin: 0 0 28px; }
        .lp-adv-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        .lp-adv-btn-p { background: var(--lp-red); color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; transition: all .2s; }
        .lp-adv-btn-p:hover { background: var(--lp-red-dk); }
        .lp-adv-btn-s { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.85); padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; transition: all .2s; }
        .lp-adv-btn-s:hover { background: rgba(255,255,255,.18); }
        .lp-adv-badges { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
        .lp-adv-badge { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); border-radius: 100px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,.8); }
        .lp-adv-visual { border-radius: 20px; overflow: hidden; aspect-ratio: 4/3; }

        /* ─── Activities ─── */
        .lp-activities { background: var(--lp-gray1); }
        .lp-act-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .lp-act-card  { background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid var(--lp-gray2); transition: all .3s; }
        .lp-act-card:hover { box-shadow: var(--lp-shadowlg); transform: translateY(-3px); }
        .lp-act-img   { height: 190px; overflow: hidden; }
        .lp-act-body  { padding: 20px 22px 24px; }
        .lp-act-cat   { font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--lp-red); margin-bottom: 8px; }
        .lp-act-title { font-weight: 700; font-size: 15px; color: var(--lp-navy); line-height: 1.4; margin: 0 0 12px; }
        .lp-act-more  { font-size: 13px; font-weight: 700; color: var(--lp-red); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; transition: gap .2s; }
        .lp-act-more:hover { gap: 8px; }
        .lp-act-cta { text-align: center; margin-top: 36px; }

        /* ─── Consultation Form ─── */
        .lp-consult { background: var(--lp-cream); }
        .lp-consult-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .lp-consult-left .lp-sec-eye { display: block; margin-bottom: 10px; }
        .lp-consult-left h2 { font-weight: 800; font-size: clamp(24px, 3vw, 34px); color: var(--lp-navy); margin: 0 0 14px; }
        .lp-consult-left p  { font-size: 15px; color: var(--lp-muted); line-height: 1.75; margin: 0 0 32px; }
        .lp-consult-trust { display: flex; flex-direction: column; gap: 14px; }
        .lp-consult-pt { display: flex; gap: 12px; align-items: flex-start; font-size: 14px; color: var(--lp-text); }
        .lp-consult-pt::before { content: '✓'; color: #22C55E; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
        .lp-form { background: #fff; border-radius: 24px; padding: 36px; border: 1px solid rgba(23,43,85,.08); box-shadow: var(--lp-shadow); }
        .lp-field { margin-bottom: 18px; }
        .lp-field label { display: block; font-size: 13px; font-weight: 600; color: var(--lp-navy); margin-bottom: 6px; }
        .lp-field input, .lp-field select, .lp-field textarea { width: 100%; border: 1.5px solid var(--lp-gray2); border-radius: 10px; padding: 11px 14px; font-size: 14px; font-family: inherit; color: var(--lp-text); background: #fff; outline: none; transition: border-color .2s; }
        .lp-field input:focus, .lp-field select:focus, .lp-field textarea:focus { border-color: var(--lp-red); }
        .lp-field textarea { resize: vertical; min-height: 80px; }
        .lp-field .req { color: var(--lp-red); }
        .lp-form-err  { background: #FEF2F2; color: #DC2626; font-size: 13px; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; }
        .lp-form-ok   { text-align: center; padding: 32px 20px; }
        .lp-form-ok-icon { font-size: 48px; margin-bottom: 12px; }
        .lp-form-ok h3  { font-weight: 800; font-size: 20px; color: var(--lp-navy); margin: 0 0 8px; }
        .lp-form-ok p   { font-size: 14px; color: var(--lp-muted); margin: 0; }
        .lp-form-micro  { font-size: 12px; color: var(--lp-gray4); margin-top: 14px; text-align: center; }

        /* ─── Test Entry ─── */
        .lp-test-entry { background: #fff; border-top: 1px solid var(--lp-gray2); padding: 80px 0; }

        /* ─── CTA Band ─── */
        .lp-cta-band { background: linear-gradient(135deg, #E8303A 0%, #C0222B 100%); padding: 72px 0; text-align: center; position: relative; overflow: hidden; }
        .lp-cta-band::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 100% at 10% 50%, rgba(255,255,255,.06) 0%, transparent 60%); pointer-events: none; }
        .lp-cta-band h2 { font-weight: 900; font-size: clamp(24px, 4vw, 40px); color: #fff; margin: 0 0 14px; position: relative; }
        .lp-cta-band p  { color: rgba(255,255,255,.8); font-size: 16px; margin: 0 0 32px; position: relative; }
        .lp-cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; position: relative; }
        .lp-btn-cta-w { background: #fff; color: var(--lp-red); padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; transition: all .2s; box-shadow: 0 6px 24px rgba(0,0,0,.15); }
        .lp-btn-cta-w:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0,0,0,.2); }
        .lp-btn-cta-o { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,.6); padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; transition: all .2s; }
        .lp-btn-cta-o:hover { border-color: #fff; background: rgba(255,255,255,.1); }

        /* ─── Footer ─── */
        .lp-footer { background: #0D1117; color: rgba(255,255,255,.6); padding: 64px 0 0; }
        .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
        .lp-footer-brand-desc { font-size: 13px; line-height: 1.7; margin: 14px 0 20px; color: rgba(255,255,255,.55); }
        .lp-fci { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; margin-bottom: 8px; }
        .lp-footer-col h4 { font-weight: 700; font-size: 13.5px; color: #fff; margin: 0 0 16px; letter-spacing: .3px; }
        .lp-flinks { display: flex; flex-direction: column; gap: 9px; }
        .lp-flinks a { font-size: 13px; color: rgba(255,255,255,.5); text-decoration: none; transition: color .2s; display: flex; align-items: center; gap: 6px; }
        .lp-flinks a::before { content: '→'; font-size: 9px; opacity: .4; }
        .lp-flinks a:hover { color: #fff; }
        .lp-footer-bottom { border-top: 1px solid rgba(255,255,255,.08); padding: 20px 0; display: flex; justify-content: space-between; align-items: center; font-size: 12px; flex-wrap: wrap; gap: 12px; }
        .lp-fsocial { display: flex; gap: 8px; }
        .lp-fsocial a { width: 32px; height: 32px; background: rgba(255,255,255,.08); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: rgba(255,255,255,.55); text-decoration: none; transition: all .2s; }
        .lp-fsocial a:hover { background: var(--lp-red); color: #fff; }

        /* ─── Sticky ─── */
        .lp-sticky { position: fixed; bottom: 24px; right: 24px; z-index: 200; display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
        .lp-sticky-btn { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.2); transition: all .2s; text-decoration: none; border: none; font-family: inherit; }
        .lp-sticky-btn:hover { transform: scale(1.1); }
        .lp-sticky-ph { background: #25D366; color: #fff; }
        .lp-sticky-za { background: #0068FF; color: #fff; }
        .lp-sticky-tp { background: var(--lp-navy); color: #fff; }
        .lp-sticky-row { position: relative; display: flex; align-items: center; }
        .lp-sticky-tip { background: rgba(0,0,0,.75); color: #fff; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px; opacity: 0; pointer-events: none; white-space: nowrap; position: absolute; right: 56px; top: 50%; transform: translateY(-50%) translateX(-6px); transition: all .2s; }
        .lp-sticky-row:hover .lp-sticky-tip { opacity: 1; transform: translateY(-50%) translateX(0); }

        /* ─── Responsive — Tablet ≤ 920px ─── */
        @media (max-width: 920px) {
          .lp-hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-hero-visual { display: none; }
          .lp-hero { padding: 56px 0 0; }
          .lp-hero h1 { font-size: clamp(26px, 7vw, 38px); }
          .lp-trust-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-progs-grid { grid-template-columns: 1fr; }
          .lp-gallery-bento { grid-template-columns: 1fr 1fr; }
          .lp-gal-main { grid-row: auto; grid-column: 1 / -1; }
          .lp-path-stages { flex-direction: column; align-items: flex-start; gap: 28px; }
          .lp-path-stages::before { top: 28px; left: 27px; right: auto; width: 2px; height: calc(100% - 56px); background: linear-gradient(to bottom, #22C55E, var(--lp-red)); }
          .lp-path-stage { flex-direction: row; text-align: left; gap: 18px; align-items: flex-start; width: 100%; }
          .lp-path-dot { margin-bottom: 0; flex-shrink: 0; }
          .lp-ben-grid { grid-template-columns: 1fr; }
          .lp-teach-split { grid-template-columns: 1fr; gap: 40px; }
          .lp-teach-img { display: none; }
          .lp-testi-grid { grid-template-columns: 1fr; }
          .lp-adv-grid { grid-template-columns: 1fr; gap: 36px; }
          .lp-adv-visual { display: none; }
          .lp-act-grid { grid-template-columns: 1fr 1fr; }
          .lp-consult-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr; }
          .lp-nav { display: none; }
          .lp-hactions .lp-btn-ghost { display: none; }
          .lp-hamburger { display: flex; }
          .lp-section { padding: 64px 0; }
        }

        /* ─── Responsive — Mobile ≤ 600px ─── */
        @media (max-width: 600px) {
          .lp-section { padding: 52px 0; }
          .lp-container { padding: 0 16px; }
          .lp-trust-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
          .lp-trust-item { flex-direction: column; gap: 8px; text-align: center; }
          .lp-progs-grid { grid-template-columns: 1fr; }
          .lp-gallery-bento { grid-template-columns: 1fr; }
          .lp-gal-main, .lp-gal-small { grid-column: auto; }
          .lp-act-grid { grid-template-columns: 1fr; }
          .lp-footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .lp-footer-bottom { flex-direction: column; text-align: center; }
          .lp-fsocial { justify-content: center; }
          .lp-cta-band { padding: 52px 0; }
          .lp-cta-actions { flex-direction: column; align-items: center; }
          .lp-btn-cta-w, .lp-btn-cta-o { width: 100%; max-width: 340px; text-align: center; }
          .lp-hero-btns { flex-direction: column; align-items: stretch; }
          .lp-btn-hp, .lp-btn-hs { justify-content: center; }
          .lp-sticky { bottom: 14px; right: 14px; }
          .lp-sticky-btn { width: 42px; height: 42px; font-size: 16px; }
          .lp-testi-grid { gap: 16px; }
          .lp-path-sub { font-size: 12px; }
          .lp-topbar-left span:not(:first-child) { display: none; }
          .lp-topbar-right a:not(:first-child) { display: none; }
        }
      `}</style>

      <div className="lp-wrap">

        {/* ── Topbar ── */}
        <div className="lp-topbar">
          <div className="lp-topbar-in">
            <div className="lp-topbar-left">
              <span>📞 <a href="tel:0845956888">0845 956 888</a></span>
              <span>✉️ <a href="mailto:hello@happyhouseielts.com">hello@happyhouseielts.com</a></span>
              <span>⏰ Thứ 2 – Chủ nhật: 8:00 – 21:00</span>
            </div>
            <div className="lp-topbar-right">
              <Link href="/portal/login">Cổng học viên</Link>
              <a href="#consult" onClick={scrollTo('consult')}>Đăng ký tư vấn</a>
            </div>
          </div>
        </div>

        {/* ── Header ── */}
        <header className="lp-header" id="lp-header" role="banner">
          <div className="lp-header-in">
            <a className="lp-logo" href="/" aria-label="HappyHouse English Center — Trang chủ">
              <Image
                src="/happy_house_sun.png"
                alt="HappyHouse"
                width={42}
                height={42}
                style={{ borderRadius: 8, objectFit: 'contain' }}
              />
              <div>
                <div className="lp-logo-text">HappyHouse</div>
                <div className="lp-logo-sub">English Center</div>
              </div>
            </a>
            <nav className="lp-nav" aria-label="Điều hướng chính">
              <a href="#gioi-thieu" onClick={scrollTo('gioi-thieu')}>Giới thiệu</a>
              <a href="#chuong-trinh" onClick={scrollTo('chuong-trinh')}>Chương trình học</a>
              <a href="#lo-trinh" onClick={scrollTo('lo-trinh')}>Lộ trình</a>
              <a href="#hinh-anh" onClick={scrollTo('hinh-anh')}>Hình ảnh lớp học</a>
              <a href="#giao-vien" onClick={scrollTo('giao-vien')}>Đội ngũ giáo viên</a>
              <a href="#phu-huynh" onClick={scrollTo('phu-huynh')}>Phụ huynh chia sẻ</a>
              <a href="#consult" onClick={scrollTo('consult')}>Liên hệ</a>
            </nav>
            <div className="lp-hactions">
              <Link className="lp-btn-ghost" href="/portal/login">Cổng học viên</Link>
              <a className="lp-btn-primary" href="#consult" onClick={scrollTo('consult')}>Đăng ký học thử</a>
            </div>
            <button
              className={`lp-hamburger${mobileOpen ? ' open' : ''}`}
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </header>

        {/* ── Mobile Nav Drawer ── */}
        <div className={`lp-mobile-nav${mobileOpen ? ' open' : ''}`} aria-hidden={!mobileOpen}>
          <div className="lp-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="lp-mobile-drawer">
            <nav className="lp-mobile-links">
              <a href="#gioi-thieu"   onClick={scrollTo('gioi-thieu')}>Giới thiệu</a>
              <a href="#chuong-trinh" onClick={scrollTo('chuong-trinh')}>Chương trình học</a>
              <a href="#lo-trinh"     onClick={scrollTo('lo-trinh')}>Lộ trình học tập</a>
              <a href="#hinh-anh"     onClick={scrollTo('hinh-anh')}>Hình ảnh lớp học</a>
              <a href="#giao-vien"    onClick={scrollTo('giao-vien')}>Đội ngũ giáo viên</a>
              <a href="#phu-huynh"    onClick={scrollTo('phu-huynh')}>Phụ huynh chia sẻ</a>
              <Link href="/portal/login">Cổng học viên</Link>
            </nav>
            <a className="lp-mobile-cta" href="#consult" onClick={scrollTo('consult')}>Đăng ký tư vấn</a>
          </div>
        </div>

        {/* ── 1. Hero ── */}
        <section className="lp-hero" id="gioi-thieu" aria-labelledby="hero-heading">
          <div className="lp-container">
            <div className="lp-hero-grid">
              {/* Left: content */}
              <div>
                <div className="lp-hero-eye">Trung tâm tiếng Anh cho trẻ em &amp; học sinh</div>
                <h1 id="hero-heading">
                  Đồng hành cùng con trên hành trình tiếng Anh{' '}
                  <em>vững vàng</em> và{' '}
                  <em>đầy hứng khởi</em>
                </h1>
                <p className="lp-hero-p">
                  Tại HappyHouse, mỗi học viên được học theo đúng độ tuổi, trình độ và mục tiêu: từ làm quen tiếng Anh, xây nền tảng giao tiếp, Cambridge, tiếng Anh học đường đến những cột mốc lớn hơn trong tương lai.
                </p>
                <div className="lp-hero-btns">
                  <a className="lp-btn-hp" href="#consult" onClick={scrollTo('consult')}>Đăng ký học thử</a>
                  <a className="lp-btn-hs" href="#lo-trinh" onClick={scrollTo('lo-trinh')}>Xem lộ trình cho con</a>
                </div>
                <div className="lp-hero-trust">
                  Kiểm tra trình độ &nbsp;•&nbsp; Tư vấn lộ trình &nbsp;•&nbsp; Đồng hành cùng phụ huynh
                </div>
              </div>

              {/* Right: image collage */}
              <div className="lp-hero-visual" aria-hidden="true">
                <div className="lp-hero-col-main" style={{ position: 'relative', minHeight: 320 }}>
                  <Image
                    src="/images/home/hero-main.jpg"
                    alt="Giáo viên và học sinh trong lớp học thực tế"
                    fill
                    style={{ objectFit: 'cover', borderRadius: 'inherit' }}
                    priority
                  />
                </div>
                <div className="lp-hero-col-smalls">
                  <div className="lp-hero-col-small" style={{ position: 'relative', minHeight: 130 }}>
                    <Image
                      src="/images/home/hero-small-1.jpg"
                      alt="Trẻ tự tin nói tiếng Anh"
                      fill
                      style={{ objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                  </div>
                  <div className="lp-hero-col-small" style={{ position: 'relative', minHeight: 130 }}>
                    <Image
                      src="/images/home/hero-small-2.jpg"
                      alt="Hoạt động nhóm trong lớp"
                      fill
                      style={{ objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                  </div>
                </div>
                <div className="lp-hero-float">
                  <div className="lp-hero-float-icon">🗺</div>
                  <div>
                    <div className="lp-hero-float-text">Lộ trình phù hợp theo độ tuổi</div>
                    <div className="lp-hero-float-val">Trẻ em · Tiểu học · THCS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Trust Strip ── */}
        <div className="lp-trust">
          <div className="lp-container">
            <div className="lp-trust-grid">
              {[
                { icon: '🗺', title: 'Lộ trình theo độ tuổi', desc: 'Mỗi giai đoạn có nội dung phù hợp' },
                { icon: '💬', title: 'Lớp học tương tác', desc: 'Học qua giao tiếp thực tế' },
                { icon: '📊', title: 'Theo sát tiến bộ', desc: 'Phản hồi rõ ràng cho phụ huynh' },
                { icon: '🤝', title: 'Tư vấn cùng phụ huynh', desc: 'Gia đình đồng hành cùng trung tâm' },
              ].map((t, i) => (
                <div key={i} className="lp-trust-item">
                  <div className="lp-trust-icon">{t.icon}</div>
                  <div className="lp-trust-text">
                    <h4>{t.title}</h4>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Age Programs ── */}
        <section className="lp-section lp-progs" id="chuong-trinh" aria-labelledby="progs-heading">
          <div className="lp-container">
            <div className="lp-sec-head lp-reveal">
              <div className="lp-sec-eye">Chương trình học</div>
              <h2 className="lp-sec-h2" id="progs-heading">Mỗi độ tuổi, một lộ trình phù hợp</h2>
              <p className="lp-sec-desc">Từ những buổi học đầu tiên đến các mục tiêu học thuật cao hơn, HappyHouse giúp con học đúng giai đoạn và tiến bộ bền vững.</p>
            </div>
            <div className="lp-progs-grid">
              {[
                {
                  age: 'Giai đoạn làm quen',
                  title: 'Tiếng Anh trẻ em',
                  desc: 'Học tiếng Anh tự nhiên qua âm thanh, hình ảnh, vận động và hoạt động tương tác.',
                  goals: ['Phát âm và phản xạ cơ bản', 'Từ vựng gần gũi, dễ nhớ', 'Yêu thích việc học tiếng Anh'],
                  imgSrc: '/images/home/program-young-learners.jpg',
                  label: 'Trẻ nhỏ vui học tiếng Anh',
                  href: '/khoa-hoc/tieng-anh-tieu-hoc',
                  cta: 'Tìm hiểu chương trình',
                  ielts: false,
                },
                {
                  age: 'Xây nền tảng vững',
                  title: 'Tiếng Anh Tiểu học',
                  desc: 'Phát triển đồng đều nghe, nói, đọc, viết và xây dựng sự tự tin khi sử dụng tiếng Anh.',
                  goals: ['Giao tiếp tự tin, mạch lạc', 'Cambridge Starters / Movers / Flyers', 'Hỗ trợ việc học tại trường'],
                  imgSrc: '/images/home/program-primary.jpg',
                  label: 'Học sinh tiểu học học tiếng Anh',
                  href: '/khoa-hoc/cambridge-tieu-hoc',
                  cta: 'Tìm hiểu chương trình',
                  ielts: false,
                },
                {
                  age: 'Phát triển học thuật',
                  title: 'Tiếng Anh THCS',
                  desc: 'Củng cố ngữ pháp, từ vựng, kỹ năng giao tiếp và tư duy tiếng Anh cho học sinh cấp 2.',
                  goals: ['Học tốt tiếng Anh trên lớp', 'Cambridge KET / PET', 'Chuẩn bị cho mục tiêu vào 10'],
                  imgSrc: '/images/home/program-secondary.jpg',
                  label: 'Học sinh THCS học tiếng Anh',
                  href: '/khoa-hoc/tieng-anh-thcs-thpt',
                  cta: 'Tìm hiểu chương trình',
                  ielts: false,
                },
                {
                  age: 'Khi con đã sẵn sàng',
                  title: 'Luyện thi & mục tiêu nâng cao',
                  desc: 'Định hướng cho học sinh lớn hơn với các mục tiêu như thi vào 10, tiếng Anh học thuật và IELTS.',
                  goals: ['Ôn thi vào 10 chuyên & công lập', 'Pre-IELTS / IELTS theo lộ trình', 'Định hướng cá nhân hóa'],
                  imgSrc: '/images/home/program-advanced.jpg',
                  label: 'Học sinh luyện thi nâng cao',
                  href: '/khoa-hoc/luyen-thi-ielts',
                  cta: 'Xem lộ trình nâng cao',
                  ielts: true,
                },
              ].map((prog, i) => (
                <article key={i} className={`lp-prog-card lp-reveal${prog.ielts ? ' ielts-card' : ''}`}>
                  <div className="lp-prog-img" style={{ position: 'relative' }}>
                    <Image
                      src={prog.imgSrc}
                      alt={prog.label}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="lp-prog-body">
                    <div className="lp-prog-age">{prog.age}</div>
                    <h3 className="lp-prog-h3">{prog.title}</h3>
                    <p className="lp-prog-desc">{prog.desc}</p>
                    <div className="lp-prog-goals">
                      {prog.goals.map((g, j) => <div key={j} className="lp-prog-goal">{g}</div>)}
                    </div>
                    <Link href={prog.href} className="lp-prog-link">{prog.cta} →</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Gallery ── */}
        <section className="lp-section lp-gallery" id="hinh-anh" aria-labelledby="gallery-heading">
          <div className="lp-container">
            <div className="lp-sec-head lp-reveal">
              <div className="lp-sec-eye" style={{ color: 'rgba(255,255,255,.5)' }}>Khoảnh khắc HappyHouse</div>
              <h2 className="lp-sec-h2 lp-reveal" id="gallery-heading" style={{ color: '#fff' }}>Một ngày học tại HappyHouse</h2>
              <p className="lp-sec-desc" style={{ color: 'rgba(255,255,255,.65)' }}>Không chỉ học kiến thức, các con được giao tiếp, tương tác, vui chơi và trưởng thành trong một môi trường tích cực mỗi ngày.</p>
            </div>
            <div className="lp-gallery-bento">
              <div className="lp-gal-item lp-gal-main lp-reveal" style={{ position: 'relative', minHeight: 420 }}>
                <Image
                  src="/images/home/gallery-classroom.jpg"
                  alt="Giờ học tương tác"
                  fill
                  style={{ objectFit: 'cover', borderRadius: 20 }}
                />
                <div className="lp-gal-caption">Giờ học tương tác</div>
              </div>
              {[
                { imgSrc: '/images/home/gallery-activity.jpg', label: 'Hoạt động nhóm vui nhộn', caption: 'Hoạt động nhóm' },
                { imgSrc: '/images/home/gallery-teacher.jpg',  label: 'Giáo viên hướng dẫn tận tình', caption: 'Giáo viên đồng hành' },
                { imgSrc: '/images/home/gallery-center.jpg',   label: 'Không gian lớp học HappyHouse', caption: 'Không gian học tập' },
              ].map((g, i) => (
                <div key={i} className="lp-gal-item lp-gal-small lp-reveal" style={{ position: 'relative' }}>
                  <Image
                    src={g.imgSrc}
                    alt={g.label}
                    fill
                    style={{ objectFit: 'cover', borderRadius: 16 }}
                  />
                  <div className="lp-gal-caption">{g.caption}</div>
                </div>
              ))}
            </div>
            <div className="lp-gallery-cta lp-reveal">
              <a href="#consult" onClick={scrollTo('consult')}>Xem thêm hình ảnh lớp học →</a>
            </div>
          </div>
        </section>

        {/* ── 5. Learning Pathway ── */}
        <section className="lp-section lp-path" id="lo-trinh" aria-labelledby="path-heading">
          <div className="lp-container">
            <div className="lp-sec-head lp-reveal">
              <div className="lp-sec-eye">Lộ trình học tập</div>
              <h2 className="lp-sec-h2" id="path-heading">Từ nền tảng đầu đời đến những cột mốc lớn</h2>
              <p className="lp-sec-desc">HappyHouse xây dựng lộ trình để con không học rời rạc, mà tiến bộ từng bước theo độ tuổi và năng lực.</p>
            </div>
            <ol className="lp-path-stages lp-reveal" aria-label="Lộ trình học tập 5 giai đoạn">
              {[
                { icon: '🌱', label: 'Làm quen tiếng Anh', sub: 'Âm thanh, phát âm, từ vựng và phản xạ đầu tiên' },
                { icon: '📖', label: 'Tiểu học & Cambridge', sub: '4 kỹ năng, Starters, Movers, Flyers' },
                { icon: '🎓', label: 'THCS & nền tảng học thuật', sub: 'Từ vựng, ngữ pháp, giao tiếp, KET/PET' },
                { icon: '✏️', label: 'Ôn thi vào 10', sub: 'Củng cố kiến thức và chiến lược làm bài' },
                { icon: '🌍', label: 'IELTS & mục tiêu quốc tế', sub: 'Dành cho học sinh lớn hơn khi đã có nền tảng' },
              ].map((stage, i) => (
                <li key={i} className="lp-path-stage">
                  <div className="lp-path-dot"><span>{stage.icon}</span></div>
                  <div>
                    <div className="lp-path-label">{stage.label}</div>
                    <div className="lp-path-sub">{stage.sub}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="lp-path-cta lp-reveal">
              <a className="lp-btn-hp" href="#consult" onClick={scrollTo('consult')}>Nhận tư vấn lộ trình cho con</a>
            </div>
          </div>
        </section>

        {/* ── 6. Why Parents Choose ── */}
        <section className="lp-section lp-benefits" id="tai-sao" aria-labelledby="ben-heading">
          <div className="lp-container">
            <div className="lp-sec-head lp-reveal">
              <div className="lp-sec-eye">Vì sao phụ huynh tin chọn</div>
              <h2 className="lp-sec-h2" id="ben-heading">Con tiến bộ, phụ huynh luôn được đồng hành</h2>
            </div>
            <div className="lp-ben-grid">
              {[
                { icon: '🎯', title: 'Học đúng trình độ', text: 'Con được đánh giá đầu vào và tư vấn lớp học phù hợp với năng lực hiện tại, không học lại những gì đã biết.' },
                { icon: '👩‍🏫', title: 'Giáo viên tận tâm', text: 'Giáo viên theo sát quá trình học, khuyến khích con tự tin tham gia và sử dụng tiếng Anh mỗi buổi học.' },
                { icon: '📊', title: 'Phản hồi tiến bộ rõ ràng', text: 'Phụ huynh nắm được tình hình học tập, điểm mạnh và nội dung con cần cải thiện sau mỗi giai đoạn.' },
                { icon: '🏡', title: 'Môi trường tích cực', text: 'Lớp học gần gũi, nhiều tương tác, giúp con yêu thích tiếng Anh và chủ động hơn trong từng buổi học.' },
              ].map((b, i) => (
                <article key={i} className="lp-ben-card lp-reveal">
                  <div className="lp-ben-icon">{b.icon}</div>
                  <h3 className="lp-ben-h4">{b.title}</h3>
                  <p className="lp-ben-p">{b.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. Teachers ── */}
        <section className="lp-section lp-teachers" id="giao-vien" aria-labelledby="teach-heading">
          <div className="lp-container">
            <div className="lp-teach-split">
              <div className="lp-teach-img" aria-hidden="true" style={{ position: 'relative' }}>
                <Image
                  src="/images/home/gallery-teacher.jpg"
                  alt="Giáo viên HappyHouse trong lớp học"
                  fill
                  style={{ objectFit: 'cover', borderRadius: 24 }}
                />
              </div>
              <div>
                <div className="lp-teach-head">
                  <span className="lp-sec-eye">Đội ngũ giáo viên</span>
                  <h2 id="teach-heading">Người đồng hành cùng con trong từng buổi học</h2>
                  <p>Không chỉ truyền đạt kiến thức, giáo viên HappyHouse tạo nên những giờ học tích cực, giúp học sinh tự tin giao tiếp và tiến bộ từng ngày.</p>
                </div>
                <div className="lp-teach-points">
                  {[
                    { icon: '👶', title: 'Thấu hiểu từng độ tuổi', text: 'Hoạt động học tập được điều chỉnh phù hợp với trẻ em, học sinh tiểu học và THCS.' },
                    { icon: '🗣', title: 'Khuyến khích con sử dụng tiếng Anh', text: 'Con được thực hành nói, phản xạ và tương tác ngay trong lớp học, không chỉ học lý thuyết.' },
                    { icon: '📱', title: 'Phối hợp cùng phụ huynh', text: 'Gia đình được cập nhật để cùng trung tâm hỗ trợ con hiệu quả hơn tại nhà.' },
                  ].map((pt, i) => (
                    <div key={i} className="lp-teach-pt lp-reveal">
                      <div className="lp-teach-pt-icon">{pt.icon}</div>
                      <div>
                        <h4 className="lp-teach-pt-h4">{pt.title}</h4>
                        <p className="lp-teach-pt-p">{pt.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. Testimonials ── */}
        <section className="lp-section lp-testi" id="phu-huynh" aria-labelledby="testi-heading">
          <div className="lp-container">
            <div className="lp-sec-head lp-reveal">
              <div className="lp-sec-eye">Câu chuyện tiến bộ</div>
              <h2 className="lp-sec-h2" id="testi-heading">Điều phụ huynh mong nhất là thấy con tự tin hơn mỗi ngày</h2>
            </div>
            <div className="lp-testi-grid">
              {[
                {
                  role: 'Phụ huynh học sinh Tiểu học',
                  emoji: '👩',
                  bg: '#FFF1F3',
                  // PLACEHOLDER: Replace with verified parent testimonial
                  quote: '[Chờ phản hồi thật của phụ huynh về sự tự tin và tiến bộ của con trong các buổi học tại HappyHouse]',
                  name: '[Tên phụ huynh]',
                  isPlaceholder: true,
                },
                {
                  role: 'Phụ huynh học sinh THCS',
                  emoji: '👨',
                  bg: '#EDF9F1',
                  // PLACEHOLDER: Replace with verified parent testimonial
                  quote: '[Chờ phản hồi thật về việc học trên lớp hoặc lộ trình Cambridge của con]',
                  name: '[Tên phụ huynh]',
                  isPlaceholder: true,
                },
                {
                  role: 'Học sinh chương trình nâng cao',
                  emoji: '🧑‍🎓',
                  bg: '#EEF5FF',
                  // PLACEHOLDER: Replace with verified result (entrance exam / IELTS)
                  quote: '[Chờ kết quả thật về thi vào 10 hoặc IELTS của học sinh nếu có]',
                  name: '[Tên học sinh]',
                  isPlaceholder: true,
                },
              ].map((t, i) => (
                <article key={i} className="lp-testi-card lp-reveal">
                  <div className="lp-testi-quote">&ldquo;</div>
                  <p className={t.isPlaceholder ? 'lp-testi-placeholder' : 'lp-testi-text'}>{t.quote}</p>
                  <div className="lp-testi-author">
                    <div className="lp-testi-ava" style={{ background: t.bg }}>{t.emoji}</div>
                    <div>
                      <div className="lp-testi-name">{t.name}</div>
                      <div className="lp-testi-role">{t.role}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. Advanced / IELTS Section (compact) ── */}
        <section className="lp-advanced" aria-labelledby="adv-heading">
          <div className="lp-container">
            <div className="lp-adv-grid">
              <div>
                <span className="lp-adv-eye">Khi con sẵn sàng cho mục tiêu xa hơn</span>
                <h2 className="lp-adv-h2" id="adv-heading">Từ nền tảng vững đến IELTS và những cơ hội lớn</h2>
                <p className="lp-adv-p">Với học sinh lớn hơn, HappyHouse tiếp tục đồng hành qua các chương trình tiếng Anh học thuật, ôn thi và IELTS theo mục tiêu phù hợp.</p>
                <div className="lp-adv-badges">
                  <span className="lp-adv-badge">Pre-IELTS</span>
                  <span className="lp-adv-badge">IELTS</span>
                  <span className="lp-adv-badge">Ôn thi vào 10</span>
                  <span className="lp-adv-badge">Tiếng Anh học thuật</span>
                </div>
                <div className="lp-adv-btns">
                  <Link className="lp-adv-btn-p" href="/khoa-hoc/luyen-thi-ielts">Xem chương trình nâng cao</Link>
                  <a className="lp-adv-btn-s" href="#consult" onClick={scrollTo('consult')}>Đăng ký tư vấn</a>
                </div>
              </div>
              <div className="lp-adv-visual" aria-hidden="true" style={{ position: 'relative' }}>
                <Image
                  src="/images/home/program-advanced.jpg"
                  alt="Học sinh nâng cao luyện thi"
                  fill
                  style={{ objectFit: 'cover', borderRadius: 20 }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. Activities ── */}
        <section className="lp-section lp-activities" aria-labelledby="act-heading">
          <div className="lp-container">
            <div className="lp-sec-head lp-reveal">
              <div className="lp-sec-eye">Hoạt động &amp; kiến thức</div>
              <h2 className="lp-sec-h2" id="act-heading">Học tiếng Anh không chỉ diễn ra trong sách vở</h2>
            </div>
            <div className="lp-act-grid">
              {[
                {
                  cat: 'Hoạt động tại trung tâm',
                  title: 'Những giờ học tương tác giúp con tự tin nói tiếng Anh',
                  imgSrc: '/images/home/gallery-activity.jpg',
                  label: 'Hoạt động tiếng Anh vui tại trung tâm',
                },
                {
                  cat: 'Góc dành cho phụ huynh',
                  title: 'Làm thế nào để đồng hành cùng con học tiếng Anh tại nhà?',
                  imgSrc: '/images/home/parent-testimonial.jpg',
                  label: 'Phụ huynh đồng hành cùng con học tiếng Anh',
                },
                {
                  cat: 'Lộ trình học tập',
                  title: 'Khi nào con nên bắt đầu Cambridge hoặc IELTS?',
                  imgSrc: '/images/home/program-secondary.jpg',
                  label: 'Lộ trình Cambridge và IELTS cho học sinh',
                },
              ].map((a, i) => (
                <article key={i} className="lp-act-card lp-reveal">
                  <div className="lp-act-img" style={{ position: 'relative' }}>
                    <Image
                      src={a.imgSrc}
                      alt={a.label}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="lp-act-body">
                    <div className="lp-act-cat">{a.cat}</div>
                    <h3 className="lp-act-title">{a.title}</h3>
                    <a className="lp-act-more" href="#">Đọc thêm →</a>
                  </div>
                </article>
              ))}
            </div>
            <div className="lp-act-cta lp-reveal">
              <a className="lp-btn-hs" href="#">Xem tất cả hoạt động &amp; bài viết →</a>
            </div>
          </div>
        </section>

        {/* ── 11. Consultation Form ── */}
        <section className="lp-section lp-consult" id="consult" aria-labelledby="consult-heading">
          <div className="lp-container">
            <div className="lp-consult-grid">
              <div className="lp-consult-left lp-reveal">
                <span className="lp-sec-eye">Đăng ký tư vấn</span>
                <h2 id="consult-heading">Nhận lộ trình phù hợp cho con</h2>
                <p>Để lại thông tin, HappyHouse sẽ tư vấn lớp học phù hợp với độ tuổi, trình độ và mục tiêu của con.</p>
                <div className="lp-consult-trust">
                  <div className="lp-consult-pt">Kiểm tra trình độ đầu vào miễn phí</div>
                  <div className="lp-consult-pt">Tư vấn lộ trình phù hợp theo độ tuổi</div>
                  <div className="lp-consult-pt">Phụ huynh được đồng hành và cập nhật tiến độ</div>
                  <div className="lp-consult-pt">Lớp học cỡ nhỏ, giáo viên tận tâm</div>
                </div>
              </div>
              <div className="lp-reveal">
                <div className="lp-form">
                  {consultSubmitted ? (
                    <div className="lp-form-ok">
                      <div className="lp-form-ok-icon">✅</div>
                      <h3>HappyHouse đã nhận được thông tin!</h3>
                      <p>Chúng tôi sẽ liên hệ trong thời gian sớm nhất để tư vấn lộ trình phù hợp cho con.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleConsultSubmit} noValidate>
                      <div className="lp-field">
                        <label htmlFor="cf-name">Họ và tên phụ huynh <span className="req">*</span></label>
                        <input
                          id="cf-name"
                          type="text"
                          placeholder="Nguyễn Văn A"
                          value={consultForm.name}
                          onChange={e => setConsultForm(f => ({ ...f, name: e.target.value }))}
                          autoComplete="name"
                        />
                      </div>
                      <div className="lp-field">
                        <label htmlFor="cf-phone">Số điện thoại <span className="req">*</span></label>
                        <input
                          id="cf-phone"
                          type="tel"
                          placeholder="0845 956 888"
                          value={consultForm.phone}
                          onChange={e => setConsultForm(f => ({ ...f, phone: e.target.value }))}
                          autoComplete="tel"
                        />
                      </div>
                      <div className="lp-field">
                        <label htmlFor="cf-age">Độ tuổi / lớp hiện tại của con</label>
                        <input
                          id="cf-age"
                          type="text"
                          placeholder="Ví dụ: 8 tuổi, lớp 3"
                          value={consultForm.childAge}
                          onChange={e => setConsultForm(f => ({ ...f, childAge: e.target.value }))}
                        />
                      </div>
                      <div className="lp-field">
                        <label htmlFor="cf-prog">Chương trình quan tâm</label>
                        <select
                          id="cf-prog"
                          value={consultForm.program}
                          onChange={e => setConsultForm(f => ({ ...f, program: e.target.value }))}
                        >
                          <option value="">-- Chọn chương trình --</option>
                          <option value="young">Tiếng Anh trẻ em</option>
                          <option value="primary">Tiếng Anh Tiểu học</option>
                          <option value="secondary">Tiếng Anh THCS</option>
                          <option value="entrance">Ôn thi vào 10</option>
                          <option value="ielts">IELTS / mục tiêu nâng cao</option>
                          <option value="unsure">Chưa xác định, cần tư vấn</option>
                        </select>
                      </div>
                      <div className="lp-field">
                        <label htmlFor="cf-note">Ghi chú thêm</label>
                        <textarea
                          id="cf-note"
                          placeholder="Ví dụ: Con đang học lớp 5, cần chuẩn bị Cambridge..."
                          value={consultForm.note}
                          onChange={e => setConsultForm(f => ({ ...f, note: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      {consultError && <div className="lp-form-err">{consultError}</div>}
                      <button type="submit" className="lp-btn-primary" style={{ width: '100%', height: 48, fontSize: 15, borderRadius: 10, fontWeight: 700 }}>
                        Nhận tư vấn lộ trình
                      </button>
                      <p className="lp-form-micro">HappyHouse sẽ liên hệ để tư vấn. Thông tin của phụ huynh được bảo mật.</p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 12. Test Entry (preserved) ── */}
        <section className="lp-test-entry" id="test-entry" aria-labelledby="test-heading">
          <div className="lp-container">
            <div className="lp-sec-head">
              <div className="lp-sec-eye">Kiểm tra trình độ miễn phí</div>
              <h2 className="lp-sec-h2" id="test-heading">Biết trình độ hiện tại, xác định lộ trình phù hợp</h2>
              <p className="lp-sec-desc" style={{ marginBottom: 0 }}>Làm bài kiểm tra chuẩn hoá miễn phí và nhận kết quả ngay để HappyHouse tư vấn lớp phù hợp nhất cho con.</p>
            </div>
            <div style={{ marginTop: 28 }}>
              <LandingClient />
            </div>
          </div>
        </section>

        {/* ── 13. Final CTA ── */}
        <section className="lp-cta-band" aria-labelledby="cta-heading">
          <div className="lp-container">
            <h2 id="cta-heading">Cùng HappyHouse gieo nền tảng tiếng Anh<br />vững vàng cho con</h2>
            <p>Một lộ trình phù hợp hôm nay có thể mở ra nhiều cơ hội lớn cho con trong tương lai.</p>
            <div className="lp-cta-actions">
              <a className="lp-btn-cta-w" href="#consult" onClick={scrollTo('consult')}>Đăng ký học thử</a>
              <a className="lp-btn-cta-o" href="tel:0845956888">Liên hệ tư vấn</a>
            </div>
          </div>
        </section>

        {/* ── 14. Footer ── */}
        <footer className="lp-footer" role="contentinfo">
          <div className="lp-container">
            <div className="lp-footer-grid">
              <div>
                <a className="lp-logo" href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                  <Image src="/happy_house_sun.png" alt="HappyHouse" width={38} height={38} style={{ borderRadius: 8, objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>HappyHouse</div>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '1.6px', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>English Center</div>
                  </div>
                </a>
                <p className="lp-footer-brand-desc">
                  HappyHouse English Center đồng hành cùng trẻ em và học sinh trên hành trình xây dựng nền tảng tiếng Anh, phát triển sự tự tin và hướng tới những mục tiêu học tập dài hạn.
                </p>
                <div className="lp-fci"><span>📍</span><span>CS1: Số 2 Hàm Từ Quan, Hà Nội<br />CS2: Số 4 Ngõ 35 Phúc Lợi, Hà Nội</span></div>
                <div className="lp-fci"><span>📞</span><a href="tel:0845956888" style={{ color: 'inherit' }}>0845 956 888</a></div>
                <div className="lp-fci"><span>✉️</span><a href="mailto:hello@happyhouseielts.com" style={{ color: 'inherit' }}>hello@happyhouseielts.com</a></div>
              </div>
              <div className="lp-footer-col">
                <h4>Chương trình học</h4>
                <div className="lp-flinks">
                  <Link href="/khoa-hoc/cambridge-tieu-hoc">Tiếng Anh trẻ em</Link>
                  <Link href="/khoa-hoc/tieng-anh-tieu-hoc">Tiếng Anh Tiểu học</Link>
                  <Link href="/khoa-hoc/tieng-anh-thcs-thpt">Tiếng Anh THCS</Link>
                  <Link href="/khoa-hoc/on-thi-vao-10">Ôn thi vào 10</Link>
                  <Link href="/khoa-hoc/luyen-thi-ielts">IELTS &amp; mục tiêu nâng cao</Link>
                </div>
              </div>
              <div className="lp-footer-col">
                <h4>Về HappyHouse</h4>
                <div className="lp-flinks">
                  <a href="#gioi-thieu" onClick={scrollTo('gioi-thieu')}>Giới thiệu</a>
                  <a href="#giao-vien"  onClick={scrollTo('giao-vien')}>Đội ngũ giáo viên</a>
                  <a href="#hinh-anh"   onClick={scrollTo('hinh-anh')}>Hình ảnh lớp học</a>
                  <a href="#phu-huynh"  onClick={scrollTo('phu-huynh')}>Phụ huynh chia sẻ</a>
                  <a href="#act">Hoạt động &amp; bài viết</a>
                </div>
              </div>
              <div className="lp-footer-col">
                <h4>Hỗ trợ</h4>
                <div className="lp-flinks">
                  <a href="#consult"    onClick={scrollTo('consult')}>Đăng ký tư vấn</a>
                  <a href="#test-entry" onClick={scrollTo('test-entry')}>Kiểm tra trình độ</a>
                  <Link href="/portal/login">Cổng học viên</Link>
                  <a href="#">Chính sách bảo mật</a>
                  <a href="tel:0845956888">Liên hệ</a>
                </div>
              </div>
            </div>
            <div className="lp-footer-bottom">
              <div>© 2025 HappyHouse English Center. All rights reserved.</div>
              <div className="lp-fsocial">
                <a href="#" title="Facebook" aria-label="Facebook">f</a>
                <a href="#" title="YouTube"  aria-label="YouTube">▶</a>
                <a href="#" title="Zalo"     aria-label="Zalo">Z</a>
                <a href="#" title="TikTok"   aria-label="TikTok">♪</a>
              </div>
            </div>
          </div>
        </footer>

        {/* ── Floating Contact Buttons ── */}
        <div className="lp-sticky" role="complementary" aria-label="Liên hệ nhanh">
          <div className="lp-sticky-row">
            <span className="lp-sticky-tip">Gọi ngay</span>
            <a className="lp-sticky-btn lp-sticky-ph" href="tel:0845956888" aria-label="Gọi điện">📞</a>
          </div>
          <div className="lp-sticky-row">
            <span className="lp-sticky-tip">Chat Zalo</span>
            <a className="lp-sticky-btn lp-sticky-za" href="#" aria-label="Chat Zalo">Z</a>
          </div>
          <div className="lp-sticky-row">
            <span className="lp-sticky-tip">Lên đầu trang</span>
            <button
              className="lp-sticky-btn lp-sticky-tp"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Lên đầu trang"
            >↑</button>
          </div>
        </div>

      </div>
    </>
  )
}
