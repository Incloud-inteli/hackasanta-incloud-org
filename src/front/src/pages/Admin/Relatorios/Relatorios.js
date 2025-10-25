import React from 'react';
import './Relatorios.css';

const Relatorios = () => {
  return (
    <div className="relatorios-admin">
      <h1 className="relatorios-title">Relatórios e Analytics</h1>

      <div className="relatorios-content">
        {/* Card de Taxa de contatos concluídos */}
        <div className="relatorios-card">
          <h2 className="relatorios-card-title">Taxa de contatos concluídos</h2>
          
          <div className="relatorios-stats">
            <div className="stat-item">
              <span className="stat-label">Taxa de Sucesso:</span>
              <span className="stat-value">94.2%</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Contatos Agendados:</span>
              <span className="stat-value">1.045</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Contatos Concluídas:</span>
              <span className="stat-value">984</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Perdidas/Reagendadas:</span>
              <span className="stat-value">61</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
