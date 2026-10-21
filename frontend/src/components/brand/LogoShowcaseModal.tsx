import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { PhorocketLogo, PhorocketSymbol } from './PhorocketLogo';

export const LogoShowcaseModal: React.FC = () => {
  const { isLogoModalOpen, setIsLogoModalOpen, showToast } = useMusic();
  const [copiedVariant, setCopiedVariant] = useState<string | null>(null);

  if (!isLogoModalOpen) return null;

  const copySvgNotice = (variantName: string) => {
    setCopiedVariant(variantName);
    showToast(`Referencia de variante "${variantName}" copiada`);
    setTimeout(() => setCopiedVariant(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={() => setIsLogoModalOpen(false)}
      role="dialog"
      aria-label="Identidad y Variantes de Marca Phorocket"
    >
      <div
        className="w-full max-w-3xl bg-[#0e0c1a] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-[var(--accent-primary)] border border-purple-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">Identidad de Marca Phorocket</h2>
              <p className="text-xs text-slate-400">
                Sistema vectorial original: Cohete estilizado + Onda de audio + Núcleo de vinilo
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLogoModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Brand Concept Manifesto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs">
            <span className="font-semibold text-white block mb-1">01. Cohete Aerodinámico</span>
            <p className="text-slate-400 leading-relaxed">
              Ángulo de empuje a 45 grados representando velocidad, exploración y ascenso musical.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs">
            <span className="font-semibold text-white block mb-1">02. Ondas y Frecuencias</span>
            <p className="text-slate-400 leading-relaxed">
              Ranuras concéntricas y barras de espectro calibradas simbolizando la conexión sonora.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs">
            <span className="font-semibold text-white block mb-1">03. Núcleo Musical</span>
            <p className="text-slate-400 leading-relaxed">
              Centro circular tipo vinilo digital que une la tradición analógica con el futuro cyberpunk.
            </p>
          </div>
        </div>

        {/* 5 Official Variants Grid */}
        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Las 5 Variantes Oficiales del Sistema
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Horizontal Logo */}
            <div className="p-5 rounded-2xl bg-[#141126] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-300">1. Logotipo Horizontal</span>
                  <button
                    onClick={() => copySvgNotice('Horizontal')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedVariant === 'Horizontal' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>Copiar</span>
                  </button>
                </div>
                <div className="h-20 flex items-center justify-center p-2 rounded-xl bg-black/40 border border-white/5">
                  <PhorocketLogo variant="horizontal" size="lg" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Uso principal en barra de navegación superior, cabeceras y portales web.
              </p>
            </div>

            {/* 2. Isotipo para aplicación móvil */}
            <div className="p-5 rounded-2xl bg-[#141126] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-300">2. Isotipo Móvil</span>
                  <button
                    onClick={() => copySvgNotice('Isotipo')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedVariant === 'Isotipo' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>Copiar</span>
                  </button>
                </div>
                <div className="h-20 flex items-center justify-center p-2 rounded-xl bg-black/40 border border-white/5">
                  <PhorocketLogo variant="isotipo" size="xl" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Uso en barras laterales colapsadas, splash screens e interfaces táctiles.
              </p>
            </div>

            {/* 3. Icono Cuadrado Favicon y PWA */}
            <div className="p-5 rounded-2xl bg-[#141126] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-300">3. Icono Favicon & PWA</span>
                  <button
                    onClick={() => copySvgNotice('Favicon')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedVariant === 'Favicon' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>Copiar</span>
                  </button>
                </div>
                <div className="h-20 flex items-center justify-center p-2 rounded-xl bg-black/40 border border-white/5">
                  <PhorocketLogo variant="favicon" size="lg" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Enmarcado de alta densidad para pantalla de inicio en smartphones e instaladores.
              </p>
            </div>

            {/* 4. Variante Monocromática */}
            <div className="p-5 rounded-2xl bg-[#141126] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-300">4. Variante Monocromática</span>
                  <button
                    onClick={() => copySvgNotice('Monocromático')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedVariant === 'Monocromático' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>Copiar</span>
                  </button>
                </div>
                <div className="h-20 flex items-center justify-center p-2 rounded-xl bg-black/40 border border-white/5">
                  <PhorocketLogo variant="monochrome" size="lg" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Para impresión, grabado, sellos vectoriales y documentos de alto contraste.
              </p>
            </div>
          </div>

          {/* 5. Variante Compatible con Fondos Claros */}
          <div className="p-5 rounded-2xl bg-[#ffffff] border border-slate-200 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <PhorocketLogo variant="light" size="lg" />
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 block">5. Variante Fondo Claro</span>
              <p className="text-[11px] text-slate-600">
                Ajuste óptico para papelería o modo de alta luminosidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
