
import CouponCard from './CouponCard';

export default function CouponList({
  loading,
  filteredCoupons,
  meuNome,
  minhaRole,
  handleRedeemCoupon,
  handleDeleteCoupon,
  t
}) {
  if (loading) {
    return (
      <div className="coupon-loading-spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (filteredCoupons.length === 0) {
    return (
      <div className="glass-panel empty-coupon-state">
        <p>{t.coupon_empty_state || 'Não há vales na carteira.'}</p>
      </div>
    );
  }

  return (
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
  );
}
