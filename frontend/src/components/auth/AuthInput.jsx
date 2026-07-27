import { useState } from 'react';

export default function AuthInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  maxLength,
  error,
  success,
  helperText,
  style = {}
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';

  let borderStyle = {};
  if (error) {
    borderStyle = { borderColor: 'var(--danger-color)', boxShadow: '0 0 0 2px rgba(230, 57, 70, 0.15)' };
  } else if (success) {
    borderStyle = { borderColor: 'var(--success-color)', boxShadow: '0 0 0 2px rgba(42, 157, 143, 0.15)' };
  }

  return (
    <div className="form-group" style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <label className="input-label" htmlFor={id}>{label}</label>
        {success && !error && (
          <span style={{ fontSize: '12px', color: 'var(--success-color)', fontWeight: '600' }}>
            ✓ Válido
          </span>
        )}
      </div>

      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={id}
          type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          maxLength={maxLength}
          className="input-control"
          style={{
            ...style,
            ...borderStyle,
            paddingRight: isPasswordType ? '45px' : undefined
          }}
        />
        {isPasswordType && (
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {error ? (
        <span style={{ fontSize: '12px', color: 'var(--danger-color)', fontWeight: '600', marginTop: '4px', display: 'block', textAlign: 'left' }}>
          ⚠️ {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block', textAlign: 'left' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
