import { useState, useEffect } from 'react';
import { getTransactions, getMembers, getLoans } from '../lib/store';
import { Wallet, Coins, CircleDollarSign, Banknote } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalSavings: 0, goldInvestment: 0, silverInvestment: 0, membersCount: 0, activeLoans: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([getTransactions(), getMembers(), getLoans()]).then(([data, members, loansData]) => {
      let tSavings = 0, gInv = 0, sInv = 0;
      data.forEach(tx => {
        if (tx.type === 'savings' || tx.type.includes('loan_')) {
          // Both savings deposits and loan logs use the same cash pool conceptually
          // But to be exact: Total Vault Savings should be 'savings' + interest minus loans given
          // But as requested initially, simple accumulation of savings:
        }
        if (tx.type === 'savings') tSavings += Number(tx.amount);
        if (tx.type === 'gold') gInv += Number(tx.amount);
        if (tx.type === 'silver') sInv += Number(tx.amount);
      });
      let activeLoansAmount = 0;
      if (loansData) {
        loansData.forEach(loan => {
          if (loan.status === 'active') {
            activeLoansAmount += Number(loan.principal);
          }
        });
      }
      setStats({
        totalSavings: tSavings,
        goldInvestment: gInv,
        silverInvestment: sInv,
        membersCount: members.length,
        activeLoans: activeLoansAmount
      });
      setRecent(data.slice(0, 5));
    });
  }, []);

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 32 }}>
        <h1>Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time updates on Mitra Mandal finances.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        <div className="glass-panel glass-panel-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, color: 'var(--accent-green)' }}>
            <Wallet size={120} />
          </div>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Total Vault Savings</h3>
          </div>
          <h1 style={{ fontSize: '3rem', color: 'var(--accent-green)' }}>
            ₹{stats.totalSavings.toLocaleString()}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>from {stats.membersCount} active members</p>
        </div>

        <div className="glass-panel glass-panel-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, color: 'var(--accent-gold)' }}>
            <CircleDollarSign size={120} />
          </div>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Gold Investments</h3>
          </div>
          <h1 style={{ fontSize: '3rem', color: 'var(--accent-gold)' }}>
            ₹{stats.goldInvestment.toLocaleString()}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Safe haven assets</p>
        </div>

        <div className="glass-panel glass-panel-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, color: 'var(--accent-silver)' }}>
            <Coins size={120} />
          </div>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Silver Investments</h3>
          </div>
          <h1 style={{ fontSize: '3rem', color: 'var(--accent-silver)' }}>
            ₹{stats.silverInvestment.toLocaleString()}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Diversified portfolio</p>
        </div>

        <div className="glass-panel glass-panel-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, color: '#3b82f6' }}>
            <Banknote size={120} />
          </div>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Active Loans Given</h3>
          </div>
          <h1 style={{ fontSize: '3rem', color: '#3b82f6' }}>
            ₹{stats.activeLoans?.toLocaleString() || 0}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Currently disbursed out</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Activity</h2>
        {recent.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No transactions yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Member / Entity</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{r.member}</td>
                  <td>
                    <span className={`badge ${r.type.includes('savings') || r.type.includes('loan') ? 'badge-savings' : r.type === 'gold' ? 'badge-gold' : 'badge-silver'}`}>
                      {r.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>₹{r.amount.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
