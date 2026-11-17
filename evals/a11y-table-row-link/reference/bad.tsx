import { useNavigate } from 'react-router-dom';

type User = { id: string; name: string; email: string; joinedAt: string };

export function UserTable({ users }: { users: User[] }) {
  const navigate = useNavigate();
  return (
    <table>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} onClick={() => navigate(`/users/${user.id}`)} style={{ cursor: 'pointer' }}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.joinedAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
