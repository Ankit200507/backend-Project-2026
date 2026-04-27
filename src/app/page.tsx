'use client';

import Link from 'next/link';
import { Shield, Map, Users, Lock, ChevronRight, ArrowRight, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    
    // GSAP Animation for hero section
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-hero-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        }
      );
      
      gsap.fromTo(
        '.gsap-bg-glow',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 0.5,
          scale: 1,
          duration: 2,
          ease: 'power2.out',
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.4 + i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#f0f4ff] relative overflow-hidden" ref={containerRef}>
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/10 blur-[120px] pointer-events-none gsap-bg-glow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none gsap-bg-glow" />

      {/* Navbar */}
      <nav className="relative z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight">TerraLedger</span>
          </div>
          <div className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#map" className="hover:text-white transition-colors">Global Map</a>
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <Link href="/signup" className="text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 rounded-lg transition-all hidden sm:block">Sign Up</Link>
            <button className="md:hidden text-gray-400 hover:text-white"><Menu size={24} /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div 
          ref={heroRef}
          className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-12 md:p-20 mb-12 backdrop-blur-sm overflow-hidden"
        >
          {/* Decorative mesh */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

          <div className="relative z-10">
            <div className="gsap-hero-item flex items-center gap-3 mb-6 inline-flex px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Shield size={18} className="text-green-400" />
              <span className="text-sm font-semibold tracking-wider text-green-400 uppercase">
                Secure Land Registry
              </span>
            </div>
            
            <h1 className="gsap-hero-item text-5xl md:text-7xl font-bold mb-6 tracking-tight font-['Space_Grotesk'] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
              TerraLedger
            </h1>
            
            <p className="gsap-hero-item text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
              A secure, role-based land registry with database-backed records, interactive map visualization, and auditable property history. Reimagined for modern trust.
            </p>
            
            <div className="gsap-hero-item flex flex-wrap gap-4">
              <Link href="/signup" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/properties" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-white transition-all hover:border-white/20">
                View Properties
              </Link>
            </div>
          </div>
        </div>

        {/* Mock Map Section */}
        <motion.div 
          id="map"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 relative rounded-3xl overflow-hidden border border-white/10 bg-[#0f1117] group"
        >
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-6 left-6 z-20 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4 max-w-sm">
            <h3 className="text-white font-['Space_Grotesk'] font-bold text-xl mb-1">Global Property Map</h3>
            <p className="text-gray-400 text-sm">Visualize land records in real-time across multiple verified zones and districts.</p>
          </div>
          <div className="w-full h-[400px] md:h-[500px] relative overflow-hidden bg-[#1a1c23]">
            {/* Fake Map Grid & Elements */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-[30%] left-[20%] w-32 h-32 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-green-400 rounded-full shadow-[0_0_15px_#4ade80]" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute top-[45%] right-[25%] w-48 h-24 bg-blue-500/20 border border-blue-500/40 rounded-lg flex items-center justify-center transform rotate-12"
            >
              <div className="w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_15px_#60a5fa]" />
            </motion.div>

            <motion.div 
              animate={{ scale: [1, 1.05, 1] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute bottom-[20%] left-[40%] w-40 h-40 bg-purple-500/20 border border-purple-500/40 rounded-full flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_#c084fc]" />
            </motion.div>
          </div>
        </motion.div>

        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Map, title: "Map-based records", desc: "Visualize properties and boundaries directly on interactive map layers.", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
            { icon: Lock, title: "Server-enforced RBAC", desc: "Admin and user access is enforced by secure session cookies and backend guards.", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
            { icon: Users, title: "Owner-centric workflow", desc: "Each property is linked to an owner profile and maintained through authenticated APIs.", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.border} border`}>
                <feature.icon size={24} className={feature.color} />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3 font-['Space_Grotesk']">{feature.title}</h4>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
