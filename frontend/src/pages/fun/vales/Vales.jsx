import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { couponService } from '../../../services/fun/couponService';
import { usePreferences } from '../../../context/PreferencesContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { translations } from '../../../services/common/translations';
import CouponCreator from '../../../components/vales/CouponCreator';
import CouponFilters from '../../../components/vales/CouponFilters';
import CouponList from '../../../components/vales/CouponList';
import useSocketUpdate from '../../../hooks/shared/useSocketUpdate';
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
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarVales();
  }, [navigate]);

  useSocketUpdate(() => {
    carregarVales();
  }, ['coupon-', 'vale-']);

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
      showToast(t.coupon_success_created || 'Vale oferecido!', 'success');
    } catch (err) {
      setError(t.coupon_error_save || 'Erro ao criar vale.');
    } finally {
      setCreating(false);
    }
  };

  const handleRedeemCoupon = async (coupon) => {
    const confirmMsg = t.coupon_redeem_confirm || 'Queres resgatar este vale agora? O teu parceiro será avisado!';
    const ok = await confirm({ title: confirmMsg, message: confirmMsg, confirmText: t.save || 'Sim', cancelText: t.cancel || 'Cancelar' });
    if (!ok) return;

    try {
      setError('');
      const updated = await couponService.redeemCoupon(coupon._id);
      setCoupons(coupons.map(c => c._id === coupon._id ? updated : c));
      showToast(language === 'pt' ? 'Vale resgatado com sucesso! 🎉' : 'Coupon redeemed successfully! 🎉', 'success');
    } catch (err) {
      setError(t.coupon_error_redeem || 'Erro ao resgatar vale.');
    }
  };

  const handleDeleteCoupon = async (e, id) => {
    e.stopPropagation();
    const confirmMsg = t.coupon_confirm_delete || 'Tens a certeza que queres eliminar este vale?';
    const ok = await confirm({ title: confirmMsg, message: confirmMsg, confirmText: t.delete || 'Apagar', cancelText: t.cancel || 'Cancelar' });
    if (!ok) return;

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
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.coupon_title || 'Vales de Casal 🎟️'}</h1>
        <div className="page-header-spacer"></div>
      </div>

      <p className="coupon-subtitle">{t.coupon_subtitle || 'Presentes virtuais para oferecer ao outro'}</p>

      {error && (
        <div className="coupon-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Control Bar (Filters & Add button) */}
      <div className="coupon-controls-bar">
        <CouponFilters 
          filter={filter}
          setFilter={setFilter}
          totalCoupons={coupons.length}
          availableCoupons={coupons.filter(c => c.status === 'gifted').length}
          redeemedCoupons={coupons.filter(c => c.status === 'redeemed').length}
          t={t}
        />

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
      <CouponList 
        loading={loading}
        filteredCoupons={filteredCoupons}
        meuNome={meuNome}
        minhaRole={minhaRole}
        handleRedeemCoupon={handleRedeemCoupon}
        handleDeleteCoupon={handleDeleteCoupon}
        t={t}
      />
    </div>
  );
}
