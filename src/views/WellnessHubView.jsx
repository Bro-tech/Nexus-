import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ArrowRight, Tag, TrendingUp, Apple, Newspaper } from 'lucide-react';

const GLASS = 'panel-soft';

const categories = [
  { id: 'outbreak', label: 'Recent Outbreaks', icon: TrendingUp, color: '#FB923C' },
  { id: 'nutrition', label: 'Nutrition & Food', icon: Apple, color: '#34D399' },
  { id: 'articles', label: 'Medical Articles', icon: Newspaper, color: '#22D3EE' },
];

const articles = [
  {
    id: 1, cat: 'outbreak', readTime: '5 min',
    title: 'Mpox Variant Clade Ib: What You Need to Know',
    excerpt: 'Health authorities are monitoring a new strain spreading across Central Africa with higher transmission rates.',
    tag: '⚠️ Alert', tagColor: '#FB923C',
    photo: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&q=80&auto=format',
    big: true,
  },
  {
    id: 2, cat: 'outbreak', readTime: '3 min',
    title: 'H5N1 Bird Flu: Human Case Reported in India',
    excerpt: 'Officials investigate a new poultry-linked infection as precautionary measures are announced.',
    tag: '🔴 New', tagColor: '#F87171',
    photo: 'https://images.unsplash.com/photo-1611270629569-8b357cb88da9?w=600&q=80&auto=format',
  },
  {
    id: 3, cat: 'nutrition', readTime: '4 min',
    title: 'Turmeric & Gut Health: The Science of Curcumin',
    excerpt: "New research confirms curcumin's role in reducing gut inflammation and improving microbiome diversity.",
    tag: '🌿 Food', tagColor: '#34D399',
    photo: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 4, cat: 'nutrition', readTime: '6 min',
    title: 'Omega-3 Fatty Acids: Dosage Guide for 2026',
    excerpt: 'Updated guidelines from ICMR recommend higher EPA+DHA intake for cardiovascular and cognitive health.',
    tag: '🐟 Nutrition', tagColor: '#22D3EE',
    photo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format',
  },
  {
    id: 5, cat: 'articles', readTime: '7 min',
    title: 'AI in Radiology: 94% Accuracy Now Matches Radiologists',
    excerpt: 'A landmark study shows AI can detect lung nodules and breast cancer with near-identical accuracy.',
    tag: '🤖 AI + Med', tagColor: '#A78BFA',
    photo: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80&auto=format',
    big: true,
  },
  {
    id: 6, cat: 'articles', readTime: '4 min',
    title: 'CRISPR Therapy for Sickle Cell Disease Gets FDA Approval',
    excerpt: 'Gene-editing breakthrough offers a one-time functional cure for sickle cell disease.',
    tag: '🧬 Research', tagColor: '#FB923C',
    photo: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=600&q=80&auto=format',
  },
];

const entrance = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function WellnessHubView() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all' ? articles : articles.filter(a => a.cat === activeCategory);

  return (
    <motion.div variants={entrance} initial="hidden" animate="visible" className="space-y-6 max-w-5xl text-slate-900 dark:text-slate-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30"><BookOpen className="w-6 h-6 text-emerald-400" /></span>
          Wellness & Education Hub
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Stay informed. Outbreaks, nutrition science, and medical breakthroughs.</p>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${activeCategory === 'all' ? 'bg-white/15 border-white/25 text-white' : 'bg-white/5 border-white/8 text-slate-400 hover:border-white/15'}`}
        >
          All Articles
        </motion.button>
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${activeCategory === cat.id
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/8 text-slate-400 hover:border-white/15'
              }`}
          >
            <cat.icon size={14} style={{ color: cat.color }} />
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Standard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((article, i) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
            className={`group ${GLASS} rounded-3xl overflow-hidden cursor-pointer hover:border-white/20 transition-all hover:shadow-xl flex flex-col`}
            whileHover={{ y: -4 }}
          >
            {/* Image */}
            <div className="relative overflow-hidden w-full h-52 flex-shrink-0">
              <img
                src={article.photo}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              {/* Tag badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm"
                style={{ backgroundColor: `${article.tagColor}22`, borderColor: `${article.tagColor}44`, color: article.tagColor }}>
                {article.tag}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-slate-900 dark:text-white font-extrabold text-sm leading-snug mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors uppercase">{article.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed mb-4 flex-1">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime} read</span>
                </div>
                <motion.div whileHover={{ x: 3 }} className="flex items-center gap-1 text-xs font-bold text-cyan-400 cursor-pointer">
                  Read <ArrowRight className="w-3 h-3" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
