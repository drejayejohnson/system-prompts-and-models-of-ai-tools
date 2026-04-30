import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
            🌸
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-white">Poppy</h1>
            <p className="text-sm text-slate-400">AI Content Studio</p>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Content that sounds{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            exactly like you
          </span>
        </h2>
        <p className="text-lg text-slate-300 mb-10 leading-relaxed">
          Upload your writing samples, build your brand voice profile, and generate
          blog posts, social captions, scripts, and emails — all in your authentic style.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/brand"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg text-base"
          >
            ✨ Set Up Your Brand Voice
          </Link>
          <Link
            href="/canvas"
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all border border-white/20 text-base"
          >
            🎨 Open Canvas
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-16 text-left">
          {[
            {
              icon: '🧠',
              title: 'Brand Voice AI',
              desc: 'Upload docs, PDFs, or paste samples. Claude learns your tone, vocabulary, and style.',
            },
            {
              icon: '🎨',
              title: 'Visual Canvas',
              desc: 'Organize ideas on a drag-and-drop canvas. Connect prompts to generated content.',
            },
            {
              icon: '⚡',
              title: '12 Content Types',
              desc: 'Blog posts, LinkedIn, Instagram, TikTok scripts, emails, ad copy, and more.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
