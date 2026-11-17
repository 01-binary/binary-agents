import { Link } from 'react-router-dom';

type User = { id: string; name: string; email: string; joinedAt: string };

export function UserTable({ users }: { users: User[] }) {
  return (
    <table>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} style={{ position: 'relative' }}>
            <td>
              <Link to={`/users/${user.id}`} className="row-link">{user.name}</Link>
            </td>
            <td>{user.email}</td>
            <td>{user.joinedAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
// .row-link::after { content: ''; position: absolute; inset: 0; }
