import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Package, Plus, X, Save, Edit, Trash2, Eye } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    stock_quantity: 0,
    price: '',
    created_at: ''
  });
  
  const { user: currentUser } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async (query = '') => {
    try {
      const response = await api.get(`/products?search=${encodeURIComponent(query)}&per_page=100`);
      if (response.data.status) {
        setProducts(response.data.data.products || response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load products", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchProducts(val);
  };

  const handleClear = () => {
    setSearchQuery('');
    fetchProducts('');
  };

  const handleOpenAdd = () => {
    setFormData({
      product_name: '',
      description: '',
      stock_quantity: 0,
      price: '',
      created_at: new Date().toISOString().split('T')[0]
    });
    setError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (prod) => {
    setCurrentProduct(prod);
    setFormData({
      product_name: prod.product_name,
      description: prod.description || '',
      stock_quantity: prod.stock_quantity || 0,
      price: prod.price !== null ? String(prod.price) : '',
      created_at: prod.created_at ? prod.created_at.split(' ')[0] : new Date().toISOString().split('T')[0]
    });
    setError('');
    setShowEditModal(true);
  };

  const handleOpenView = (prod) => {
    setCurrentProduct(prod);
    setShowViewModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_name.trim()) {
      setError('Product Name is required.');
      return;
    }
    setSaving(true);
    try {
      const response = await api.post('/products', formData);
      if (response.data.status) {
        setShowAddModal(false);
        fetchProducts();
      } else {
        setError(response.data.message || 'Failed to add product');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_name.trim()) {
      setError('Product Name is required.');
      return;
    }
    setSaving(true);
    try {
      const response = await api.put(`/products/${currentProduct.product_id}`, formData);
      if (response.data.status) {
        setShowEditModal(false);
        fetchProducts();
      } else {
        setError(response.data.message || 'Failed to update product');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await api.delete(`/products/${id}`);
        if (response.data.status) {
          fetchProducts();
        } else {
          alert(response.data.message || 'Failed to delete product');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const canEditOrDelete = currentUser?.role === 'doctor' || currentUser?.role === 'staff';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Product Management</h1>
        {canEditOrDelete && (
          <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ maxWidth: '320px', margin: 0 }}
          />
          {searchQuery && (
            <button 
              className="btn btn-outline" 
              onClick={handleClear} 
              style={{ padding: '0.6rem 1.2rem', borderColor: '#cbd5e1', color: '#64748b' }}
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>
        ) : products.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dark)' }}>
                  <th style={{ padding: '1rem' }}>Product ID</th>
                  <th style={{ padding: '1rem' }}>Product Name</th>
                  <th style={{ padding: '1rem' }}>Description</th>
                  <th style={{ padding: '1rem' }}>Stock Quantity</th>
                  <th style={{ padding: '1rem' }}>Price</th>
                  <th style={{ padding: '1rem' }}>Created Date</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(prod => (
                  <tr key={prod.product_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                      {prod.product_id}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{prod.product_name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prod.description || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>{prod.stock_quantity}</td>
                    <td style={{ padding: '1rem' }}>{prod.price !== null ? `₹${parseFloat(prod.price).toFixed(2)}` : 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      {prod.created_at ? new Date(prod.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: '#0284c7' }} title="View" onClick={() => handleOpenView(prod)}>
                        <Eye size={18} />
                      </button>
                      {canEditOrDelete && (
                        <>
                          <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: '#d97706' }} title="Edit" onClick={() => handleOpenEdit(prod)}>
                            <Edit size={18} />
                          </button>
                          {currentUser?.role === 'doctor' && (
                            <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--danger-color)' }} title="Delete" onClick={() => handleDelete(prod.product_id)}>
                              <Trash2 size={18} />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>No products found.</p>
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'modalSlideUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Add Product</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            {error && <div style={{ backgroundColor: '#fee2e2', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                    placeholder="e.g. Paracetamol"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter details about this product"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 5.50"
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Created Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.created_at}
                    onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'modalSlideUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Product</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            {error && <div style={{ backgroundColor: '#fee2e2', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Created Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.created_at}
                    onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRODUCT DETAIL MODAL */}
      {showViewModal && currentProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'modalSlideUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} color="var(--primary-color)" /> Product Details
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>PRODUCT ID</strong>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{currentProduct.product_id}</span>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>PRODUCT NAME</strong>
                <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>{currentProduct.product_name}</span>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>DESCRIPTION</strong>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {currentProduct.description || 'No description provided.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>STOCK QUANTITY</strong>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{currentProduct.stock_quantity}</span>
                </div>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>PRICE</strong>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#166534' }}>
                    {currentProduct.price !== null ? `₹${parseFloat(currentProduct.price).toFixed(2)}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>CREATED DATE</strong>
                <span style={{ fontSize: '0.95rem' }}>
                  {currentProduct.created_at ? new Date(currentProduct.created_at).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 2rem' }} onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
