import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getSummary, getLowStock, getTransactions } from '../api'
import { formatCurrency, formatNumber, formatDateTime } from '../format'

export default function Dashboard() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [s, l, tx] = await Promise.all([
      getSummary(),
      getLowStock(),
      getTransactions({ limit: 8 }),
    ])
    setSummary(s)
    setLowStock(l)
    setRecentTx(tx)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading || !summary) {
    return <div className="empty-state">{t('dashboard.loading')}</div>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p>{t('dashboard.subtitle')}</p>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="label">{t('dashboard.stats.products')}</div>
          <div className="value">{formatNumber(summary.product_count)}</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('dashboard.stats.totalQuantity')}</div>
          <div className="value">{formatNumber(summary.total_quantity)}</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('dashboard.stats.totalValue')}</div>
          <div className="value">{formatCurrency(summary.total_value)}</div>
        </div>
        <div className={`stat-card ${summary.low_stock_count > 0 ? 'danger' : ''}`}>
          <div className="label">{t('dashboard.stats.lowStock')}</div>
          <div className="value">{formatNumber(summary.low_stock_count)}</div>
        </div>
        <div className="stat-card success">
          <div className="label">{t('dashboard.stats.todayIn')}</div>
          <div className="value">{formatNumber(summary.today_in_qty)}</div>
        </div>
        <div className="stat-card danger">
          <div className="label">{t('dashboard.stats.todayOut')}</div>
          <div className="value">{formatNumber(summary.today_out_qty)}</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{t('dashboard.recentTx')}</h3>
          {recentTx.length === 0 ? (
            <div className="empty-state">{t('dashboard.noTx')}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t('dashboard.table.time')}</th>
                  <th>{t('dashboard.table.product')}</th>
                  <th>{t('dashboard.table.type')}</th>
                  <th>{t('dashboard.table.quantity')}</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map(tx => (
                  <tr key={tx.id}>
                    <td>{formatDateTime(tx.created_at)}</td>
                    <td>{tx.product_name}</td>
                    <td>
                      <span className={`badge ${tx.type === 'in' ? 'success' : 'danger'}`}>
                        {tx.type === 'in' ? t('txType.in') : t('txType.out')}
                      </span>
                    </td>
                    <td>{formatNumber(tx.quantity)} {tx.product_unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>{t('dashboard.lowStockTitle')}</h3>
          {lowStock.length === 0 ? (
            <div className="empty-state">{t('dashboard.allGood')}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t('dashboard.table.product')}</th>
                  <th>{t('dashboard.table.stock')}</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.slice(0, 8).map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                      <span className="badge danger">{formatNumber(p.quantity)} {p.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {lowStock.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Link className="btn secondary sm" to="/san-pham">{t('dashboard.viewAllProducts')}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
