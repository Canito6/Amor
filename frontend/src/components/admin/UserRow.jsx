

export default function UserRow({
  user,
  meuNome,
  language,
  onEdit,
  onChangeRole,
  onDelete
}) {
  return (
    <tr>
      <td style={{ fontWeight: '600' }}>
        {user.username}{' '}
        {user.username === meuNome && (
          <span style={{ color: 'var(--primary-color)' }}>
            {language === 'pt' ? '(Tu)' : '(You)'}
          </span>
        )}
      </td>
      <td>{user.email}</td>
      <td style={{ textAlign: 'center' }}>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '700',
            backgroundColor: user.role === 'admin' ? '#ffe3e3' : '#e6fffa',
            color: user.role === 'admin' ? 'var(--danger-color)' : 'var(--success-color)'
          }}
        >
          {user.role}
        </span>
      </td>
      <td style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '8px' }}>
          <button
            onClick={() => onEdit(user)}
            className="btn"
            style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#e2e8f0', color: '#4a5568' }}
          >
            ✏️ {language === 'pt' ? 'Editar' : 'Edit'}
          </button>
          <button
            onClick={() => onChangeRole(user)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            {language === 'pt' ? 'Tornar' : 'Make'} {user.role === 'admin' ? 'User' : 'Admin'}
          </button>
          {user.username !== meuNome && (
            <button
              onClick={() => onDelete(user)}
              className="btn btn-danger"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              {language === 'pt' ? 'Apagar' : 'Delete'}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
