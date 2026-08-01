import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../components/Modal'
import { getProducts, getTransactions, createTransaction, apiErrorMessage } from '../api'
import { formatCurrency, formatNumber, formatDateTime } from '../format'

const EMPTY_FORM = { product_id: '', type: 'in', quantity: '', unit_price: '', partner: '', note: '' }

export default function Transactions() {
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState([])
  const [products, setProducts] = useState([])
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadProducts() {
    setProducts(await getProducts())
  }

  async function loadTransactions() {
    setLoading(true)
    const params = {}
    if (typeFilter) params.type = typeFilter
    setTransactions(await getTransactions(params))
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])
  useEffect(() => { loadTransactions() }, [typeFilter])

  function openForm(type) {
    setForm({ ...EMPTY_FORM, type, product_id: products[0]?.id || '' })
    setFormError('')
    setShowForm(true)
  }

  const selectedProduct = products.find(p => String(p.id) === String(form.product_id))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await createTransaction(form)
      setShowForm(false)
      await Promise.all([loadTransactions(), loadProducts()])
    } catch (err) {
      setFormError(apiErrorMessage(err, t))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('transactions.title')}</h1>
          <p>{t('transactions.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn secondary" onClick={() => openForm('in')}>{t('transactions.stockIn')}</button>
          <button className="btn" onClick={() => openForm('out')}>{t('transactions.stockOut')}</button>
        </div>
      </div>

      <div className="toolbar">
        <select className="input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">{t('transactions.allTx')}</option>
          <option value="in">{t('transactions.onlyIn')}</option>
          <option value="out">{t('transactions.onlyOut')}</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">{t('transactions.empty')}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('transactions.table.time')}</th>
                <th>{t('transactions.table.product')}</th>
                <th>{t('transactions.table.type')}</th>
                <th>{t('transactions.table.quantity')}</th>
                <th>{t('transactions.table.price')}</th>
                <th>{t('transactions.table.total')}</th>
                <th>{t('transactions.table.partner')}</th>
                <th>{t('transactions.table.note')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td>{formatDateTime(tx.created_at)}</td>
                  <td>{tx.product_name} <span style={{ color: 'var(--text-muted)' }}>({tx.product_sku})</span></td>
                  <td>
                    <span className={`badge ${tx.type === 'in' ? 'success' : 'danger'}`}>
                      {tx.type === 'in' ? t('txType.in') : t('txType.out')}
                    </span>
                  </td>
                  <td>{formatNumber(tx.quantity)} {tx.product_unit}</td>
                  <td>{formatCurrency(tx.unit_price)}</td>
                  <td>{formatCurrency(tx.quantity * tx.unit_price)}</td>
                  <td>{tx.partner || '—'}</td>
                  <td>{tx.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title={form.type === 'in' ? t('transactions.modal.titleIn') : t('transactions.modal.titleOut')} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="banner-error">{formError}</div>}
            <div className="form-grid">
              <div className="form-field span-2">
                <label>{t('transactions.modal.product')}</label>
                <select className="input" required value={form.product_id}
                  onChange={e => setForm({ ...form, product_id: e.target.value })}>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — {t('dashboard.table.stock')}: {formatNumber(p.quantity)} {p.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>{t('transactions.modal.type')}</label>
                <select className="input" value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="in">{t('transactions.modal.titleIn')}</option>
                  <option value="out">{t('transactions.modal.titleOut')}</option>
                </select>
              </div>
              <div className="form-field">
                <label>{t('transactions.modal.quantity')} {selectedProduct ? `(${selectedProduct.unit})` : ''}</label>
                <input className="input" type="number" min="0.01" step="any" required value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="form-field">
                <label>{t('transactions.modal.price')}</label>
                <input className="input" type="number" min="0" step="any" value={form.unit_price}
                  onChange={e => setForm({ ...form, unit_price: e.target.value })} />
              </div>
              <div className="form-field">
                <label>{form.type === 'in' ? t('transactions.modal.partnerIn') : t('transactions.modal.partnerOut')}</label>
                <input className="input" value={form.partner}
                  onChange={e => setForm({ ...form, partner: e.target.value })} />
              </div>
              <div className="form-field span-2">
                <label>{t('transactions.modal.note')}</label>
                <input className="input" value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
              <button type="submit" className="btn" disabled={saving || !form.product_id}>
                {saving ? t('common.saving') : t('transactions.confirm')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
