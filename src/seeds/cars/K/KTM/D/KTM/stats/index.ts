import stock from '@/seeds/cars/K/KTM/D/KTM/stats/stock.json';
import stages from '@/seeds/cars/K/KTM/D/KTM/stats/stages';
import maxStar from '@/seeds/cars/K/KTM/D/KTM/stats/maxStar.json';
import gold from '@/seeds/cars/K/KTM/D/KTM/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
