import React, { useState } from 'react';

export default function AuthInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  maxLength,
  style = {}
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';

  return (
    <div className="form-group" style={{ position: 'relative', width: '100%' }}>
      <label className="input-label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={id}
          type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          className="input-control"
          style={{
            ...style,
            paddingRight: isPasswordType ? '45px' : undefined
          }}
        />
        {isPasswordType && (
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );
}
