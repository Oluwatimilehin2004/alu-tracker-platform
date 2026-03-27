import stock from '@/seeds/cars/C/Citroën/A/gtByCitroen/stats/stock.json';
import stages from '@/seeds/cars/C/Citroën/A/gtByCitroen/stats/stages';
import maxStar from '@/seeds/cars/C/Citroën/A/gtByCitroen/stats/maxStar.json';
import gold from '@/seeds/cars/C/Citroën/A/gtByCitroen/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
