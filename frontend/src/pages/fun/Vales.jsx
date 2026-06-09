import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { couponService } from '../../services/fun/couponService';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../services/common/translations';
import CouponCard from '../../components/vales/CouponCard';
import CouponCreator from '../../components/vales/CouponCreator';
import './Vales.css';

export default function Vales() {
  const [coupons, setCoupons] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'available' | 'redeemed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states (creating new coupon)
  const [showCreator, setShowCreator] = useState(false);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome') || '';
  const minhaRole = localStorage.getItem('role') || '';
  
  const { language } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarVales();
  }, [navigate]);

  const carregarVales = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await couponService.getCoupons();
      setCoupons(data);
    } catch (err) {
      setError(t.coupon_error_load || 'Erro ao carregar os vales.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (title, description, icon) => {
    try {
      setCreating(true);
      setError('');
      const newCoupon = await couponService.createCoupon({
        title,
        description,
        icon
      });
      setCoupons([newCoupon, ...coupons]);
      setShowCreator(false);
      alert(t.coupon_success_created || 'Vale oferecido!');
    } catch (err) {
      setError(t.coupon_error_save || 'Erro ao criar vale.');
    } finally {
      setCreating(false);
    }
  };

  const handleRedeemCoupon = async (coupon) => {
    const confirmMsg = t.coupon_redeem_confirm || 'Queres resgatar este vale agora? O teu parceiro será avisado!';
    if (!window.confirm(confirmMsg)) return;

    try {
      setError('');
      const updated = await couponService.redeemCoupon(coupon._id);
      setCoupons(coupons.map(c => c._id === coupon._id ? updated : c));
      alert(language === 'pt' ? 'Vale resgatado com sucesso! 🎉' : 'Coupon redeemed successfully! 🎉');
    } catch (err) {
      setError(t.coupon_error_redeem || 'Erro ao resgatar vale.');
    }
  };

  const handleDeleteCoupon = async (e, id) => {
    e.stopPropagation();
    const confirmMsg = t.coupon_confirm_delete || 'Tens a certeza que queres eliminar este vale?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setError('');
      await couponService.deleteCoupon(id);
      setCoupons(coupons.filter(c => c._id !== id));
    } catch (err) {
      setError(t.coupon_error_delete || 'Erro ao eliminar vale.');
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (filter === 'available') return coupon.status === 'gifted';
    if (filter === 'redeemed') return coupon.status === 'redeemed';
    return true;
  });

  return (
    <div className="app-container fade-in">
      {/* Header */}
      <div className="coupon-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="coupon-page-title">{t.coupon_title || 'Vales de Amor 🎟️'}</h1>
        <div style={{ width: '100px' }} className="header-spacer"></div>
      </div>

      <p className="coupon-subtitle">{t.coupon_subtitle || 'Presentes virtuais para oferecer ao outro'}</p>

      {error && (
        <div className="coupon-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Control Bar (Filters & Add button) */}
      <div className="coupon-controls-bar">
        <div className="coupon-filters glass-panel">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t.coupon_filter_all || 'Todos'} ({coupons.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            {t.coupon_filter_available || 'Disponíveis'} ({coupons.filter(c => c.status === 'gifted').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'redeemed' ? 'active' : ''}`}
            onClick={() => setFilter('redeemed')}
          >
            {t.coupon_filter_redeemed || 'Usados'} ({coupons.filter(c => c.status === 'redeemed').length})
          </button>
        </div>

        <button 
          className="btn btn-primary btn-add-coupon" 
          onClick={() => setShowCreator(true)}
          disabled={loading}
        >
          ➕ {language === 'pt' ? 'Oferecer Vale' : 'Gift Coupon'}
        </button>
      </div>

      {/* Creator Modal */}
      {showCreator && (
        <CouponCreator
          onClose={() => setShowCreator(false)}
          onSubmit={handleCreateCoupon}
          creating={creating}
          t={t}
        />
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="coupon-loading-spinner-container">
          <div className="spinner"></div>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="glass-panel empty-coupon-state">
          <p>{t.coupon_empty_state || 'Não há vales na carteira.'}</p>
        </div>
      ) : (
        <div className="coupon-grid fade-in">
          {filteredCoupons.map(coupon => (
            <CouponCard
              key={coupon._id}
              coupon={coupon}
              meuNome={meuNome}
              minhaRole={minhaRole}
              onRedeem={handleRedeemCoupon}
              onDelete={handleDeleteCoupon}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
