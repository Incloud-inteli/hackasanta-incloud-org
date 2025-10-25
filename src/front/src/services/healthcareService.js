import axios from 'axios';

// Função para calcular a distância entre dois pontos em km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

// Função para buscar via Overpass API (dados mais detalhados do OpenStreetMap)
const searchViaOverpass = async (latitude, longitude, radius) => {
  try {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${latitude},${longitude});
        node["amenity"="clinic"](around:${radius},${latitude},${longitude});
        node["amenity"="doctors"](around:${radius},${latitude},${longitude});
        node["healthcare"="centre"](around:${radius},${latitude},${longitude});
        node["healthcare"="hospital"](around:${radius},${latitude},${longitude});
        node["healthcare"="clinic"](around:${radius},${latitude},${longitude});
        way["amenity"="hospital"](around:${radius},${latitude},${longitude});
        way["amenity"="clinic"](around:${radius},${latitude},${longitude});
        way["healthcare"="centre"](around:${radius},${latitude},${longitude});
        relation["amenity"="hospital"](around:${radius},${latitude},${longitude});
        relation["healthcare"="hospital"](around:${radius},${latitude},${longitude});
      );
      out center;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      }
    );

    if (!response.data?.elements) {
      return [];
    }

    return response.data.elements
      .filter(element => {
        if (!element.lat || !element.lon) return false;
        
        // Deve ter um nome válido (não aceitar elementos sem nome)
        const name = element.tags?.name || element.tags?.operator;
        if (!name || name.trim().length < 3) return false;
        
        // Verificar se tem tags de saúde
        const hasHealthTags = 
          element.tags?.amenity === 'hospital' ||
          element.tags?.amenity === 'clinic' ||
          element.tags?.amenity === 'doctors' ||
          element.tags?.healthcare === 'hospital' ||
          element.tags?.healthcare === 'clinic' ||
          element.tags?.healthcare === 'centre';
        
        return hasHealthTags;
      })
      .map(element => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        
        const distance = calculateDistance(latitude, longitude, lat, lon);
        const name = element.tags?.name || element.tags?.operator || 'Estabelecimento de Saúde';
        
        // Detecta o tipo real baseado nas tags e no nome
        const detectType = () => {
          const nameLower = name.toLowerCase();
          
          // Verifica por palavras-chave no nome
          if (nameLower.includes('hospital')) return 'Hospital';
          if (nameLower.includes('pronto socorro')) return 'Pronto Socorro';
          if (nameLower.includes('ubs') || nameLower.includes('unidade básica')) return 'UBS';
          if (nameLower.includes('posto de saúde')) return 'Posto de Saúde';
          if (nameLower.includes('centro de saúde')) return 'Centro de Saúde';
          if (nameLower.includes('clínica') || nameLower.includes('clinica')) return 'Clínica';
          if (nameLower.includes('consultório') || nameLower.includes('consultorio')) return 'Consultório';
          if (nameLower.includes('ambulatório') || nameLower.includes('ambulatorio')) return 'Ambulatório';
          if (nameLower.includes('laboratório') || nameLower.includes('laboratorio')) return 'Laboratório';
          if (nameLower.includes('vigilância') || nameLower.includes('vigilancia')) return 'Vigilância Sanitária';
          if (nameLower.includes('coordenadoria')) return 'Órgão Administrativo de Saúde';
          
          // Verifica pelas tags do OpenStreetMap
          if (element.tags?.amenity === 'hospital') return 'Hospital';
          if (element.tags?.amenity === 'clinic') return 'Clínica';
          if (element.tags?.amenity === 'doctors') return 'Consultório Médico';
          if (element.tags?.healthcare === 'hospital') return 'Hospital';
          if (element.tags?.healthcare === 'clinic') return 'Clínica';
          if (element.tags?.healthcare === 'centre') return 'Centro de Saúde';
          if (element.tags?.healthcare === 'laboratory') return 'Laboratório';
          
          // Padrão
          return 'Estabelecimento de Saúde';
        };
        
        return {
          id: `overpass_${element.id}`,
          name: name,
          latitude: lat,
          longitude: lon,
          address: formatAddress(element.tags),
          phone: element.tags?.phone || element.tags?.['contact:phone'],
          type: detectType(),
          healthcare: element.tags?.amenity || element.tags?.healthcare || 'health',
          website: element.tags?.website || element.tags?.['contact:website'],
          specialties: extractSpecialties(element.tags),
          distance: distance,
          source: 'overpass'
        };
      })
      .filter(place => place.distance && place.distance <= (radius / 1000));

  } catch (error) {
    console.warn('Erro na busca Overpass:', error.message);
    return [];
  }
};

