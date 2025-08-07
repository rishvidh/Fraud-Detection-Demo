import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminView.css"; // 👈 create this file

const AdminView = ({ auth }) => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = () => {
    axios
      .get("http://localhost:8000/transactions", {
        auth: { username: auth.username, password: auth.password },
      })
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 500); // adjusted for performance
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="table-card">
        <h2>All Transactions</h2>
        <div className="table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CC Number</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className={t.prediction === 1 ? "fraud-row" : "legit-row"}
                >
                  <td>{t.id}</td>
                  <td>{t.input.cc_num}</td>
                  <td>${Number(t.input.amt).toFixed(2)}</td>
                  <td className="status">
                    <span className={`pill ${t.prediction === 1 ? "fraud" : "legit"}`}>
                      {t.prediction === 1 ? "Fraud" : "Legit"}
                    </span>{" "}
                    <span className="confidence">
                      ({parseFloat(t.fraud_probability).toFixed(4)})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
