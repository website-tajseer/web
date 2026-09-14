import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ChevronRight,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from 'lucide-react';

type Language = 'en' | 'ar';
type Service = {
  id: string;
  index: string;
  title: string;
  arabicTitle: string;
  intro: string;
  arabicIntro: string;
  description: string;
  arabicDescription: string;
  image: string;
  motif: 'wave' | 'layers' | 'nodes' | 'portal' | 'guide';
};

const logo = '/assets/tajseer/TajsserLogo.bc8c31e3b431f4abdefcf79540d093dc.svg';
const arabicLogo = '/assets/tajseer/arabic-logo.png';

const services: Service[] = [
  {
    id: 'multimedia',
    index: '01',
    title: 'Interactive Multimedia',
    arabicTitle: 'وسائط متعددة تفاعلية',
    intro: 'Give learning a visual rhythm.',
    arabicIntro: 'امنح التعلّم إيقاعاً بصرياً.',
    description:
      'Professional graphic interfaces, user interfaces and interactive activities, with video and audio recordings, animation and motion graphics.',
    arabicDescription:
      'تطوير واجهات رسومية وواجهات مستخدم وأنشطة تفاعلية، مع إنتاج مقاطع الفيديو والتسجيلات الصوتية والرسوم المتحركة والصور المتحركة.',
    image: '/assets/tajseer/Services-04.e08bed473928f5b89731.png',
    motif: 'wave',
  },
  {
    id: 'courses',
    index: '02',
    title: 'E-learning Course Development',
    arabicTitle: 'تطوير المقررات الإلكترونية',
    intro: 'Turn content into a navigable learning world.',
    arabicIntro: 'حوّل المحتوى إلى عالم تعلّم قابل للتنقّل.',
    description:
      'Reliable digital educational materials for computers and smart devices, with learner-oriented interfaces, SCORM compliance and support for publishing on LMS, CMS and MOOCs.',
    arabicDescription:
      'مواد تعليمية رقمية موثوقة لأجهزة الحاسب والأجهزة الذكية، مع رحلة مستخدم تراعي احتياجات المتعلم وتوافق مع معايير SCORM ودعم للنشر على LMS وCMS وMOOCs.',
    image: '/assets/tajseer/Services-06.3e4de635be060c1849df.png',
    motif: 'layers',
  },
  {
    id: 'stem',
    index: '03',
    title: 'STEM Methodology',
    arabicTitle: 'منهجية STEM',
    intro: 'Let ideas branch, connect and become learnable.',
    arabicIntro: 'دع الأفكار تتفرّع وتتصل وتصبح قابلة للتعلّم.',
    description:
      'Courses and educational packages based on the STEM methodology, specialist STEM workshops and educational or instructional design models.',
    arabicDescription:
      'تأليف مقررات وحقائب تعليمية مبنية على منهجية STEM، وتنفيذ ورشات تدريبية متخصصة وإعداد نماذج التصميم التعليمي.',
    image: '/assets/tajseer/Services-08.57f204cc785d1f15406d.png',
    motif: 'nodes',
  },
  {
    id: 'ar-vr',
    index: '04',
    title: 'AR and VR Environments',
    arabicTitle: 'بيئات الواقع المعزز AR والافتراضي VR',
    intro: 'Open a deeper dimension for learning.',
    arabicIntro: 'افتح بُعداً أعمق للتعلّم.',
    description:
      'Design and development of virtual laboratories for technical and vocational education and training using 360 imagery, augmented reality and virtual reality, alongside 2D/3D educational games and holograms in STEM lessons.',
    arabicDescription:
      'تصميم وتطوير مختبرات افتراضية للتعلم المهني باستخدام الصور بزاوية 360 والواقع المعزز AR والواقع الافتراضي VR، إلى جانب الألعاب التعليمية ثنائية وثلاثية الأبعاد وتوظيف الهولوغرام في دروس STEM.',
    image: '/assets/tajseer/Services-10.a9bfe45eb1636e625dcc.png',
    motif: 'portal',
  },
  {
    id: 'training',
    index: '05',
    title: 'Training and Consulting',
    arabicTitle: 'التدريب والاستشارات',
    intro: 'Make the next step easier to see.',
    arabicIntro: 'اجعل الخطوة التالية أوضح.',
    description:
      'Educational consultancy and training-package development, supporting the acquisition of skills and knowledge through interaction with specialized consultants.',
    arabicDescription:
      'الاستشارات التعليمية وتطوير الحقائب التدريبية بما يدعم اكتساب المهارات والمعرفة من خلال التفاعل مع خبرات الاستشاريين المتخصصة.',
    image: '/assets/tajseer/Services-02.750178934cb26bcee01c.png',
    motif: 'guide',
  },
];

