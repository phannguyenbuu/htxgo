import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { api } from "../api";

export default function UnitsPage() {
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    api.listUnits().then(setUnits).catch(() => setUnits([]));
  }, []);

  return (
    <div className="page">
      <Nav />
      <div className="content">
        <h2>Hop tac xa</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ten</th>
              <th>Ao</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.is_virtual ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
