import { useEffect, useState } from "react";
import ConsolePreview from "./components/ConsolePreview.jsx";
import GradientBlinds from "./components/GradientBlinds.jsx";
import TabletStage from "./components/TabletStage.jsx";
import { copy } from "./copy.js";

function Mark({ size = 28 }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 24V14h10M54 24V14H44M10 40v10h10M54 40v10H44" />
      <circle cx="32" cy="27" r="6.5" />
      <path d="M20 48c2.2-7 6.6-10.5 12-10.5S41.8 41 44 48" />
    </svg>
  );
}

function Wordmark({ byline }) {
  return (
    <span className="wordmark">
      <span className="wordmark-name">
        absence-<em>less</em>
      </span>
      {byline ? <span className="wordmark-by">{byline}</span> : null}
    </span>
  );
}

function inquiryText(fields, t) {
  return [
    t.inquiryHead,
    `${t.inquiryName}: ${fields.name}`,
    `${t.inquiryWorkplace}: ${fields.workplace}`,
    `${t.inquirySize}: ${fields.size}`,
    `${t.inquiryNote}: ${fields.note || "—"}`,
  ].join("\n");
}

function initialLang() {
  try {
    return localStorage.getItem("absence-less-lang") === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

const NAV = ["overview", "how", "features", "hardware", "dashboard", "api", "contact"];

export default function App() {
  const [lang, setLang] = useState(initialLang);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fields, setFields] = useState({ name: "", workplace: "", size: "", note: "" });
  const [notice, setNotice] = useState("");
  const t = copy[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t.description);
    try {
      localStorage.setItem("absence-less-lang", lang);
    } catch {
      // The page still switches language if storage is blocked.
    }
  }, [lang, t.title, t.description]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  function update(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setNotice("");
  }

  function toggleLang() {
    setLang((current) => (current === "en" ? "ar" : "en"));
    setNotice("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    const text = inquiryText(fields, t);
    try {
      await navigator.clipboard.writeText(text);
      setNotice("copied");
    } catch {
      setNotice(text);
    }
  }

  return (
    <>
      <a className="skip" href="#overview">
        {t.explore}
      </a>
      <header className="site-nav">
        <a className="brand" href="#top">
          <Mark />
          <Wordmark byline={t.byCodai} />
        </a>
        <nav id="site-links" className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label={t.navLabel}>
          {NAV.map((key) => (
            <a key={key} href={`#${key}`} onClick={() => setMenuOpen(false)}>
              {t.nav[key]}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button type="button" className="lang" onClick={toggleLang} aria-label={t.langLabel}>
            {t.langSwitch}
          </button>
          <a className="btn btn-solid nav-cta" href="#contact">
            {t.contactCta}
          </a>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={menuOpen}
            aria-controls="site-links"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? t.closeMenu : t.menu}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <GradientBlinds
            className="hero-blinds"
            gradientColors={["#ffdc9f", "#f95516"]}
          />
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="kicker">{t.developed}</p>
              <h1>{t.h1}</h1>
              <p className="lede">{t.lede}</p>
              <div className="hero-actions">
                <a className="btn btn-solid" href="#overview">
                  {t.explore}
                </a>
                <a className="btn btn-ghost" href="#how">
                  {t.seeHow}
                </a>
              </div>
              <ul className="facts">
                {t.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
            <TabletStage hint={t.drag} loadingLabel={t.loading} label={t.stageLabel} />
          </div>
        </section>

        <section className="band" id="overview">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">{t.overviewKicker}</p>
              <h2>{t.overviewTitle}</h2>
              <p className="lede">{t.overviewLede}</p>
            </div>
            <ol className="parts">
              {t.parts.map(([title, text], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="band band-alt" id="how">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">{t.howKicker}</p>
              <h2>{t.howTitle}</h2>
            </div>
            <div className="flows">
              <article>
                <h3>{t.employeeLabel}</h3>
                <ol className="flow">
                  {t.employee.map(([title, text], index) => (
                    <li key={title}>
                      <span>{index + 1}</span>
                      <div>
                        <h4>{title}</h4>
                        <p>{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
              <article>
                <h3>{t.adminLabel}</h3>
                <ol className="flow">
                  {t.admin.map(([title, text], index) => (
                    <li key={title}>
                      <span>{index + 1}</span>
                      <div>
                        <h4>{title}</h4>
                        <p>{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
          </div>
        </section>

        <section className="band" id="features">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">{t.featuresKicker}</p>
              <h2>{t.featuresTitle}</h2>
            </div>
            <ul className="features">
              {t.features.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="band band-alt" id="hardware">
          <div className="wrap split">
            <div>
              <p className="kicker">{t.hardwareKicker}</p>
              <h2>{t.hardwareTitle}</h2>
              <p className="lede">{t.hardwareLede}</p>
              <ul className="points">
                {t.hardwarePoints.map(([title, text]) => (
                  <li key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <figure className="product-shot">
              <img src="/packaging.jpg" alt={t.boxAlt} />
            </figure>
          </div>
        </section>

        <section className="band" id="dashboard">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">{t.dashKicker}</p>
              <h2>{t.dashTitle}</h2>
              <p className="lede">{t.dashLede}</p>
            </div>
            <ConsolePreview shots={t.shots} />
            <ul className="points dash-points">
                {t.dashPoints.map(([title, text]) => (
                  <li key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </li>
                ))}
            </ul>
          </div>
        </section>

        <section className="band band-alt" id="api">
          <div className="wrap split">
            <div>
              <p className="kicker">{t.apiKicker}</p>
              <h2>{t.apiTitle}</h2>
              <p className="lede">{t.apiLede}</p>
            </div>
            <dl className="api-list">
              {t.apiItems.map(([title, text]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="band" id="use">
          <div className="wrap">
            <div className="section-head">
              <p className="kicker">{t.casesKicker}</p>
              <h2>{t.casesTitle}</h2>
              <p className="lede">{t.casesLede}</p>
            </div>
            <ul className="cases">
              {t.cases.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="band band-alt" id="faq">
          <div className="wrap faq-wrap">
            <div className="section-head">
              <p className="kicker">{t.faqKicker}</p>
              <h2>{t.faqTitle}</h2>
            </div>
            <div className="faq">
              {t.faq.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="band" id="contact">
          <div className="wrap split contact-grid">
            <div>
              <p className="kicker">{t.closeKicker}</p>
              <h2>{t.closeTitle}</h2>
              <p className="lede">{t.closeLede}</p>
              <ul className="people">
                {t.people.map((person) => (
                  <li key={person.name}>
                    <h3>{person.name}</h3>
                    <p className="role">{person.role}</p>
                    <a className="person-link" href={person.whatsappHref}>
                      <span>{t.whatsapp}</span>
                      <bdi>{person.whatsapp}</bdi>
                    </a>
                    {person.email ? (
                      <a className="person-link" href={`mailto:${person.email}`}>
                        <span>{t.emailLabel}</span>
                        <bdi>{person.email}</bdi>
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <form className="inquiry" onSubmit={onSubmit}>
              <label>
                {t.name}
                <input name="name" value={fields.name} onChange={update} required autoComplete="name" />
              </label>
              <label>
                {t.workplace}
                <input
                  name="workplace"
                  value={fields.workplace}
                  onChange={update}
                  required
                  autoComplete="organization"
                />
              </label>
              <label>
                {t.size}
                <input name="size" value={fields.size} onChange={update} required placeholder={t.sizeHint} />
              </label>
              <label>
                {t.note}
                <textarea name="note" value={fields.note} onChange={update} rows={4} placeholder={t.noteHint} />
              </label>
              <button className="btn btn-solid" type="submit">
                {t.copy}
              </button>
              {notice === "copied" ? (
                <p className="notice" role="status">
                  {t.copied}
                </p>
              ) : null}
              {notice && notice !== "copied" ? (
                <p className="notice" role="status">
                  {`${t.copyFallback}\n\n${notice}`}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand" href="#top">
          <Mark size={22} />
          <Wordmark />
        </a>
        <p>{t.by}</p>
      </footer>
    </>
  );
}