const navItems = [
  { id: 'overview', en: 'Overview', ar: 'نظرة عامة' },
  { id: 'services', en: 'Services', ar: 'الخدمات' },
  { id: 'about', en: 'About', ar: 'عن تجسير' },
  { id: 'contact', en: 'Contact', ar: 'تواصل' },
];

function WeaveField({ activeStep, compact = false }: { activeStep: number; compact?: boolean }) {
  const emphasis = Math.min(activeStep, 5);
  return (
    <div className={`weave-field ${compact ? 'weave-field-compact' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 720 600" role="presentation">
        <defs>
          <linearGradient id="strandA" x1="0" x2="1">
            <stop offset="0" stopColor="#1c70bb" />
            <stop offset=".55" stopColor="#51dbe1" />
            <stop offset="1" stopColor="#8fe1c7" />
          </linearGradient>
          <linearGradient id="strandB" x1="0" x2="1">
            <stop offset="0" stopColor="#2478d3" />
            <stop offset=".6" stopColor="#8ad9ef" />
            <stop offset="1" stopColor="#55c5ae" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="360" cy="300" r={compact ? 112 : 140} fill="rgba(59, 189, 215, .025)" stroke="rgba(111, 217, 225, .22)" />
        <circle cx="360" cy="300" r={compact ? 78 : 104} fill="none" stroke="rgba(111, 217, 225, .1)" strokeDasharray="2 14" />
        <g fill="none" strokeLinecap="round">
          <path className="weave-line slow" d="M-40 154 C126 112 130 492 305 370 S450 82 760 162" stroke="url(#strandA)" strokeWidth="3.2" opacity={emphasis >= 1 ? .82 : .35} />
          <path className="weave-line" d="M-50 416 C90 412 135 161 290 252 S430 474 770 354" stroke="url(#strandB)" strokeWidth="5" opacity={emphasis >= 2 ? .83 : .3} />
          <path className="weave-line fast" d="M-20 270 C116 302 175 122 318 186 S514 407 748 438" stroke="#3bc6d4" strokeWidth="2" opacity={emphasis >= 3 ? .85 : .25} />
          <path className="weave-line slow" d="M-20 514 C142 459 190 404 312 415 S480 211 744 90" stroke="#72d9bd" strokeWidth="8" opacity={emphasis >= 4 ? .7 : .2} />
          <path className="weave-line" d="M-20 78 C146 187 198 321 348 301 S501 148 750 510" stroke="#2f78cb" strokeWidth="2.5" opacity={emphasis >= 5 ? .9 : .24} />
        </g>
        <g filter="url(#softGlow)">
          {[{x:305,y:370},{x:290,y:252},{x:318,y:186},{x:312,y:415},{x:348,y:301}].map((point, i) => (
            <circle key={i} className="signal-orb" cx={point.x} cy={point.y} r={i === 4 ? 10 : 5} fill={i === 4 ? '#9ce5cf' : '#63dce5'} opacity={emphasis > i ? .98 : .35} />
          ))}
        </g>
        <g className="weave-symbol" transform="translate(314 255) scale(.09)" opacity={emphasis >= 5 ? .85 : .45}>
          <circle cx="0" cy="0" r="520" fill="none" stroke="#a7e3dd" strokeWidth="48" />
          <path d="M410 270 645 355 475 440Z" fill="#65d7de" />
          <path d="M0-260v440M-205-160h410M-205 160h270" stroke="#65d7de" strokeWidth="45" strokeLinecap="round" />
        </g>
      </svg>
      <div className="weave-caption">
        <span>Knowledge weave</span>
        <span className="font-mono-brand">{String(emphasis).padStart(2, '0')} / 05</span>
      </div>
    </div>
  );
}

function Motif({ type }: { type: Service['motif'] }) {
  if (type === 'wave') {
    return <div className="motif motif-wave"><span /><span /><span /><span /><span /><span /><span /></div>;
  }
  if (type === 'layers') {
    return <div className="motif motif-layers"><i /><i /><i /></div>;
  }
  if (type === 'nodes') {
    return <div className="motif motif-nodes"><span /><span /><span /><span /><b /><b /><b /></div>;
  }
  if (type === 'portal') {
    return <div className="motif motif-portal"><div /><div /><div /></div>;
  }
  return <div className="motif motif-guide"><i /><i /><i /><i /></div>;
}

function App() {
  const [lang, setLang] = useState<Language>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('overview');
  const [activeStep, setActiveStep] = useState(0);
  const [reduced, setReduced] = useState(false);
  const contactRef = useRef<HTMLElement | null>(null);
  const isAr = lang === 'ar';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduced(motionQuery.matches);
    updateMotion();
    motionQuery.addEventListener('change', updateMotion);
    const sections = ['overview', 'services', ...services.map((service) => service.id), 'about', 'contact'];
    const onScroll = () => {
      const current = sections.reduce((best, id) => {
        const element = document.getElementById(id);
        if (!element) return best;
        const distance = Math.abs(element.getBoundingClientRect().top - 150);
        return distance < best.distance ? { id, distance } : best;
      }, { id: 'overview', distance: Number.POSITIVE_INFINITY });
      setActive(current.id);
      const serviceIndex = services.findIndex((service) => service.id === current.id);
      setActiveStep(serviceIndex >= 0 ? serviceIndex + 1 : current.id === 'about' || current.id === 'contact' ? 5 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      motionQuery.removeEventListener('change', updateMotion);
    };
  }, [isAr, lang]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const copy = isAr
    ? {
        kicker: 'تجسير الفكر · المملكة العربية السعودية',
        heroTitle: 'نصل المعرفة بالتجربة.',
        heroBody: 'تجسير شركة متخصصة في تطوير المقررات الإلكترونية والتعلم والتدريب عن بعد والواقع الافتراضي ومنهجية STEM والاستشارات التعليمية والتربوية.',
        begin: 'ابدأ الرحلة',
        orientation: 'خمس قدرات. تجربة تعلم واحدة.',
        servicesKicker: 'الخدمات · خيوط المعرفة',
        servicesTitle: 'حين تتصل القدرات، يصبح التعلم أكثر تفاعلاً.',
        servicesBody: 'حلول تعليمية رقمية وواقعية وافتراضية، مبنية حول احتياجات التعلم والتدريب.',
        aboutKicker: 'وقفة · عن تجسير',
        aboutTitle: 'نبني مساحة يتسع فيها التعليم.',
        aboutBody: 'تجسير الفكر شركة متخصصة في تطوير المقررات الإلكترونية والتعلم والتدريب عن بعد والواقع الافتراضي ومنهجية ستيم والاستشارات التعليمية والتربوية. نشأت في المملكة العربية السعودية عام 2009، وتعمل على التخطيط والتنفيذ والتطوير والبرمجة لمشاريع التعليم الإلكتروني والتعلم عن بعد.',
        missionLabel: 'الرسالة',
        mission: 'نسعى جاهدين لتوفير بيئة تعلم تفاعلية لأكبر شريحة من المجتمع باستخدام أحدث التقنيات البرمجية لكسر حاجز وروتين القاعات الدراسية وذلك بتلبية الطموحات والتطلعات المستقبلية للتعليم.',
        visionLabel: 'الرؤية',
        vision: 'المساهمة في تعزيز المستوى التعليمي والأكاديمي في المؤسسات التعليمية لمواكبة العصر وتطوير العملية التعليمية.',
        contactKicker: 'الخطوة التالية',
        contactTitle: 'لنبنِ تجربة تعلم واضحة معاً.',
        contactBody: 'تواصلوا مع تجسير عبر القنوات المنشورة. سنبدأ من السؤال، ثم نصل القدرات بما يحتاجه التعلم.',
        find: 'موقعنا',
        call: 'اتصل بنا',
        email: 'البريد الإلكتروني',
        location: 'الرياض - شارع العليا',
        footer: '© 2024 تجسير، جميع الحقوق محفوظة.',
      }
    : {
        kicker: 'Tajseer Al Fikr · Saudi Arabia',
        heroTitle: 'Where knowledge meets experience.',
        heroBody: 'Tajseer is a company specialized in e-learning course development, distance learning and training, virtual reality, STEM methodology and educational consultancy.',
        begin: 'Enter the weave',
        orientation: 'Five capabilities. One learning experience.',
        servicesKicker: 'Services · The knowledge weave',
        servicesTitle: 'When capabilities connect, learning becomes more interactive.',
        servicesBody: 'Digital, real and virtual learning solutions shaped around the needs of education and training.',
        aboutKicker: 'A quiet pause · About Tajseer',
        aboutTitle: 'We make room for education to grow.',
        aboutBody: 'Tajseer is a company specialized in the development of e-learning courses, distance learning and training, virtual reality, STEM methodology and training or educational consultancy. Since its inception in the Kingdom of Saudi Arabia in 2009, the company has planned, implemented, developed and programmed e-learning and distance-learning projects.',
        missionLabel: 'Mission',
        mission: 'We strive to provide an interactive learning environment for the largest segment of society by using the latest software technologies to break the barrier and routine of classrooms by meeting the future aspirations for education.',
        visionLabel: 'Vision',
        vision: 'Play a unique role in enhancing the educational and academic level in educational institutions to keep pace with the vast variety in educational process.',
        contactKicker: 'The next step',
        contactTitle: 'Let’s shape a clear learning experience.',
        contactBody: 'Reach Tajseer through the published channels. Start with the question, and we will connect the right capabilities to the learning need.',
        find: 'Find us',
        call: 'Call us',
        email: 'Email',
        location: 'Riyadh - Olaya Street',
        footer: '© 2024 Tajseer, All Rights Reserved.',
      };

  return (
    <div className={`site-shell noise ${reduced ? 'reduced-motion' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      <header className="fixed inset-x-0 top-0 z-40 px-4 py-4 sm:px-7 lg:px-10">
        <nav className="glass-nav mx-auto flex max-w-[1380px] items-center justify-between rounded-full px-4 py-3 sm:px-5" aria-label="Primary navigation">
          <button className="flex items-center" onClick={() => scrollTo('overview')} data-testid="button-logo-overview" aria-label="Tajseer overview">
            <img src={isAr ? arabicLogo : logo} alt="Tajseer" className="h-8 w-auto object-contain sm:h-9" />
          </button>
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`font-mono-brand text-[10px] uppercase tracking-[.18em] transition-colors ${active === item.id ? 'text-[#82e6e9]' : 'text-slate-300 hover:text-white'}`}
                data-testid={`button-nav-${item.id}`}
              >
                {isAr ? item.ar : item.en}
              </button>
            ))}
            <button onClick={() => setLang(isAr ? 'en' : 'ar')} aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'} className="rounded-full border border-[#75d6dc]/40 px-3 py-1.5 font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#9de8e7] transition-colors hover:bg-[#75d6dc]/10" data-testid="button-language-toggle">
              {isAr ? 'EN' : 'AR'}
            </button>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setLang(isAr ? 'en' : 'ar')} aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'} className="rounded-full border border-[#75d6dc]/40 px-3 py-1.5 font-mono-brand text-[10px] tracking-[.18em] text-[#9de8e7]" data-testid="button-language-toggle-mobile">{isAr ? 'EN' : 'AR'}</button>
            <button onClick={() => setMenuOpen((open) => !open)} className="rounded-full border border-white/15 p-2 text-slate-200" aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-menu-toggle">
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="glass-nav mx-1 mt-2 rounded-3xl p-3 md:hidden">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/10" data-testid={`button-mobile-nav-${item.id}`}>
                <span>{isAr ? item.ar : item.en}</span><ChevronRight size={15} className={isAr ? 'rotate-180' : ''} />
              </button>
            ))}
          </div>
        )}
      </header>

      <aside className={`fixed ${isAr ? 'left-5' : 'right-5'} top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex`} aria-label={isAr ? 'تقدم الرحلة' : 'Journey progress'}>
        <span className="mb-1 font-mono-brand text-[9px] tracking-[.2em] text-slate-500">/ 05</span>
        {['overview', ...services.map((service) => service.id), 'about', 'contact'].map((id, index) => (
          <button key={id} onClick={() => scrollTo(id)} className={`group relative flex items-center justify-center p-1`} data-testid={`button-progress-${id}`} aria-label={isAr ? `الانتقال إلى ${id === 'overview' ? 'نظرة عامة' : id === 'about' ? 'عن تجسير' : id === 'contact' ? 'تواصل' : services.find((service) => service.id === id)?.arabicTitle ?? id}` : `Go to ${id}`}>
            <span className={`block rounded-full transition-all ${active === id ? 'h-2.5 w-2.5 bg-[#70dfe3]' : 'h-1.5 w-1.5 bg-slate-600 group-hover:bg-slate-300'}`} />
            {active === id && <span className={`absolute ${isAr ? 'left-5' : 'right-5'} whitespace-nowrap font-mono-brand text-[9px] uppercase tracking-[.16em] text-[#8ce5e5]`}>{index === 0 ? (isAr ? 'البداية' : 'start') : index <= 5 ? `0${index}` : id}</span>}
          </button>
        ))}
      </aside>

      <main>
        <section id="overview" className="chapter-section relative min-h-[760px] overflow-hidden bg-[#071022] px-5 pb-20 pt-36 sm:px-10 lg:min-h-[900px] lg:px-16 lg:pt-48">
          <div className="hero-grid absolute inset-0 opacity-80" />
          <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-[#075c87]/20 blur-3xl" />
          <div className="relative z-10 mx-auto grid max-w-[1380px] items-center gap-10 lg:grid-cols-[minmax(340px,.84fr)_1.16fr]">
            <div className="hero-copy max-w-2xl">
              <div className="mb-8 flex items-center gap-3">
                <span className="eyebrow">{copy.kicker}</span>
                <span className="h-px w-16 bg-[#57d6df]/60" />
              </div>
              <h1 className="max-w-3xl text-[clamp(3.5rem,8vw,8.3rem)] font-semibold leading-[.94] tracking-[-.07em] text-[#e9fbfc]">{copy.heroTitle}</h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-[#b5c9d3] sm:text-lg">{copy.heroBody}</p>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <button onClick={() => scrollTo('services')} className="group flex items-center gap-3 rounded-full bg-[#83e2df] px-5 py-3 text-sm font-semibold text-[#071022] transition-transform hover:-translate-y-0.5" data-testid="button-enter-weave">
                  {copy.begin}<ArrowDown size={16} className="transition-transform group-hover:translate-y-1" />
                </button>
                <span className="font-mono-brand text-[10px] uppercase tracking-[.16em] text-slate-500">{copy.orientation}</span>
              </div>
            </div>
            <div className="hero-copy relative min-h-[390px] sm:min-h-[500px]">
              <WeaveField activeStep={activeStep} />
              <div className="absolute bottom-0 left-0 rounded-full border border-white/10 bg-[#08162a]/70 px-4 py-2 font-mono-brand text-[10px] uppercase tracking-[.2em] text-slate-400 backdrop-blur-sm">
                {isAr ? 'نظام المعرفة' : 'A spatial learning system'}
              </div>
            </div>
          </div>
          <div className="absolute bottom-7 left-5 flex items-center gap-3 font-mono-brand text-[9px] uppercase tracking-[.22em] text-slate-600 sm:left-10 lg:left-16">
            <span className="h-8 w-px bg-[#69dbe1]" />01 · {isAr ? 'الهوية' : 'identity'}
          </div>
        </section>

        <section id="services" className="chapter-section relative bg-[#0a172b] px-5 py-24 text-[#e9fbfc] sm:px-10 lg:px-16 lg:py-36">
          <div className="mx-auto max-w-[1380px]">
            <div className="mb-20 grid gap-10 lg:grid-cols-[.55fr_1fr] lg:items-end">
              <div><span className="eyebrow">{copy.servicesKicker}</span></div>
              <div>
                <h2 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl">{copy.servicesTitle}</h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[#9eb5c2]">{copy.servicesBody}</p>
              </div>
            </div>
            <div className="grid gap-12 lg:grid-cols-[minmax(240px,.55fr)_1fr]">
              <div className="hidden lg:block">
                <div className="sticky top-32">
                  <WeaveField activeStep={activeStep} compact />
                  <div className="mt-2 flex items-center gap-2 font-mono-brand text-[10px] uppercase tracking-[.2em] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-[#75e0dc]" />{isAr ? 'مسار القدرات' : 'Capability path'}</div>
                </div>
              </div>
              <div className="space-y-24 sm:space-y-32">
                {services.map((service, index) => (
                  <article id={service.id} key={service.id} className={`service-chapter chapter-section grid items-center gap-10 md:grid-cols-[.8fr_1.2fr] ${index % 2 ? 'md:grid-cols-[1.2fr_.8fr]' : ''}`}>
                    <div className={`${index % 2 ? 'md:order-2' : ''}`}>
                      <div className="mb-7 flex items-center gap-4">
                        <span className="font-mono-brand text-xs text-[#69dfe2]">{service.index}</span>
                        <span className="h-px w-12 bg-[#69dfe2]/40" />
                        <span className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-slate-500">{isAr ? 'خيط من الخمسة' : 'one of five strands'}</span>
                      </div>
                      <h3 className="text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">{isAr ? service.arabicTitle : service.title}</h3>
                      <p className="mt-5 text-xl leading-8 text-[#85e2df]">{isAr ? service.arabicIntro : service.intro}</p>
                      <p className="service-copy mt-6 text-[15px] leading-8 text-[#a9bdc7]">{isAr ? service.arabicDescription : service.description}</p>
                      <button onClick={() => contactRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })} className="mt-8 inline-flex items-center gap-2 border-b border-[#72dde0]/50 pb-2 text-sm text-[#b8eff0] transition-colors hover:border-[#b8eff0]" data-testid={`button-service-contact-${service.id}`}>
                        {isAr ? 'ناقش احتياجك' : 'Discuss a learning need'}<ArrowUpRight size={15} />
                      </button>
                    </div>
                    <div className={`${index % 2 ? 'md:order-1' : ''}`}>
                      <div className={`service-art relative overflow-hidden rounded-[2rem] border border-[#72bbd0]/25 bg-[#0c2c4b] p-3 ${service.motif === 'portal' ? 'portal-frame' : ''}`}>
                        <img src={service.image} alt="" className="relative z-10 aspect-[1.72] w-full rounded-[1.5rem] object-cover opacity-80 mix-blend-screen" />
                        <div className="absolute inset-0 z-20 grid place-items-center"><Motif type={service.motif} /></div>
                        <div className="absolute bottom-6 left-6 z-20 font-mono-brand text-[9px] uppercase tracking-[.18em] text-white/60">{isAr ? service.arabicTitle : service.title}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="chapter-section relative overflow-hidden bg-[#edf2f1] px-5 py-28 text-[#0b2940] sm:px-10 lg:px-16 lg:py-44">
          <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-[#a7dfd6]/25 blur-3xl" />
          <div className="relative mx-auto max-w-[1180px]">
            <div className="grid gap-14 lg:grid-cols-[.42fr_1fr]">
              <div><span className="eyebrow !text-[#167f9a]">{copy.aboutKicker}</span><div className="mt-12 hidden h-32 w-px bg-[#9acfcf] lg:block" /></div>
              <div>
                <h2 className="max-w-4xl text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-7xl">{copy.aboutTitle}</h2>
                <p className="mt-9 max-w-3xl text-lg leading-9 text-[#416275]">{copy.aboutBody}</p>
                <div className="mt-20 grid gap-14 border-t border-[#b6cecf] pt-8 md:grid-cols-2">
                  <div><span className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#147c96]">{copy.missionLabel}</span><p className="mt-5 text-2xl font-medium leading-9 tracking-[-.025em]">{copy.mission}</p></div>
                  <div><span className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#147c96]">{copy.visionLabel}</span><p className="mt-5 text-2xl font-medium leading-9 tracking-[-.025em]">{copy.vision}</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={contactRef} id="contact" className="chapter-section relative overflow-hidden bg-[#071022] px-5 py-28 text-[#ecfbfb] sm:px-10 lg:px-16 lg:py-40">
          <div className="absolute inset-0 opacity-35"><WeaveField activeStep={5} compact /></div>
          <div className="relative mx-auto max-w-[1180px]">
            <div className="grid gap-14 lg:grid-cols-[1fr_.72fr] lg:items-end">
              <div>
                <span className="eyebrow">{copy.contactKicker}</span>
                <h2 className="mt-8 max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-7xl">{copy.contactTitle}</h2>
                <p className="mt-7 max-w-xl text-base leading-8 text-[#a8bec8]">{copy.contactBody}</p>
              </div>
              <div className="space-y-7 border-t border-white/15 pt-7 lg:border-t-0 lg:border-s-1 lg:ps-9">
                <a href="https://www.google.com/maps/place/%D8%AA%D8%AC%D8%B3%D9%8A%D8%B1+%D8%A7%D9%84%D9%81%D9%83%D8%B1" target="_blank" rel="noreferrer" className="group flex items-start gap-4" data-testid="link-contact-location">
                  <MapPin size={18} className="mt-1 shrink-0 text-[#74dfe1]" /><span><small className="font-mono-brand text-[10px] uppercase tracking-[.15em] text-slate-500">{copy.find}</small><strong className="mt-2 block text-lg font-medium text-[#e8f8f8] group-hover:text-[#83e2df]">{copy.location}</strong></span><ArrowUpRight size={15} className="ms-auto mt-1 text-slate-500" />
                </a>
                <div className="flex items-start gap-4"><Phone size={18} className="mt-1 shrink-0 text-[#74dfe1]" /><span><small className="font-mono-brand text-[10px] uppercase tracking-[.15em] text-slate-500">{copy.call}</small><span className="mt-2 flex flex-col gap-1 font-mono-brand text-sm text-[#e8f8f8]"><a href="tel:00966114621717" data-testid="link-phone-1">00966-114-621-717</a><a href="tel:00966545992326" data-testid="link-phone-2">00966-545-992-326</a><a href="tel:0096611247121" data-testid="link-phone-3">00966-11-247-121</a></span></span></div>
                <a href="mailto:private@tajseerksa.com" className="flex items-start gap-4 group" data-testid="link-contact-email"><Mail size={18} className="mt-1 shrink-0 text-[#74dfe1]" /><span><small className="font-mono-brand text-[10px] uppercase tracking-[.15em] text-slate-500">{copy.email}</small><strong className="mt-2 block font-mono-brand text-sm font-medium text-[#e8f8f8] group-hover:text-[#83e2df]">private@tajseerksa.com</strong></span></a>
              </div>
            </div>
             <footer className="mt-28 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 font-mono-brand text-[10px] uppercase tracking-[.15em] text-slate-500 sm:flex-row"><span>{copy.footer}</span><span>Tajseer · {isAr ? 'خيوط المعرفة' : 'Knowledge Weave'}</span></footer>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;