// Função para buscar via Nominatim (busca por texto)
const searchViaNominatim = async (latitude, longitude, radius) => {
  try {
    const radiusInDegrees = radius / 111000;
    const queries = [
      'hospital',
      'clínica',
      'centro médico',
      'pronto socorro',
      'UBS',
      'unidade básica de saúde',
      'hospital oncologia',
      'hospital câncer',
      'clinica oncologica',
      'posto de saúde'
    ];
    
    let results = [];
    
    for (const query of queries) {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: query,
            format: 'json',
            limit: 8,
            bounded: 1,
            viewbox: `${longitude - radiusInDegrees},${latitude + radiusInDegrees},${longitude + radiusInDegrees},${latitude - radiusInDegrees}`,
            'accept-language': 'pt-BR',
            addressdetails: 1
          },
          timeout: 8000,
          headers: {
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
          }
        });
        
        if (response.data?.length > 0) {
          console.log(`🔍 Nominatim retornou ${response.data.length} resultados brutos para "${query}"`);
          
          const validResults = response.data
            .filter(item => {
              // Validação rigorosa: deve ser estabelecimento de saúde
              const isHealthcare = 
                item.type === 'hospital' || 
                item.type === 'clinic' || 
                item.type === 'doctors' ||
                item.class === 'amenity' ||
                item.category === 'health';
              
              // Rejeitar se for apenas rua ou endereço
              const isJustAddress = 
                item.type === 'road' || 
                item.type === 'residential' ||
                item.type === 'house' ||
                item.class === 'highway' ||
                item.class === 'place';
              
              // Nome deve conter palavras relacionadas a saúde
              const name = (item.display_name || '').toLowerCase();
              const hasHealthKeywords = 
                name.includes('hospital') ||
                name.includes('clínica') ||
                name.includes('clinica') ||
                name.includes('ubs') ||
                name.includes('unidade básica') ||
                name.includes('pronto socorro') ||
                name.includes('posto de saúde') ||
                name.includes('centro médico') ||
                name.includes('centro de saúde') ||
                name.includes('consultório') ||
                name.includes('ambulatório');
              
              const distance = calculateDistance(latitude, longitude, parseFloat(item.lat), parseFloat(item.lon));
              
              const isValid = (isHealthcare || hasHealthKeywords) && !isJustAddress && distance && distance <= (radius / 1000);
              
              // Log de rejeição para debug
              if (!isValid && distance && distance <= (radius / 1000)) {
                console.log(`❌ Rejeitado: ${item.display_name?.split(',')[0]} (type: ${item.type}, class: ${item.class})`);
              }
              
              return isValid;
            })
            .map(item => {
              const name = item.display_name?.split(',')[0] || 'Estabelecimento de Saúde';
              const nameLower = name.toLowerCase();
              
              // Detecta o tipo real baseado no nome e metadados
              const detectType = () => {
                // Verifica por palavras-chave no nome
                if (nameLower.includes('hospital')) return 'Hospital';
                if (nameLower.includes('pronto socorro')) return 'Pronto Socorro';
                if (nameLower.includes('ubs') || nameLower.includes('unidade básica')) return 'UBS';
                if (nameLower.includes('posto de saúde')) return 'Posto de Saúde';
                if (nameLower.includes('centro de saúde')) return 'Centro de Saúde';
                if (nameLower.includes('clínica') || nameLower.includes('clinica')) return 'Clínica';
                if (nameLower.includes('consultório') || nameLower.includes('consultorio')) return 'Consultório';
                if (nameLower.includes('ambulatório') || nameLower.includes('ambulatorio')) return 'Ambulatório';
                if (nameLower.includes('laboratório') || nameLower.includes('laboratorio')) return 'Laboratório';
                if (nameLower.includes('vigilância') || nameLower.includes('vigilancia')) return 'Vigilância Sanitária';
                if (nameLower.includes('coordenadoria')) return 'Órgão Administrativo de Saúde';
                
                // Verifica pelo tipo do Nominatim
                if (item.type === 'hospital') return 'Hospital';
                if (item.type === 'clinic') return 'Clínica';
                if (item.type === 'doctors') return 'Consultório Médico';
                
                // Padrão
                return 'Estabelecimento de Saúde';
              };
              
              return {
                id: `nominatim_${item.place_id}`,
                name: name,
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                address: item.display_name,
                phone: null,
                type: detectType(),
                healthcare: item.type || item.class || 'health',
                website: null,
                specialties: query.includes('oncologia') || query.includes('câncer') ? ['oncologia'] : [],
                distance: calculateDistance(latitude, longitude, parseFloat(item.lat), parseFloat(item.lon)),
                source: 'nominatim'
              };
            });
          
          results = [...results, ...validResults];
        }
      } catch (error) {
        console.warn(`Erro ao buscar "${query}":`, error.message);
        continue;
      }
    }
    
    return results;
  } catch (error) {
    console.warn('Erro na busca Nominatim:', error.message);
    return [];
  }
};

