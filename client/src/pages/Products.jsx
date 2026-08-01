import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../components/Modal'
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, apiErrorMessage,
} from '../api'
import { formatCurrency, formatNumber } from '../format'

const EMPTY_FORM = {
  sku: '', name: '', category_id: '', unit: 'cai',
  price: '', quantity: '', low_stock_threshold: '', note: '',
}

export default function Products() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  async function loadCategories() {
    setCategories(await getCategories())
  }

  async function loadProducts() {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (categoryFilter) params.category_id = categoryFilter
    if (lowStockOnly) params.low_stock = '1'
    setProducts(await getProducts(params))
    setLoading(false)
  }

  useEffect(() => { loadCategories() }, [])
  useEffect(() => {
    const timer = setTimeout(loadProducts, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, lowStockOnly])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(p) {
    setEditing(p)
    setForm({
      sku: p.sku, name: p.name, category_id: p.category_id || '',
      unit: p.unit, price: p.price, quantity: p.quantity,
      low_stock_threshold: p.low_stock_threshold, note: p.note || '',
    })
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await updateProduct(editing.id, form)
      } else {
        await createProduct(form)
      }
      setShowForm(false)
      await loadProducts()
    } catch (err) {
      setFormError(apiErrorMessage(err, t))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p) {
    if (!confirm(t('products.confirmDelete', { name: p.name }))) return
    await deleteProduct(p.id)
    await loadProducts()
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) return
    try {
      const cat = await createCategory({ name: newCategory.trim() })
      setNewCategory('')
      await loadCategories()
      setForm(f => ({ ...f, category_id: cat.id }))
    } catch (err) {
      alert(apiErrorMessage(err, t))
    }
  }

  const totalValue = useMemo(
    () => products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    [products]
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('products.title')}</h1>
          <p>{t('products.summary', { count: formatNumber(products.length), value: formatCurrency(totalValue) })}</p>
        </div>
        <button className="btn" onClick={openCreate}>{t('products.addProduct')}</button>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder={t('products.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: 240 }}
        />
        <select className="input" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">{t('products.allCategories')}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)} />
          {t('products.lowStockOnly')}
        </label>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">{t('products.loading')}</div>
        ) : products.length === 0 ? (
          <div className="empty-state">{t('products.empty')}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('products.table.sku')}</th>
                <th>{t('products.table.name')}</th>
                <th>{t('products.table.category')}</th>
                <th>{t('products.table.price')}</th>
                <th>{t('products.table.stock')}</th>
                <th>{t('products.table.status')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.category_name || '—'}</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td>{formatNumber(p.quantity)} {p.unit}</td>
                  <td>
                    {p.low_stock ? (
                      <span className="badge danger">{t('products.statusLow')}</span>
                    ) : (
                      <span className="badge success">{t('products.statusOk')}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn secondary sm" onClick={() => openEdit(p)}>{t('common.edit')}</button>
                      <button className="btn danger sm" onClick={() => handleDelete(p)}>{t('common.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? t('products.modal.editTitle') : t('products.modal.addTitle')} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {formError && <div className="banner-error">{formError}</div>}
            <div className="form-grid">
              <div className="form-field">
                <label>{t('products.modal.sku')}</label>
                <input className="input" required value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="form-field">
                <label>{t('products.modal.name')}</label>
                <input className="input" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-field">
                <label>{t('products.modal.category')}</label>
                <select className="input" value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">{t('products.modal.noCategory')}</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>{t('products.modal.addCategory')}</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="input" placeholder={t('products.modal.newCategoryPlaceholder')} value={newCategory}
                    onChange={e => setNewCategory(e.target.value)} />
                  <button type="button" className="btn secondary sm" onClick={handleAddCategory}>{t('products.modal.addCategoryBtn')}</button>
                </div>
              </div>
              <div className="form-field">
                <label>{t('products.modal.unit')}</label>
                <input className="input" required value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="form-field">
                <label>{t('products.modal.price')}</label>
                <input className="input" type="number" min="0" step="any" required value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="form-field">
                <label>{editing ? t('products.modal.quantityEdit') : t('products.modal.quantityNew')}</label>
                <input className="input" type="number" min="0" step="any" required value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="form-field">
                <label>{t('products.modal.lowStockThreshold')}</label>
                <input className="input" type="number" min="0" step="any" required value={form.low_stock_threshold}
                  onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} />
              </div>
              <div className="form-field span-2">
                <label>{t('products.modal.note')}</label>
                <input className="input" value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
