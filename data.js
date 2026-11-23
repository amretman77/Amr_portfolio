/* ==========================================================================
   data.js — Single source of truth for all personal & site data.
   Every UI component reads from window.SITE_DATA; nothing is hardcoded
   in HTML, CSS, or JS.  Bilingual strings use { en, ar } objects.
   Empty strings ("") signal the renderer to hide the related element.
   ========================================================================== */

window.SITE_DATA = {

  /* ---------- Site-wide metadata ---------- */
  site: {
    url: "https://YOUR-DOMAIN.example",
    language: "en",
    ogImage: "assets/og-image.png"
  },

  /* ---------- Theme tokens ---------- */
  theme: {
    accent: "#3B82F6",
    accentDark: "#60A5FA",
    defaultMode: "system"
  },

  /* ---------- Internationalization ---------- */
  i18n: {
    enabled: true,
    languages: ["en", "ar"]
  },

  /* ---------- Personal profile ---------- */
  profile: {
    name: { en: "Amr Etman", ar: "عمرو عتمان" },
    initials: "AE",
    role: {
      en: "Data Engineering Student | Computer Science",
      ar: "طالب هندسة بيانات | علوم حاسب"
    },
    tagline: {
      en: "Building reliable data pipelines and turning raw data into useful insights.",
      ar: "بناء خطوط بيانات موثوقة وتحويل البيانات الخام إلى رؤى مفيدة."
    },
    bio: {
      en: "I'm a Computer Science student interested in Data Engineering, data processing, and building practical data solutions. I work with Python, SQL, and data tools to clean, transform, and organize data, while continuously exploring modern data engineering technologies and workflows.",
      ar: "أنا طالب علوم حاسب مهتم بهندسة البيانات ومعالجة البيانات وبناء حلول بيانات عملية. أعمل مع Python و SQL وأدوات البيانات لتنظيف البيانات وتحويلها وتنظيمها، مع استكشاف مستمر لتقنيات وسير عمل هندسة البيانات الحديثة."
    },
    aboutHtml: [
      {
        en: "<p>I'm a Computer Science student at the Faculty of Computers and Data Science, Alexandria University, with a growing interest in Data Engineering and the infrastructure behind data-driven applications. I've worked with Python, SQL, data cleaning, analytical workflows, and database design, and I'm developing my understanding of building reliable and structured data pipelines.</p>",
        ar: "<p>أنا طالب علوم حاسب في كلية الحاسبات وعلوم البيانات بجامعة الإسكندرية، مع اهتمام متزايد بهندسة البيانات والبنية التحتية وراء التطبيقات المبنية على البيانات. عملت مع Python و SQL وتنظيف البيانات وسير العمل التحليلي وتصميم قواعد البيانات، وأعمل على تطوير فهمي لبناء خطوط بيانات موثوقة ومنظمة.</p>"
      },
      {
        en: "<p>I enjoy learning by building projects and experimenting with tools across the data ecosystem. My goal is to grow into a Data Engineer capable of designing, building, and maintaining scalable data workflows, from ingestion and transformation to storage and analytics.</p>",
        ar: "<p>أستمتع بالتعلم من خلال بناء المشاريع والتجربة مع الأدوات عبر النظام البيئي للبيانات. هدفي هو النمو لأصبح مهندس بيانات قادراً على تصميم وبناء وصيانة سير عمل بيانات قابلة للتوسع، من الاستيعاب والتحويل إلى التخزين والتحليلات.</p>"
      }
    ],
    photo: "",
    location: { en: "Egypt", ar: "مصر" },
    availability: {
      show: true,
      text: {
        en: "Open to Data Engineering Internships",
        ar: "متاح لتدريب هندسة البيانات"
      }
    },
    email: "amretman1213@gmail.com",
    phone: ""
  },

  /* ---------- Social / external links ---------- */
  links: {
    github: "https://github.com/amretman77",
    linkedin: "https://www.linkedin.com/in/amr-etman-71ba963a6/",
    twitter: "",
    kaggle: "",
    medium: "",
    youtube: "",
    website: ""
  },

  /* ---------- Downloadable CV ---------- */
  cv: {
    file: "cv/Amr_Mostafa_CV.pdf",
    label: { en: "Download CV", ar: "تحميل السيرة الذاتية" }
  },

  /* ---------- Hero section ---------- */
hero: {
    stats: [
      { value: "", label: { en: "", ar: "" } },
      { value: "", label: { en: "", ar: "" } },
      { value: "", label: { en: "", ar: "" } }
    ],
    traceLines: [
      "→ extract(source=\"olist_raw\", format=\"csv\")",
      "→ validate(schema=\"orders\", strict=true)",
      "→ transform(pipeline=\"clean_nulls|cast_types\")",
      "→ load(target=\"mysql\", table=\"dim_products\")",
      "✓ pipeline complete (4 stages, 0 errors)"
    ]
  },

  /* ---------- "Now" section — what I'm currently doing ---------- */
  now: {
    building: {
      en: "Data processing and ETL workflows using Python, SQL, and relational databases.",
      ar: "معالجة البيانات وسير عمل ETL باستخدام Python و SQL وقواعد البيانات العلائقية."
    },
    learning: {
      en: "Apache Airflow, Spark, Kafka, Hadoop, and modern data pipeline architecture.",
      ar: "Apache Airflow و Spark و Kafka و Hadoop وهندسة خطوط البيانات الحديثة."
    },
    reading: ""
  },

  /* ---------- Focus areas / specialization cards ---------- */
  focusAreas: [
    {
      icon: "pipeline",
      title: { en: "Data Pipelines", ar: "خطوط البيانات" },
      text: {
        en: "Building structured ETL workflows for data ingestion, transformation, and loading.",
        ar: "بناء سير عمل ETL منظمة لاستيعاب البيانات وتحويلها وتحميلها."
      }
    },
    {
      icon: "cpu",
      title: { en: "Data Processing", ar: "معالجة البيانات" },
      text: {
        en: "Cleaning, validating, and transforming raw datasets using Python and Pandas.",
        ar: "تنظيف وتحقق وتحويل مجموعات البيانات الخام باستخدام Python و Pandas."
      }
    },
    {
      icon: "database",
      title: { en: "SQL & Databases", ar: "SQL وقواعد البيانات" },
      text: {
        en: "Working with relational databases, SQL queries, data modeling, and analytical workflows.",
        ar: "العمل مع قواعد البيانات العلائقية واستعلامات SQL ونمذجة البيانات وسير العمل التحليلي."
      }
    },
    {
      icon: "globe",
      title: { en: "Big Data Technologies", ar: "تقنيات البيانات الكبيرة" },
      text: {
        en: "Exploring distributed data processing tools: Spark, Hadoop, Kafka, and Airflow.",
        ar: "استكشاف أدوات معالجة البيانات الموزعة: Spark و Hadoop و Kafka و Airflow."
      }
    }
  ],

  /* ---------- Technical skills ---------- */
  skills: {
    groups: [
      {
        title: { en: "Programming & Data Processing", ar: "البرمجة ومعالجة البيانات" },
        items: ["Python", "Pandas", "NumPy"]
      },
      {
        title: { en: "Databases & SQL", ar: "قواعد البيانات و SQL" },
        items: ["MySQL", "PostgreSQL", "SQL", "Database Design"]
      },
      {
        title: { en: "Data Engineering", ar: "هندسة البيانات" },
        items: [
          "ETL Pipelines",
          "Data Cleaning",
          "Data Validation",
          "Data Transformation",
          "Data Modeling",
          "CSV",
          "Parquet"
        ]
      },
      {
        title: { en: "Tools & Workflow", ar: "الأدوات وسير العمل" },
        items: ["Git", "GitHub", "Linux", "Docker"]
      },
      {
        title: { en: "Big Data Ecosystem", ar: "النظام البيئي للبيانات الكبيرة" },
        items: [
          "Apache Hadoop",
          "Apache Hive",
          "Apache Spark",
          "Apache Kafka",
          "Apache Airflow",
          "HBase",
          "ZooKeeper"
        ]
      }
    ],
    learning: {
      en: [
        "Apache Airflow",
        "Apache Spark",
        "Apache Kafka",
        "Hadoop Ecosystem",
        "Docker-based Data Infrastructure"
      ],
      ar: [
        "Apache Airflow",
        "Apache Spark",
        "Apache Kafka",
        "نظام Hadoop البيئي",
        "بنية بيانات مبنية على Docker"
      ]
    }
  },

  /* ---------- Projects ---------- */
  projects: [
    {
      id: "olist-data-engineering",
      title: { en: "Olist Data Engineering Project", ar: "مشروع هندسة بيانات Olist" },
      summary: {
        en: "Building a data processing workflow for the Olist dataset, transforming raw data into structured and analysis-ready datasets.",
        ar: "بناء سير عمل معالجة بيانات لمجموعة بيانات Olist، وتحويل البيانات الخام إلى مجموعات بيانات منظمة وجاهزة للتحليل."
      },
      description: {
        en: "A comprehensive data engineering project that processes the Brazilian e-commerce Olist dataset. The project involves extracting raw CSV data, cleaning and validating it with Python and Pandas, transforming it into structured Parquet files, and loading the processed data into a MySQL database for downstream analytics.",
        ar: "مشروع هندسة بيانات شامل يعالج مجموعة بيانات Olist للتجارة الإلكترونية البرازيلية. يتضمن المشروع استخراج بيانات CSV الخام وتنظيفها والتحقق منها باستخدام Python و Pandas وتحويلها إلى ملفات Parquet منظمة وتحميل البيانات المعالجة في قاعدة بيانات MySQL للتحليلات اللاحقة."
      },
      category: { en: "Data Engineering", ar: "هندسة البيانات" },
      status: "In Progress",
      featured: true,
      date: "2026-01",
      role: { en: "Data Engineer", ar: "مهندس بيانات" },
      highlights: [
        {
          en: "Processing and cleaning multiple raw Olist datasets using Python and Pandas.",
          ar: "معالجة وتنظيف مجموعات بيانات Olist الخام المتعددة باستخدام Python و Pandas."
        },
        {
          en: "Transforming raw datasets into structured Parquet files for downstream processing.",
          ar: "تحويل مجموعات البيانات الخام إلى ملفات Parquet منظمة للمعالجة اللاحقة."
        },
        {
          en: "Designing relational database tables and loading processed data into MySQL.",
          ar: "تصميم جداول قواعد البيانات العلائقية وتحميل البيانات المعالجة في MySQL."
        }
      ],
      tech: ["Python", "Pandas", "MySQL", "SQL", "Parquet", "Git"],
      problem: {
        en: "Raw e-commerce data spread across multiple CSV files with inconsistencies, missing values, and no unified schema for analysis.",
        ar: "بيانات التجارة الإلكترونية الخام موزعة عبر ملفات CSV متعددة مع تناقضات وقيم مفقودة وعدم وجود مخطط موحد للتحليل."
      },
      approach: {
        en: "Built a Python-based ETL pipeline using Pandas for data cleaning and transformation, designed a relational schema, and exported to both Parquet and MySQL.",
        ar: "بناء خط أنابيب ETL مبني على Python باستخدام Pandas لتنظيف البيانات وتحويلها، وتصميم مخطط علائقي، والتصدير إلى كل من Parquet و MySQL."
      },
      result: {
        en: "Structured, clean datasets ready for analytics, stored in both Parquet format and a normalized MySQL database.",
        ar: "مجموعات بيانات منظمة ونظيفة جاهزة للتحليلات، مخزنة في تنسيق Parquet وقاعدة بيانات MySQL موحدة."
      },
      links: { github: "https://github.com/amretman77/depi-project", demo: "", caseStudy: "" }
    },
    {
      id: "fifa-ml-pipeline",
      title: {
        en: "FIFA Player Market Value ML Pipeline",
        ar: "خط أنابيب تعلم آلي لقيمة لاعبي FIFA السوقية"
      },
      summary: {
        en: "A machine learning project focused on football player market value prediction using FIFA player data.",
        ar: "مشروع تعلم آلي يركز على التنبؤ بالقيمة السوقية للاعبي كرة القدم باستخدام بيانات لاعبي FIFA."
      },
      description: {
        en: "An end-to-end machine learning pipeline that explores FIFA player attributes, prepares datasets through feature engineering, and builds predictive models for player market value estimation using scikit-learn.",
        ar: "خط أنابيب تعلم آلي شامل يستكشف سمات لاعبي FIFA، ويعد مجموعات البيانات من خلال هندسة الميزات، ويبني نماذج تنبؤية لتقدير القيمة السوقية للاعبين باستخدام scikit-learn."
      },
      category: { en: "Machine Learning / Data Analysis", ar: "تعلم آلي / تحليل بيانات" },
      status: "Completed",
      featured: true,
      date: "2025-06",
      role: { en: "Machine Learning Developer", ar: "مطور تعلم آلي" },
      highlights: [
        {
          en: "Exploring FIFA player attributes and preparing datasets for machine learning.",
          ar: "استكشاف سمات لاعبي FIFA وإعداد مجموعات البيانات للتعلم الآلي."
        },
        {
          en: "Building a machine learning workflow for player market value prediction.",
          ar: "بناء سير عمل تعلم آلي للتنبؤ بالقيمة السوقية للاعبين."
        },
        {
          en: "Applying data processing and predictive modeling techniques.",
          ar: "تطبيق تقنيات معالجة البيانات والنمذجة التنبؤية."
        }
      ],
      tech: ["Python", "Pandas", "NumPy", "Scikit-learn"],
      problem: {
        en: "Estimating football player market values requires analyzing numerous player attributes and performance metrics.",
        ar: "يتطلب تقدير القيم السوقية للاعبي كرة القدم تحليل العديد من سمات اللاعبين ومقاييس الأداء."
      },
      approach: {
        en: "Applied exploratory data analysis, feature engineering, and multiple regression models to predict market values from FIFA player statistics.",
        ar: "تطبيق تحليل البيانات الاستكشافي وهندسة الميزات ونماذج الانحدار المتعددة للتنبؤ بالقيم السوقية من إحصائيات لاعبي FIFA."
      },
      result: {
        en: "A trained predictive model capable of estimating player market values with reasonable accuracy.",
        ar: "نموذج تنبؤي مدرب قادر على تقدير القيم السوقية للاعبين بدقة معقولة."
      },
      links: { github: "https://github.com/amretman77/FIFA-Player-Market-Value-ML-Pipeline", demo: "", caseStudy: "" }
    }
  ],

  /* ---------- Research interests ---------- */
  research: {
    items: [
      {
        title: {
          en: "Data Infrastructure & Distributed Systems",
          ar: "البنية التحتية للبيانات والأنظمة الموزعة"
        },
        status: { en: "Active focus", ar: "تركيز نشط" },
        text: {
          en: "Exploring distributed data storage, processing systems, and architectures for large-scale data workloads.",
          ar: "استكشاف تخزين البيانات الموزع وأنظمة المعالجة والبنى للأحمال الكبيرة للبيانات."
        }
      },
      {
        title: {
          en: "Data Quality & Pipeline Reliability",
          ar: "جودة البيانات وموثوقية خطوط الأنابيب"
        },
        status: { en: "Active focus", ar: "تركيز نشط" },
        text: {
          en: "Interested in validation, schema enforcement, data consistency, and building dependable pipelines.",
          ar: "مهتم بالتحقق وفرض المخططات واتساق البيانات وبناء خطوط أنابيب يمكن الاعتماد عليها."
        }
      },
      {
        title: {
          en: "AI Applications in Data Engineering",
          ar: "تطبيقات الذكاء الاصطناعي في هندسة البيانات"
        },
        status: { en: "Exploring", ar: "استكشاف" },
        text: {
          en: "Exploring how AI can assist with data processing, automation, data quality, and intelligent data workflows.",
          ar: "استكشاف كيف يمكن للذكاء الاصطناعي المساعدة في معالجة البيانات والأتمتة وجودة البيانات وسير عمل البيانات الذكية."
        }
      }
    ],
    cta: {
      title: { en: "Open to Collaboration", ar: "منفتح للتعاون" },
      text: {
        en: "If you're working on data engineering projects or research, I'd love to connect and collaborate.",
        ar: "إذا كنت تعمل على مشاريع أو أبحاث هندسة البيانات، أود التواصل والتعاون."
      }
    }
  },

  /* ---------- Work experience ---------- */
  experience: [
    {
      title: { en: "Big Data Analytics Training", ar: "تدريب تحليلات البيانات الكبيرة" },
      org: "ITIDA / NTI",
      period: { en: "Aug 2026 – Sep 2026", ar: "أغسطس 2026 – سبتمبر 2026" },
      current: false,
      badges: { en: ["Big Data", "120 Hours"], ar: ["بيانات كبيرة", "120 ساعة"] },
      bullets: [
        {
          en: "Completed a 120-hour training program covering technical skills and freelancing fundamentals.",
          ar: "أكمل برنامج تدريبي مدته 120 ساعة يغطي المهارات التقنية وأساسيات العمل الحر."
        },
        {
          en: "Completed 90 hours of technical training and 30 hours focused on freelancing.",
          ar: "أكمل 90 ساعة تدريب تقني و30 ساعة مركزة على العمل الحر."
        },
        {
          en: "Worked with data analysis, Python, SQL, and foundational Big Data concepts.",
          ar: "عمل مع تحليل البيانات و Python و SQL ومفاهيم البيانات الكبيرة الأساسية."
        },
        {
          en: "Achieved an overall training score of 88%.",
          ar: "حقق درجة تدريب إجمالية 88%."
        }
      ]
    }
  ],

  /* ---------- Education ---------- */
  education: [
    {
      title: { en: "Bachelor's Degree in Computer Science", ar: "درجة البكالوريوس في علوم الحاسب" },
      org: {
        en: "Alexandria University — Faculty of Computers and Data Science",
        ar: "جامعة الإسكندرية — كلية الحاسبات وعلوم البيانات"
      },
      period: "2024 – 2028",
      current: true,
      badges: ["GPA: 3.05"],
      bullets: [
        { en: "Data Analysis and Machine Learning", ar: "تحليل البيانات والتعلم الآلي" },
        { en: "Database Systems and SQL", ar: "أنظمة قواعد البيانات و SQL" },
        {
          en: "Programming and Computer Science Fundamentals",
          ar: "البرمجة وأساسيات علوم الحاسب"
        }
      ]
    }
  ],

  /* ---------- Courses & certifications ---------- */
  courses: [
    {
      title: {
        en: "ITIDA / NTI Big Data Analytics Training",
        ar: "تدريب تحليلات البيانات الكبيرة ITIDA / NTI"
      },
      org: "ITIDA / NTI",
      period: { en: "Aug – Sep 2026", ar: "أغسطس – سبتمبر 2026" },
      link: ""
    }
  ],

  /* ---------- Blog posts (empty — renderer hides the section) ---------- */
  blog: [],

  /* ---------- Contact section ---------- */
  contact: {
    intro: {
      en: "Have a question or want to collaborate? Feel free to reach out.",
      ar: "لديك سؤال أو تريد التعاون؟ لا تتردد في التواصل."
    },
    formEndpoint: "",
    responseTime: {
      en: "Usually responds within 24 hours",
      ar: "يرد عادة خلال 24 ساعة"
    }
  },

  /* ---------- Footer ---------- */
  footer: {
    text: ""
  }
};
