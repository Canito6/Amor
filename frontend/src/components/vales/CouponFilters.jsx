

export default function CouponFilters({
  filter,
  setFilter,
  totalCoupons,
  availableCoupons,
  redeemedCoupons,
  t
}) {
  return (
    <div className="coupon-filters glass-panel">
      <button 
        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        onClick={() => setFilter('all')}
      >
        {t.coupon_filter_all || 'Todos'} ({totalCoupons})
      </button>
      <button 
        className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
        onClick={() => setFilter('available')}
      >
        {t.coupon_filter_available || 'Disponíveis'} ({availableCoupons})
      </button>
      <button 
        className={`filter-btn ${filter === 'redeemed' ? 'active' : ''}`}
        onClick={() => setFilter('redeemed')}
      >
        {t.coupon_filter_redeemed || 'Usados'} ({redeemedCoupons})
      </button>
    </div>
  );
}
