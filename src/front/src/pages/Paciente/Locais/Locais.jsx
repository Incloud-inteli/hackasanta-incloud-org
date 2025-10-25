import React from 'react';
import { MapPin, Phone, Clock, Check } from 'lucide-react';
import { useLocationMap } from '../../../hooks/useLocationMap';
import { healthcareService } from '../../../services/healthcareService';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Locais.css';

// Fix para os ícones do Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Locais = () => {
  const { userLocation, locationError, loading } = useLocationMap();
  const [locaisProximos, setLocaisProximos] = useState([]);
  const [loadingLocais, setLoadingLocais] = useState(true);
  const [cep, setCep] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState('');
  const [locationFromCep, setLocationFromCep] = useState(null);


  // Função para buscar coordenadas a partir do CEP
  const buscarPorCep = async (e) => {
    e.preventDefault();
    
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      setErroCep('Por favor, insira um CEP válido com 8 dígitos');
      return;
    }
    
    setBuscandoCep(true);
    setErroCep('');
    setLoadingLocais(true);
    
    try {
      // Busca o CEP usando a API ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setErroCep('CEP não encontrado. Verifique e tente novamente.');
        setBuscandoCep(false);
        setLoadingLocais(false);
        return;
      }
      
      // Monta query de busca mais específica
      const queries = [
        `${data.cep}, Brasil`,
        `${data.logradouro}, ${data.localidade}, ${data.uf}, Brasil`,
        `${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`,
        `${data.localidade}, ${data.uf}, Brasil`
      ];
      
      let geoData = null;
      
      // Tenta cada query até encontrar resultado
      for (const query of queries) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Delay entre requisições
          
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            {
              headers: {
                'Accept-Language': 'pt-BR,pt;q=0.9'
              }
            }
          );
          const result = await geoResponse.json();
          
          if (result && result.length > 0) {
            geoData = result;
            break;
          }
        } catch (error) {
          console.warn(`Erro com query "${query}":`, error);
          continue;
        }
      }
      
      if (geoData && geoData.length > 0) {
        const location = {
          latitude: parseFloat(geoData[0].lat),
          longitude: parseFloat(geoData[0].lon),
          address: `${data.logradouro || data.bairro}, ${data.bairro} - ${data.localidade}, ${data.uf}`
        };
        
        // Salva a localização obtida pelo CEP
        setLocationFromCep(location);
        
        // Busca os locais próximos com as coordenadas obtidas
        await buscarLocaisProximos(location);
      } else {
        setErroCep(`Não foi possível encontrar a localização do CEP ${data.localidade}, ${data.uf}. Tente com outro CEP.`);
        setLoadingLocais(false);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setErroCep('Erro ao buscar CEP. Verifique se o CEP está correto e tente novamente.');
      setLoadingLocais(false);
    } finally {
      setBuscandoCep(false);
    }
  };

  // Função extraída para buscar locais próximos
  const buscarLocaisProximos = async (location) => {
    try {
      setLoadingLocais(true);
      const clinicas = await healthcareService.searchNearbyOncologyClinic(
        location.latitude,
        location.longitude,
        10000 // raio de 10km
      );

      // Limita a 5 clínicas mais próximas
      const clinicasProximas = clinicas.slice(0, 5);
      const clinicasDetalhadas = clinicasProximas.map(clinica => ({
        ...clinica,
        endereco: formatarEnderecoSimples(clinica.address),
        cidade: 'São Paulo',
        estado: 'SP'
      }));

      setLocaisProximos(clinicasDetalhadas);
      

    } catch (error) {
      console.error('Erro ao buscar locais próximos:', error);
      
      // Define uma mensagem de erro amigável
      let mensagemErro = 'Não foi possível buscar os locais neste momento.';
      if (error.code === 'ERR_BAD_RESPONSE' && error.response?.status === 504) {
        mensagemErro = 'O serviço de busca está temporariamente indisponível. Tente novamente em alguns instantes.';
      } else if (error.code === 'ECONNABORTED') {
        mensagemErro = 'A busca demorou muito. Tente novamente.';
      }
      
      setErroCep(mensagemErro);
      setLocaisProximos([]);
    } finally {
      setLoadingLocais(false);
    }
  };

  // Função para formatar endereço de forma concisa
  const formatarEndereco = (detalhes) => {
    if (!detalhes || !detalhes.address) return 'Endereço não disponível';
    
    const { address } = detalhes;
    const partes = [];
    
    // Adiciona rua e número
    if (address.road) {
      const rua = address.house_number 
        ? `${address.road}, ${address.house_number}`
        : address.road;
      partes.push(rua);
    }
    
    // Adiciona bairro
    if (address.suburb || address.neighbourhood) {
      partes.push(address.suburb || address.neighbourhood);
    }
    
    // Adiciona cidade
    if (address.city || address.town || address.village) {
      partes.push(address.city || address.town || address.village);
    }
    
    return partes.join(' - ') || 'Endereço não disponível';
  };

  // Função para formatar endereço do display_name do Nominatim
  const formatarEnderecoSimples = (displayName) => {
    if (!displayName) return 'Endereço não disponível';
    
    // O display_name vem como: "Nome, Rua, Bairro, Cidade, Estado, País"
    // Vamos pegar apenas as 3 primeiras partes relevantes
    const partes = displayName.split(',').map(p => p.trim());
    
    // Remove o primeiro elemento (nome do lugar) e pega os próximos 2-3 elementos
    return partes.slice(1, 4).join(', ') || displayName;
  };

  useEffect(() => {
    const fetchLocaisProximos = async () => {
      if (!userLocation) return;
      await buscarLocaisProximos(userLocation);
    };
    fetchLocaisProximos();
  }, [userLocation]);

  if (loading) {
    return (
      <main className="locais-page">
        <h1 className="locais-title">Locais de Atendimento</h1>
        <div className="map-container">
          <div className="map-placeholder">
            <div className="loading-spinner"></div>
            <h2 className="map-text">Obtendo sua localização</h2>
            <p className="map-text">Por favor, permita o acesso quando solicitado</p>
          </div>
        </div>
      </main>
    );
  }

  if (locationError && !locationFromCep) {
    return (
      <main className="locais-page">
        <h1 className="locais-title">Locais de Atendimento</h1>
        <div className="map-container">
          <div className="map-placeholder compact">
            <p className="map-text small" style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem' }}>
              {locationError}
            </p>
            
            {/* Formulário de CEP como alternativa */}
            <div className="cep-form-container compact">
              
              <p className="map-text" style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                Informe seu CEP
              </p>
              <p className="map-text small" style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '0.75rem' }}>
                Vamos encontrar as clínicas mais próximas de você
              </p>
              
              <form onSubmit={buscarPorCep} className="cep-form">
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 8) {
                      // Formata o CEP: 12345-678
                      const cepFormatado = valor.length > 5 
                        ? `${valor.slice(0, 5)}-${valor.slice(5)}`
                        : valor;
                      setCep(cepFormatado);
                      setErroCep('');
                    }
                  }}
                  placeholder="00000-000"
                  className="cep-input"
                  maxLength="9"
                  disabled={buscandoCep}
                />
                <button 
                  type="submit" 
                  className="cep-submit-button"
                  disabled={buscandoCep || cep.length < 9}
                >
                  {buscandoCep ? (
                    <>
                      <div className="button-spinner"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <MapPin size={16} />
                      Buscar
                    </>
                  )}
                </button>
              </form>
              {erroCep && (
                <div className="cep-error compact">
                  <span>⚠️</span>
                  <span>{erroCep}</span>
                </div>
              )}
            </div>
            
            <div className="divider compact" style={{ marginTop: '1rem' }}>
              <span className="divider-text">ou</span>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="location-retry-button secondary compact"
            >
              Permitir localização GPS
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loadingLocais) {
    return (
      <main className="locais-page">
        <h1 className="locais-title">Locais de Atendimento</h1>
        <div className="map-container">
          <div className="map-placeholder">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <MapPin className="loading-icon" size={32} />
            </div>
            <h2 className="map-text">Procurando clínicas próximas</h2>
            <p className="map-text" style={{ fontSize: '1rem', opacity: 0.9 }}>
              Estamos buscando as melhores opções na sua região...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Usa locationFromCep se disponível, senão usa userLocation
  const currentLocation = locationFromCep || userLocation;



  return (
    <main className="locais-page">
      <div className="page-header">
        <h1 className="locais-title">Locais de Atendimento</h1>

      </div>

      {/* Map */}
      <div className="map-container">
        <MapContainer
          center={[currentLocation.latitude, currentLocation.longitude]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marcador do usuário */}
          <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
            <Popup>
              <div className="text-center">
                <p className="font-bold">Sua localização</p>
                {currentLocation.address && <p>{currentLocation.address}</p>}
              </div>
            </Popup>
          </Marker>

          {/* Marcadores dos locais de atendimento */}
          {locaisProximos.map((local) => (
            <Marker
              key={local.id}
              position={[local.latitude, local.longitude]}
            >
              <Popup>
                <div>
                  <h3 className="font-bold text-lg">{local.name}</h3>
                  <p>{local.endereco}</p>
                  <p>{local.cidade} - {local.estado}</p>
                  {local.phone && <p className="mt-2">Tel: {local.phone}</p>}
                  {local.website && (
                    <p className="mt-2">
                      <a 
                        href={local.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-600">
                    Distância: {local.distance.toFixed(1)} km
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Tipo: {local.type}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="locations-grid">
        {erroCep ? (
          <div className="location-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <h2 className="location-title">Erro ao buscar locais</h2>
            <div className="location-info">
              <div className="info-item">
                <MapPin className="info-icon icon-red" />
                <span className="info-text">{erroCep}</span>
              </div>
              <button
                onClick={() => {
                  setErroCep('');
                  if (userLocation) {
                    buscarLocaisProximos(userLocation);
                  }
                }}
                className="location-retry-button"
                style={{ marginTop: '1rem', backgroundColor: '#5b6fd8', color: 'white' }}
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : locaisProximos.length === 0 ? (
          <div className="location-card">
            <h2 className="location-title">Nenhum local encontrado</h2>
            <div className="location-info">
              <div className="info-item">
                <MapPin className="info-icon icon-orange" />
                <span className="info-text">Não encontramos clínicas ou hospitais próximos à sua localização</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {locaisProximos.map((local) => (
              <div key={local.id} className="location-card">
                <h2 className="location-title">{local.name}</h2>
                <div className="location-info">
                  <div className="info-item">
                    <MapPin className="info-icon icon-red" />
                    <span className="info-text">{local.endereco}</span>
                  </div>

                  {local.phone && (
                    <div className="info-item">
                      <Phone className="info-icon icon-green" />
                      <span className="info-text">{local.phone}</span>
                    </div>
                  )}

                  <div className="info-item">
                    <Clock className="info-icon icon-orange" />
                    <span className="info-text">
                      Distância: {local.distance.toFixed(1)} km
                    </span>
                  </div>

                  <div className="info-item">
                    <Check className="info-icon icon-blue" />
                    <span className="info-text">
                      {local.healthcare === 'hospital' ? 'Hospital' : 'Clínica'}
                      {local.type && 
                       local.type !== 'Não especificado' && 
                       local.type !== 'Hospital' && 
                       local.type !== 'Clínica' && 
                       ` - ${local.type}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
};

export default Locais;