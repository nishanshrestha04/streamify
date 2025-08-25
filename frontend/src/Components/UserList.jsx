import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('accounts/user/')
      .then(res => setUsers(res.data))
      .catch(err => alert('Error fetching users'));
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <Link to={`/user/${user.id}`}>{user.username}</Link> ({user.email})
        </li>
      ))}
    </ul>
  );
}

export default UserList;