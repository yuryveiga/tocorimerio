import React from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import Languages from 'lucide-react/dist/esm/icons/languages';
import Users from 'lucide-react/dist/esm/icons/users';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Route from 'lucide-react/dist/esm/icons/route';
import { ViewFadeIn } from './ViewFadeIn';

export const WhyChooseUs = () => {
  const { t } = useLocale();

  const reasons = [
    {
      icon: Languages,
      title: t('trust_b1_title'),
      desc: t('trust_b1_desc'),
      color: 'text-green-600',
      bg: 'bg-green-600/10'
    },
    {
      icon: Users,
      title: t('trust_b2_title'),
      desc: t('trust_b2_desc'),
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    {
      icon: ShieldCheck,
      title: t('trust_b3_title'),
      desc: t('trust_b3_desc'),
      color: 'text-blue-600',
      bg: 'bg-blue-600/10'
    },
    {
      icon: Route,
      title: t('trust_b4_title'),
      desc: t('trust_b4_desc'),
      color: 'text-emerald-600',
      bg: 'bg-emerald-600/10'
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <ViewFadeIn>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2">
              {t('trust_title')}
            </h2>
            <div className="w-20 h-1 bg-green-600 mx-auto rounded-full" />
          </div>
        </ViewFadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <ViewFadeIn key={index} direction="up">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow h-full">
                <div className={`w-16 h-16 rounded-full ${reason.bg} flex items-center justify-center mb-4`}>
                  <reason.icon className={`w-8 h-8 ${reason.color}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{reason.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            </ViewFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
