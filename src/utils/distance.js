// const axios = require('axios');

// async function geocode(location) {
//   const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

//   try {
//     const response = await axios.get(apiUrl);
//     const result = response.data[0];
//     return { lat: result.lat, lon: result.lon };
//   } catch (error) {
//     console.error('Error geocoding:', error);
//     throw error;
//   }
// }

// async function reverseGeocode(lat, lon) {
//   const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

//   try {
//     const response = await axios.get(apiUrl);
//     const address = response.data.display_name;
//     return address;
//   } catch (error) {
//     console.error('Error reverse geocoding:', error);
//     throw error;
//   }
// }

// function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
//   const earthRadius = 6371; // Radius of the Earth in kilometers

//   const radLat1 = (lat1 * Math.PI) / 180;
//   const radLon1 = (lon1 * Math.PI) / 180;
//   const radLat2 = (lat2 * Math.PI) / 180;
//   const radLon2 = (lon2 * Math.PI) / 180;

//   const deltaLat = radLat2 - radLat1;
//   const deltaLon = radLon2 - radLon1;

//   const a =
//     Math.sin(deltaLat / 2) ** 2 +
//     Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   const distance = earthRadius * c;

//   return distance;
// }

// module.exports = {
//   geocode,
//   reverseGeocode,
//   calculateHaversineDistance,
// };
