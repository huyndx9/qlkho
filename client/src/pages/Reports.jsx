import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { getStockByDay, getTopProducts, getLowStock, exportProductsUrl, exportTransactionsUrl } from '../api'
import { formatNumber } from '../format'

function buildChartData(rows) {
  const byDay = {}
  rows.forEach(r => {
    if (!byDay[r.day]) byDay[r.day] = { day: r.day, in: 0, out: 0 }
    byDay[r.day][r.type] = r.qty
  })
  return Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day))
}

export default function Reports() {
  const { t } = useTranslation()
  const [chartData, setChartData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [byDay, top, low] = await Promise.all([
        getStockByDay(14),
        getTopProducts(5),
        getLowStock(),
      ])
      setChartData(buildChartData(byDay))
      setTopProducts(top)
      setLowStock(low)
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('reports.title')}</h1>
          <p>{t('reports.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a className="btn secondary" href={exportProductsUrl}>{t('reports.exportProducts')}</a>
          <a className="btn secondary" href={exportTransactionsUrl}>{t('reports.exportTx')}</a>
        </div>
      </div>

      <div className="card chart-card" style={{ marginBottom: 20 }}>
        <h3>{t('reports.chartTitle')}</h3>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ed" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="in" name={t('txType.in')} fill="#1ba672" radius={[4, 4, 0, 0]} />
              <Bar dataKey="out" name={t('txType.out')} fill="#e0433c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="two-col">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{t('reports.topProducts')}</h3>
          {topProducts.length === 0 ? (
            <div className="empty-state">{t('reports.noData')}</div>
          ) : (
            <table>
              <thead>
                <tr><th>{t('dashboard.table.product')}</th><th>{t('reports.totalOut')}</th></tr>
              </thead>
              <tbody>
                {topProducts.map(p => (
                  <tr key={p.id}>
                    <td>{p.name} <span style={{ color: 'var(--text-muted)' }}>({p.sku})</span></td>
                    <td>{formatNumber(p.total_out)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>{t('reports.needsRestock')}</h3>
          {lowStock.length === 0 ? (
            <div className="empty-state">{t('reports.allGood')}</div>
          ) : (
            <table>
              <thead>
                <tr><th>{t('dashboard.table.product')}</th><th>{t('dashboard.table.stock')}</th><th>{t('reports.threshold')}</th></tr>
              </thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{formatNumber(p.quantity)} {p.unit}</td>
                    <td>{formatNumber(p.low_stock_threshold)} {p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
