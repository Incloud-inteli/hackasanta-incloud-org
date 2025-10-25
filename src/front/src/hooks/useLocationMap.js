import { useState, useEffect, useRef } from 'react';

export const useLocationMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasRequested = useRef(false); // Evita múltiplas requisições

  useEffect(() => {
    // Evita executar múltiplas vezes
    if (hasRequested.current) return;
    hasRequested.current = true;

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        setLocationError('Seu navegador não suporta geolocalização.');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          setLoading(false);
        },
        (error) => {
          let errorMsg = 'Erro ao obter sua localização.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Permissão de localização negada.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Não foi possível obter sua localização atual.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Tempo esgotado ao tentar obter a localização.';
              break;
            default:
              errorMsg = 'Erro desconhecido ao tentar obter sua localização.';
          }
          
          setLocationError(errorMsg);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    getCurrentLocation();
  }, []);

  return {
    userLocation,
    locationError,
    loading
  };
};