import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-admin">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-grid">
        {/* Card 1 - Total de pacientes */}
        <div className="dashboard-card">
          <h2 className="card-title">Total de pacientes</h2>
          <div className="card-number">1.234</div>
          <p className="card-subtitle">Aumento de 12% este mês</p>
        </div>

        {/* Card 2 - Riscos detectados */}
        <div className="dashboard-card">
          <h2 className="card-title">Riscos detectados</h2>
          <div className="risk-stats">
            <div className="risk-item">
              <span className="risk-label alto">Alto:</span>
              <span className="risk-value">45</span>
            </div>
            <div className="risk-item">
              <span className="risk-label medio">Médio:</span>
              <span className="risk-value">120</span>
            </div>
            <div className="risk-item">
              <span className="risk-label baixo">Baixo:</span>
              <span className="risk-value">300</span>
            </div>
          </div>
        </div>

        {/* Card 3 - Ligações realizadas */}
        <div className="dashboard-card">
          <h2 className="card-title">Ligações realizadas</h2>
          <div className="card-number">856</div>
          <p className="card-subtitle">Esta semana: 245 ligações</p>
        </div>

        {/* Card 4 - Locais cadastrados */}
        <div className="dashboard-card">
          <h2 className="card-title">Locais cadastrados</h2>
          <div className="card-number">28</div>
          <p className="card-subtitle">Últimos 30 dias: +5 novos</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