// Remove duplicatas inteligente baseado em nome e proximidade
const removeDuplicateHospitals = (hospitals) => {
  const unique = [];
  
  for (const hospital of hospitals) {
    const isDuplicate = unique.some(existing => {
      // Verifica se é o mesmo hospital baseado em:
      // 1. Nome similar (ignora maiúsculas e acentos)
      const nameMatch = normalizeString(hospital.name) === normalizeString(existing.name);
      
      // 2. Proximidade geográfica (menos de 100m)
      const distance = calculateDistance(
        hospital.latitude, hospital.longitude,
        existing.latitude, existing.longitude
      );
      const isNearby = distance && distance < 0.1; // 100 metros
      
      return nameMatch || isNearby;
    });
    
    if (!isDuplicate) {
      unique.push(hospital);
    }
  }
  
  return unique;
};

// Calcula score de relevância (oncológicos têm prioridade)
const calculateRelevanceScore = (hospital) => {
  let score = 0;
  
  // Hospitais oncológicos têm prioridade máxima
  if (hospital.type?.includes('Oncológico')) {
    score += 100;
  }
  
  // Especialidades oncológicas
  if (hospital.specialties?.some(s => 
    s.includes('oncologia') || s.includes('cancer') || s.includes('câncer')
  )) {
    score += 80;
  }
  
  // Hospitais conhecidos da nossa base têm prioridade
  if (hospital.source !== 'overpass' && hospital.source !== 'nominatim') {
    score += 60;
  }
  
  // Hospitais grandes/conhecidos
  if (hospital.name?.includes('Hospital') && !hospital.name?.includes('Clínica')) {
    score += 20;
  }
  
  // Penaliza por distância (quanto mais longe, menor o score)
  if (hospital.distance) {
    score -= hospital.distance * 2; // Reduz 2 pontos por km
  }
  
  return score;
};

// Normaliza string para comparação
const normalizeString = (str) => {
  return str?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim() || '';
};

// Formata endereço a partir das tags do OSM
const formatAddress = (tags) => {
  if (!tags) return '';
  
  const parts = [];
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:neighbourhood'] || tags['addr:suburb']) {
    parts.push(tags['addr:neighbourhood'] || tags['addr:suburb']);
  }
  if (tags['addr:city']) parts.push(tags['addr:city']);
  
  return parts.join(', ') || tags.name || '';
};

// Extrai especialidades das tags
const extractSpecialties = (tags) => {
  if (!tags) return [];
  
  const specialties = [];
  
  if (tags.healthcare) specialties.push(tags.healthcare);
  if (tags.medical_supply) specialties.push('suprimentos médicos');
  if (tags.name?.toLowerCase().includes('oncologia') || 
      tags.name?.toLowerCase().includes('câncer') ||
      tags.name?.toLowerCase().includes('cancer')) {
    specialties.push('oncologia');
  }
  
  return specialties;
};

