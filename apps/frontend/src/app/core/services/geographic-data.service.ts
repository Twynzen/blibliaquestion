import { Injectable } from '@angular/core';

export interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export interface State {
  name: string;
  countryCode: string;
}

export interface City {
  name: string;
  stateName: string;
  countryCode: string;
}

@Injectable({ providedIn: 'root' })
export class GeographicDataService {

  // Lista de países con indicativos telefónicos
  readonly countries: Country[] = [
    { code: 'CO', name: 'Colombia', flag: '🇨🇴', phoneCode: '+57' },
    { code: 'MX', name: 'México', flag: '🇲🇽', phoneCode: '+52' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', phoneCode: '+54' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪', phoneCode: '+51' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱', phoneCode: '+56' },
    { code: 'EC', name: 'Ecuador', flag: '🇪🇨', phoneCode: '+593' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪', phoneCode: '+58' },
    { code: 'ES', name: 'España', flag: '🇪🇸', phoneCode: '+34' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', phoneCode: '+1' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷', phoneCode: '+55' },
    { code: 'BO', name: 'Bolivia', flag: '🇧🇴', phoneCode: '+591' },
    { code: 'PY', name: 'Paraguay', flag: '🇵🇾', phoneCode: '+595' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾', phoneCode: '+598' },
    { code: 'PA', name: 'Panamá', flag: '🇵🇦', phoneCode: '+507' },
    { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', phoneCode: '+506' },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹', phoneCode: '+502' },
    { code: 'HN', name: 'Honduras', flag: '🇭🇳', phoneCode: '+504' },
    { code: 'SV', name: 'El Salvador', flag: '🇸🇻', phoneCode: '+503' },
    { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', phoneCode: '+505' },
    { code: 'DO', name: 'Rep. Dominicana', flag: '🇩🇴', phoneCode: '+1' },
    { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', phoneCode: '+1' },
    { code: 'CU', name: 'Cuba', flag: '🇨🇺', phoneCode: '+53' },
  ];

  // Estados/Departamentos por país (principales)
  private readonly statesData: Record<string, string[]> = {
    'CO': [
      'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
      'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó',
      'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
      'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
      'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
      'Valle del Cauca', 'Vaupés', 'Vichada', 'Bogotá D.C.'
    ],
    'MX': [
      'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
      'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
      'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
      'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
      'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
      'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
    ],
    'AR': [
      'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autónoma de Buenos Aires',
      'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa',
      'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta',
      'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
      'Tierra del Fuego', 'Tucumán'
    ],
    'PE': [
      'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
      'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
      'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua',
      'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
    ],
    'CL': [
      'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
      'Valparaíso', 'Metropolitana de Santiago', "O'Higgins", 'Maule', 'Ñuble',
      'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
    ],
    'EC': [
      'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
      'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
      'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
      'Pichincha', 'Santa Elena', 'Santo Domingo', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
    ],
    'VE': [
      'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
      'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
      'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas',
      'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'
    ],
    'ES': [
      'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria',
      'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Ceuta', 'Comunidad Valenciana',
      'Extremadura', 'Galicia', 'La Rioja', 'Madrid', 'Melilla', 'Murcia', 'Navarra', 'País Vasco'
    ],
    'US': [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
      'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
      'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
      'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
      'West Virginia', 'Wisconsin', 'Wyoming'
    ]
  };

  // Ciudades principales por departamento (Colombia como ejemplo detallado)
  private readonly citiesData: Record<string, Record<string, string[]>> = {
    'CO': {
      'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro', 'Caucasia'],
      'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia'],
      'Bogotá D.C.': ['Bogotá'],
      'Bolívar': ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'Carmen de Bolívar'],
      'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa'],
      'Caldas': ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría'],
      'Caquetá': ['Florencia', 'San Vicente del Caguán'],
      'Casanare': ['Yopal', 'Aguazul', 'Villanueva'],
      'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada'],
      'Cesar': ['Valledupar', 'Aguachica', 'Bosconia'],
      'Chocó': ['Quibdó', 'Istmina', 'Tadó'],
      'Córdoba': ['Montería', 'Lorica', 'Cereté', 'Sahagún'],
      'Cundinamarca': ['Soacha', 'Facatativá', 'Zipaquirá', 'Chía', 'Fusagasugá', 'Girardot', 'Madrid'],
      'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata'],
      'La Guajira': ['Riohacha', 'Maicao', 'Uribia'],
      'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación'],
      'Meta': ['Villavicencio', 'Acacías', 'Granada'],
      'Nariño': ['Pasto', 'Tumaco', 'Ipiales'],
      'Norte de Santander': ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario'],
      'Quindío': ['Armenia', 'Calarcá', 'Montenegro'],
      'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
      'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja'],
      'Sucre': ['Sincelejo', 'Corozal', 'San Marcos'],
      'Tolima': ['Ibagué', 'Espinal', 'Melgar', 'Honda'],
      'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Buga', 'Cartago', 'Jamundí'],
      'Amazonas': ['Leticia'],
      'Arauca': ['Arauca', 'Saravena'],
      'Guainía': ['Inírida'],
      'Guaviare': ['San José del Guaviare'],
      'Putumayo': ['Mocoa', 'Puerto Asís'],
      'San Andrés y Providencia': ['San Andrés', 'Providencia'],
      'Vaupés': ['Mitú'],
      'Vichada': ['Puerto Carreño']
    }
  };

  /**
   * Obtiene la lista de países ordenados
   */
  getCountries(): Country[] {
    return [...this.countries].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtiene los estados/departamentos de un país
   */
  getStates(countryCode: string): string[] {
    const states = this.statesData[countryCode];
    if (states) {
      return [...states].sort((a, b) => a.localeCompare(b));
    }
    return [];
  }

  /**
   * Obtiene las ciudades de un departamento
   */
  getCities(countryCode: string, stateName: string): string[] {
    const countryCities = this.citiesData[countryCode];
    if (countryCities) {
      const cities = countryCities[stateName];
      if (cities) {
        return [...cities].sort((a, b) => a.localeCompare(b));
      }
    }
    return [];
  }

  /**
   * Obtiene un país por su código
   */
  getCountryByCode(code: string): Country | undefined {
    return this.countries.find(c => c.code === code);
  }

  /**
   * Formatea el indicativo telefónico para mostrar
   */
  formatPhoneIndicator(country: Country): string {
    return `${country.flag} ${country.name} (${country.phoneCode})`;
  }
}
