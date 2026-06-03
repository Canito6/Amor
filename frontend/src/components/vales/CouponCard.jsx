import React from 'react';

export default function CouponCard({
  coupon,
  meuNome,
  minhaRole,
  onRedeem,
  onDelete,
  t
}) {
  const isCreator = coupon.createdBy === meuNome;

  return (
    <div 
      className={`coupon-ticket-card ${coupon.status === 'redeemed' ? 'redeemed' : ''}`}
    >
      {/* Delete Button */}
      {(isCreator || minhaRole === 'admin') && (
        <button 
          className="coupon-delete-btn"
          onClick={(e) => onDelete(e, coupon._id)}
          title={t.coupon_confirm_delete}
        >
          ✕
        </button>
      )}

      <div className="coupon-ticket-left">
        <span className="coupon-ticket-icon">{coupon.icon}</span>
      </div>

      <div className="coupon-ticket-divider">
        <div className="coupon-ticket-hole hole-top"></div>
        <div className="coupon-ticket-line"></div>
        <div className="coupon-ticket-hole hole-bottom"></div>
      </div>

      <div className="coupon-ticket-right">
        <div className="coupon-ticket-body">
          <h3 className="coupon-ticket-title">{coupon.title}</h3>
          {coupon.description && (
            <p className="coupon-ticket-desc">{coupon.description}</p>
          )}
          <span className="coupon-ticket-author">
            {t.coupon_gifted_by ? t.coupon_gifted_by.replace('{user}', coupon.createdBy) : `Oferecido por ${coupon.createdBy}`}
          </span>
        </div>

        <div className="coupon-ticket-footer">
          {coupon.status === 'redeemed' ? (
            <div className="coupon-stamp">
              {t.coupon_status_redeemed || 'RESCATADO'}
            </div>
          ) : (
            <div className="coupon-action-row">
              {isCreator ? (
                <span className="coupon-status-badge available">
                  {t.coupon_status_gifted || 'Disponível'}
                </span>
              ) : (
                <button 
                  className="btn btn-primary btn-redeem-ticket"
                  onClick={() => onRedeem(coupon)}
                >
                  {t.coupon_redeem_btn || 'Resgatar!'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