// Função avançada para buscar hospitais usando múltiplas fontes com busca progressiva
const searchNearbyOncologyClinic = async (latitude, longitude, maxRadius = 15000) => {
  try {
    // Busca progressiva: começar com raio pequeno e expandir se necessário
    const searchRadii = [2000, 5000, 8000, maxRadius]; // 2km, 5km, 8km, 15km
    
    for (const radius of searchRadii) {
      console.log(`🏥 Buscando hospitais próximos a: ${latitude}, ${longitude} (raio: ${radius}m)`);
      let allResults = [];

      // 1. PRIMEIRA FONTE: Overpass API (dados completos do OpenStreetMap)
      console.log('🗺️ Buscando via Overpass API (OpenStreetMap)...');
      try {
        const overpassResults = await searchViaOverpass(latitude, longitude, radius);
        console.log(`🗺️ Overpass retornou ${overpassResults.length} resultados`);
        allResults = [...allResults, ...overpassResults];
      } catch (error) {
        console.warn('⚠️ Erro no Overpass API:', error.message);
      }

      // 2. SEGUNDA FONTE: Nominatim (busca por texto)
      console.log('🔍 Buscando via Nominatim...');
      try {
        const nominatimResults = await searchViaNominatim(latitude, longitude, radius);
        console.log(`🔍 Nominatim retornou ${nominatimResults.length} resultados`);
        allResults = [...allResults, ...nominatimResults];
      } catch (error) {
        console.warn('⚠️ Erro no Nominatim:', error.message);
      }

      if (allResults.length === 0) {
        console.log(`⚠️ Nenhum hospital encontrado no raio de ${radius/1000}km, expandindo busca...`);
        continue; // Tenta o próximo raio
      }

      console.log(`📊 Total de resultados no raio de ${radius/1000}km: ${allResults.length}`);

      // Remove duplicatas mais inteligente (baseado em nome e proximidade)
      const uniqueResults = removeDuplicateHospitals(allResults);
      console.log(`🎯 ${uniqueResults.length} hospitais únicos após remoção de duplicatas`);

      if (uniqueResults.length >= 3 || radius === maxRadius) {
        // Ordena prioritizando DISTÂNCIA para hospitais mais próximos
        const sortedResults = uniqueResults
          .map(hospital => ({
            ...hospital,
            relevanceScore: calculateProximityScore(hospital, radius)
          }))
          .sort((a, b) => {
            // Prioriza distância acima de tudo para hospitais próximos
            if (a.distance <= 3 && b.distance <= 3) {
              // Para hospitais muito próximos (≤3km), ordena apenas por distância
              return a.distance - b.distance;
            }
            // Para hospitais mais distantes, usa score de relevância + distância
            if (b.relevanceScore !== a.relevanceScore) {
              return b.relevanceScore - a.relevanceScore;
            }
            return a.distance - b.distance;
          })
          .slice(0, 10);

        console.log(`✅ Retornando ${sortedResults.length} hospitais mais próximos (raio: ${radius/1000}km)`);
        
        if (sortedResults.length > 0) {
          console.log('🏥 Hospitais encontrados (ordenados por proximidade):');
          sortedResults.forEach((h, i) => {
            const isOncological = h.specialties?.some(s => 
              s.includes('oncologia') || s.includes('cancer') || s.includes('câncer')
            ) || h.type?.includes('Oncológico');
            console.log(`  ${i + 1}. ${h.name} - ${h.distance?.toFixed(2)}km ${isOncological ? '🎯' : '🏥'}`);
          });
        }

        return sortedResults;
      }
    }

    throw new Error('Nenhum hospital encontrado na região especificada');
    
  } catch (error) {
    console.error('❌ Erro ao buscar hospitais próximos:', error);
    throw error;
  }
};

// Nova função de score que prioriza proximidade
const calculateProximityScore = (hospital, maxRadius) => {
  let score = 0;
  
  // Score baseado na proximidade (quanto mais próximo, maior o score)
  const proximityScore = Math.max(0, 100 - (hospital.distance * 10)); // Penaliza distância mais pesadamente
  score += proximityScore;
  
  // Bonus para hospitais oncológicos, mas menor que a proximidade
  const isOncological = hospital.specialties?.some(s => 
    s.includes('oncologia') || s.includes('cancer') || s.includes('câncer')
  ) || hospital.type?.includes('Oncológico') || hospital.name?.includes('Cancer');
  
  if (isOncological) {
    score += 20; // Bonus menor para oncologia
  }
  
  // Bonus menor para hospitais em geral
  if (hospital.healthcare === 'hospital') {
    score += 5;
  }
  
  return score;
};

// Função para buscar detalhes adicionais de um local usando a API do Nominatim
const getPlaceDetails = async (latitude, longitude) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay de 1s entre requisições
    
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        format: 'json',
        lat: latitude,
        lon: longitude,
        'accept-language': 'pt-BR'
      },
      timeout: 10000, // 10 segundos de timeout
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do local:', error);
    return null;
  }
};

export const healthcareService = {
  searchNearbyOncologyClinic,
  getPlaceDetails
};