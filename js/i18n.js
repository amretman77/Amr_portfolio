/* ==========================================================================
   i18n.js — English + Arabic UI strings and language switching.
   Data strings are translated via Site.t(value); UI labels via
   Site.str(key). Arabic flips <html lang dir> to rtl automatically.
   ========================================================================== */
(function () {
  'use strict';

  var Site = (window.Site = window.Site || {});

  var UI_STRINGS = {
    en: {
      common: {
        skipToContent: 'Skip to content',
        loading: 'Loading…',
        backToTop: 'Back to top',
        search: 'Search',
        close: 'Close',
        copy: 'Copy',
        copied: 'Copied to clipboard',
        download: 'Download',
        external: 'opens in a new tab',
        menu: 'Open menu',
        theme: 'Toggle theme',
        language: 'Switch language',
        github: 'GitHub',
        linkedin: 'LinkedIn',
        x: 'X (Twitter)',
        kaggle: 'Kaggle',
        medium: 'Medium',
        youtube: 'YouTube',
        globe: 'Website',
        email: 'Email',
        phone: 'Phone',
        location: 'Location',
        website: 'Website',
        liveDemo: 'Live demo',
        caseStudy: 'Case study',
        sourceCode: 'Source code',
        viewProject: 'View project details',
        viewAll: 'View all',
        required: 'required'
      },
      nav: {
        about: 'About',
        focus: 'Focus',
        skills: 'Skills',
        projects: 'Projects',
        research: 'Research',
        experience: 'Experience',
        writing: 'Writing',
        contact: 'Contact',
        primary: 'Primary navigation'
      },
      sections: {
        about: 'About',
        focus: 'Focus areas',
        skills: 'Skills',
        projects: 'Selected projects',
        research: 'Research & interests',
        experience: 'Experience & education',
        writing: 'Writing',
        contact: 'Get in touch'
      },
      hero: {
        greeting: "Hello, I'm",
        viewProjects: 'View projects',
        downloadCv: 'Download CV',
        contact: 'Get in touch'
      },
      about: {
        currently: 'Currently',
        building: 'Building',
        learning: 'Learning',
        reading: 'Reading'
      },
      skills: {
        filterPlaceholder: 'Filter skills…',
        filterLabel: 'Filter skills',
        learning: 'Currently learning',
        empty: 'No skills match your filter.'
      },
      projects: {
        searchPlaceholder: 'Search projects…',
        searchLabel: 'Search projects',
        all: 'All',
        sortLabel: 'Sort projects',
        featured: 'Featured',
        newest: 'Newest',
        az: 'A–Z',
        count: '{count} projects',
        countOne: '1 project',
        emptyTitle: 'No projects found',
        emptyMessage: 'Try a different search term or clear the filters.',
        clearFilters: 'Clear filters',
        viewAll: 'View all projects',
        featuredTag: 'Featured',
        modal: {
          overview: 'Overview',
          role: 'Role',
          timeline: 'Timeline',
          category: 'Category',
          status: 'Status',
          highlights: 'Highlights',
          tech: 'Tech stack',
          problem: 'Problem',
          approach: 'Approach',
          result: 'Result',
          links: 'Links'
        }
      },
      research: {
        collaborate: 'Open to collaboration',
        cta: 'Work with me'
      },
      experience: {
        experience: 'Experience',
        education: 'Education',
        courses: 'Courses & certificates',
        current: 'Current'
      },
      writing: {
        latest: 'Latest writing',
        readingTime: 'min read',
        searchPlaceholder: 'Search posts…',
        emptyTitle: 'No posts yet',
        emptyMessage: 'New writing will appear here once it is published.'
      },
      contact: {
        formTitle: 'Send a message',
        name: 'Name',
        namePlaceholder: 'Your name',
        email: 'Email',
        emailPlaceholder: 'you@example.com',
        message: 'Message',
        messagePlaceholder: 'Tell me a little about what you have in mind…',
        send: 'Send message',
        sending: 'Sending…',
        sent: 'Message ready — your email client should open.',
        sentEndpoint: 'Thanks! Your message has been sent.',
        error: 'Something went wrong. Please email me directly instead.',
        copyMessage: 'Copy message',
        responseTime: 'Response time',
        formNote: 'This form opens your email client — no data is stored on this site.',
        honey: 'Leave this field empty',
        intro: 'Have a question or want to collaborate? Feel free to reach out.'
      },
      footer: {
        rights: 'All rights reserved.',
        backToTop: 'Back to top'
      },
      palette: {
        title: 'Command palette',
        placeholder: 'Search sections, projects, actions…',
        noResults: 'No results',
        sections: 'Sections',
        projects: 'Projects',
        posts: 'Writing',
        actions: 'Actions',
        hint: 'Type to search',
        navigate: 'to navigate',
        select: 'to select',
        close: 'to close',
        copyEmail: 'Copy email address',
        toggleTheme: 'Toggle dark mode',
        switchLanguage: 'Switch language',
        openGithub: 'Open GitHub profile',
        downloadCv: 'Download CV',
        openContact: 'Go to contact'
      },
      status: {
        completed: 'Completed',
        'in progress': 'In progress',
        archived: 'Archived',
        'active focus': 'Active focus',
        exploring: 'Exploring'
      }
    },

    ar: {
      common: {
        skipToContent: 'تخطَّ إلى المحتوى',
        loading: 'جارٍ التحميل…',
        backToTop: 'العودة للأعلى',
        search: 'بحث',
        close: 'إغلاق',
        copy: 'نسخ',
        copied: 'تم النسخ إلى الحافظة',
        download: 'تحميل',
        external: 'يفتح في تبويب جديد',
        menu: 'فتح القائمة',
        theme: 'تبديل المظهر',
        language: 'تغيير اللغة',
        github: 'GitHub',
        linkedin: 'LinkedIn',
        x: 'X (تويتر)',
        kaggle: 'Kaggle',
        medium: 'Medium',
        youtube: 'YouTube',
        globe: 'الموقع الشخصي',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        location: 'الموقع',
        website: 'الموقع الشخصي',
        liveDemo: 'عرض مباشر',
        caseStudy: 'دراسة الحالة',
        sourceCode: 'الكود المصدري',
        viewProject: 'عرض تفاصيل المشروع',
        viewAll: 'عرض الكل',
        required: 'مطلوب'
      },
      nav: {
        about: 'نبذة',
        focus: 'مجالات التركيز',
        skills: 'المهارات',
        projects: 'المشاريع',
        research: 'الاهتمامات',
        experience: 'الخبرة',
        writing: 'المقالات',
        contact: 'تواصل',
        primary: 'التنقل الرئيسي'
      },
      sections: {
        about: 'نبذة عني',
        focus: 'مجالات التركيز',
        skills: 'المهارات',
        projects: 'مشاريع مختارة',
        research: 'الاهتمامات البحثية',
        experience: 'الخبرة والتعليم',
        writing: 'المقالات',
        contact: 'تواصل معي'
      },
      hero: {
        greeting: 'أهلاً، أنا',
        viewProjects: 'عرض المشاريع',
        downloadCv: 'تحميل السيرة الذاتية',
        contact: 'تواصل معي'
      },
      about: {
        currently: 'حالياً',
        building: 'أبني',
        learning: 'أتعلم',
        reading: 'أقرأ'
      },
      skills: {
        filterPlaceholder: 'ابحث في المهارات…',
        filterLabel: 'تصفية المهارات',
        learning: 'أتعلم حالياً',
        empty: 'لا توجد مهارات مطابقة لبحثك.'
      },
      projects: {
        searchPlaceholder: 'ابحث في المشاريع…',
        searchLabel: 'بحث في المشاريع',
        all: 'الكل',
        sortLabel: 'ترتيب المشاريع',
        featured: 'المميزة',
        newest: 'الأحدث',
        az: 'أبجدياً',
        count: '{count} مشاريع',
        countOne: 'مشروع واحد',
        emptyTitle: 'لا توجد مشاريع',
        emptyMessage: 'جرّب كلمة بحث أخرى أو امسح عوامل التصفية.',
        clearFilters: 'مسح التصفية',
        viewAll: 'عرض كل المشاريع',
        featuredTag: 'مميز',
        modal: {
          overview: 'نظرة عامة',
          role: 'الدور',
          timeline: 'الفترة',
          category: 'الفئة',
          status: 'الحالة',
          highlights: 'أبرز النقاط',
          tech: 'التقنيات',
          problem: 'المشكلة',
          approach: 'المنهجية',
          result: 'النتيجة',
          links: 'الروابط'
        }
      },
      research: {
        collaborate: 'منفتح للتعاون',
        cta: 'لنعمل معاً'
      },
      experience: {
        experience: 'الخبرة',
        education: 'التعليم',
        courses: 'الدورات والشهادات',
        current: 'حالي'
      },
      writing: {
        latest: 'أحدث المقالات',
        readingTime: 'دقيقة قراءة',
        searchPlaceholder: 'ابحث في المقالات…',
        emptyTitle: 'لا توجد مقالات بعد',
        emptyMessage: 'ستظهر المقالات الجديدة هنا عند نشرها.'
      },
      contact: {
        formTitle: 'أرسل رسالة',
        name: 'الاسم',
        namePlaceholder: 'اسمك',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'you@example.com',
        message: 'الرسالة',
        messagePlaceholder: 'أخبرني قليلاً عمّا تفكر فيه…',
        send: 'إرسال الرسالة',
        sending: 'جارٍ الإرسال…',
        sent: 'الرسالة جاهزة — سيُفتح تطبيق البريد لديك.',
        sentEndpoint: 'شكراً! تم إرسال رسالتك.',
        error: 'حدث خطأ ما. يرجى مراسلتي مباشرة عبر البريد.',
        copyMessage: 'نسخ الرسالة',
        responseTime: 'وقت الرد',
        formNote: 'هذا النموذج يفتح تطبيق البريد لديك — لا تُخزَّن أي بيانات على الموقع.',
        honey: 'اترك هذا الحقل فارغاً',
        intro: 'لديك سؤال أو تريد التعاون؟ لا تتردد في التواصل.'
      },
      footer: {
        rights: 'جميع الحقوق محفوظة.',
        backToTop: 'العودة للأعلى'
      },
      palette: {
        title: 'لوحة الأوامر',
        placeholder: 'ابحث في الأقسام والمشاريع والأوامر…',
        noResults: 'لا توجد نتائج',
        sections: 'الأقسام',
        projects: 'المشاريع',
        posts: 'المقالات',
        actions: 'الأوامر',
        hint: 'اكتب للبحث',
        navigate: 'للتنقل',
        select: 'للاختيار',
        close: 'للإغلاق',
        copyEmail: 'نسخ البريد الإلكتروني',
        toggleTheme: 'تبديل الوضع الداكن',
        switchLanguage: 'تغيير اللغة',
        openGithub: 'فتح حساب GitHub',
        downloadCv: 'تحميل السيرة الذاتية',
        openContact: 'الانتقال إلى التواصل'
      },
      status: {
        completed: 'مكتمل',
        'in progress': 'قيد التنفيذ',
        archived: 'مؤرشف',
        'active focus': 'تركيز نشط',
        exploring: 'استكشاف'
      }
    }
  };

  var STORE_KEY = 'lang';

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function lookup(dict, path) {
    return path.split('.').reduce(function (acc, part) {
      return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, dict);
  }

  var state = { lang: 'en', dir: 'ltr' };

  function supportedLanguages() {
    var data = Site.data || {};
    var langs = data.i18n && Array.isArray(data.i18n.languages) ? data.i18n.languages : ['en'];
    if (!data.i18n || !data.i18n.enabled) return ['en'];
    return langs.length ? langs : ['en'];
  }

  function str(key, vars) {
    var en = lookup(UI_STRINGS.en, key);
    var value = lookup(UI_STRINGS[state.lang] || UI_STRINGS.en, key);
    if (value === undefined) value = en;
    if (value === undefined) return key;
    if (vars && typeof value === 'string') {
      Object.keys(vars).forEach(function (name) {
        value = value.replace(new RegExp('\\{' + name + '\\}', 'g'), vars[name]);
      });
    }
    return value;
  }

  function status(value) {
    var key = String(value || '').trim().toLowerCase().replace(/_/g, ' ');
    var translated = str('status.' + key);
    return translated === 'status.' + key ? String(value || '') : translated;
  }

  function apply(lang) {
    var languages = supportedLanguages();
    if (languages.indexOf(lang) === -1) lang = languages[0] || 'en';

    state.lang = lang;
    state.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (document.documentElement) {
      document.documentElement.lang = lang;
      document.documentElement.dir = state.dir;
      document.documentElement.setAttribute('data-lang', lang);
    }
    safeSet(STORE_KEY, lang);

    Site.t = function (value) { return Site.utils.localized(value, state.lang); };
    Site.str = str;

    document.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: lang } }));
  }

  function setLang(lang) {
    if (lang === state.lang) return;
    apply(lang);
  }

  function nextLang() {
    var languages = supportedLanguages();
    var index = languages.indexOf(state.lang);
    return languages[(index + 1) % languages.length] || 'en';
  }

  function init() {
    var languages = supportedLanguages();
    var stored = safeGet(STORE_KEY);
    var initial = stored && languages.indexOf(stored) !== -1 ? stored : languages[0];
    apply(initial || 'en');
  }

  Site.i18n = {
    init: init,
    apply: apply,
    setLang: setLang,
    nextLang: nextLang,
    str: str,
    status: status,
    supported: supportedLanguages,
    enabled: function () { return supportedLanguages().length > 1; },
    get lang() { return state.lang; },
    get dir() { return state.dir; }
  };

  /* Data is already loaded by data-loader.js at this point. */
  init();
})();
