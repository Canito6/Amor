import React from 'react';
import UserRow from './UserRow';

export default function UserTable({
  users,
  meuNome,
  language,
  t,
  onEditUser,
  onChangeUserRole,
  onDeleteUser
}) {
  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>{language === 'pt' ? 'Nome' : 'Name'}</th>
            <th>Email</th>
            <th style={{ textAlign: 'center' }}>{language === 'pt' ? 'Cargo' : 'Role'}</th>
            <th style={{ textAlign: 'center' }}>{language === 'pt' ? 'Ações' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              meuNome={meuNome}
              language={language}
              t={t}
              onEdit={onEditUser}
              onChangeRole={onChangeUserRole}
              onDelete={onDeleteUser}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
