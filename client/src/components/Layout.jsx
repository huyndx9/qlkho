import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n'

const NAV_ITEMS = [
  { to: '/', key: 'nav.dashboard', icon: '📊', end: true },
  { to: '/san-pham', key: 'nav.products', icon: '📦' },
  { to: '/nhap-xuat', key: 'nav.transactions', icon: '🔄' },
  { to: '/bao-cao', key: 'nav.reports', icon: '✅' },
]

export default function Layout({ children }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>📦</span>
          <span>{t('app.title')}</span>
        </div>
        <nav>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span>{item.icon}</span>
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <label style={{ display: 'block', marginBottom: 6 }}>{t('layout.language')}</label>
          <select
            className="input"
            style={{ width: '100%', marginBottom: 12 }}
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
          <span className="lan-hint">{t('layout.lanHint')}</span>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  )
}
