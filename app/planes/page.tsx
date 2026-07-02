import SellerLayout from '@/components/SellerLayout'
import { Check, Zap } from 'lucide-react'

const features: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: 'Publicación de repuestos', free: '5 piezas', pro: 'Ilimitadas' },
  { label: 'Identificación con IA', free: true, pro: true },
  { label: 'Visibilidad en Componenta.cl', free: 'Básica', pro: 'Destacada' },
  { label: 'Dashboard de ventas y métricas', free: 'Acotado', pro: 'Completo' },
  { label: 'Pedidos online con envío', free: true, pro: true },
  { label: 'Página web personalizada', free: false, pro: true },
  { label: 'Catalogación presencial IA', free: false, pro: 'Incluido' },
  { label: 'Publicidad en Facebook Marketplace', free: false, pro: 'Addon +$10 USD' },
  { label: 'Soporte prioritario', free: false, pro: true },
]

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === false) return <span className="text-slate-600 text-sm">—</span>
  if (value === true) return <Check size={16} className="text-blue-700 mx-auto" />
  return <span className="text-sm text-slate-300">{value}</span>
}

export default function PlanesPage() {
  return (
    <SellerLayout section="planes">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-100">Planes</h1>
        <p className="text-sm text-slate-500 mt-0.5">Elige el plan que mejor se adapta a tu negocio</p>
      </div>

      <div className="max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Free */}
          <div className="bg-[#161B22] rounded-2xl border border-white/10 p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Gratuito</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-bold text-slate-100">$0</span>
              <span className="text-sm text-slate-500 mb-1">/mes</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Para probar la plataforma</p>
            <div className="h-px bg-white/10 mb-4" />
            <ul className="space-y-2.5 mb-6">
              {['Hasta 5 repuestos publicados', 'Identificación con IA incluida', 'Recibe pedidos online'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                  <Check size={14} className="text-blue-600 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 rounded-xl border border-white/10 text-sm font-medium text-slate-400 bg-[#21262D]/50 cursor-default">
              Plan actual
            </button>
          </div>

          {/* Pro */}
          <div className="bg-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 bg-[#161B22]/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                <Zap size={10} />
                Recomendado
              </span>
            </div>
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">Pro</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-bold">USD $20</span>
              <span className="text-sm text-blue-200 mb-1">/mes</span>
            </div>
            <p className="text-xs text-blue-200 mb-4">Para desarmadurías activas</p>
            <div className="h-px bg-[#161B22]/20 mb-4" />
            <ul className="space-y-2.5 mb-6">
              {[
                'Repuestos ilimitados',
                'Visibilidad destacada en buscador',
                'Página web en componenta.cl',
                'Dashboard completo con métricas',
                'Catalogación presencial incluida',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-blue-50">
                  <Check size={14} className="text-white flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 rounded-xl bg-[#161B22] text-blue-800 text-sm font-semibold hover:bg-blue-50 transition-colors">
              Contratar Plan Pro
            </button>
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-[#161B22] rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 px-6 py-3 border-b border-white/5 bg-[#21262D]/50">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Funcionalidad</span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Gratuito</span>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide text-center">Pro</span>
          </div>
          <div className="divide-y divide-gray-50">
            {features.map((f) => (
              <div key={f.label} className="grid grid-cols-3 px-6 py-3 items-center">
                <span className="text-sm text-slate-300">{f.label}</span>
                <div className="text-center"><FeatureValue value={f.free} /></div>
                <div className="text-center"><FeatureValue value={f.pro} /></div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Catalogación presencial disponible en Temuco · Addon Facebook Marketplace: +USD $10/mes
        </p>
      </div>
    </SellerLayout>
  )
}
