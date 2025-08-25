import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get(`accounts/user/${id}/`)
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, [id]);

  if (!user) return <div>User not found.</div>;

  return (
    <div>
      <h2>{user.username}</h2>
      <p>Email: {user.email}</p>
      <p>First Name: {user.first_name}</p>
      <p>Last Name: {user.last_name}</p>
      <p>Created At: {user.created_at}</p>
      <p>Updated At: {user.updated_at}</p>
    </div>
  );
}

export default UserDetail;