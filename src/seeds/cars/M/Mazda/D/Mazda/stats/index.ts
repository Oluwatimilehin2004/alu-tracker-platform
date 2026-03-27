import stock from '@/seeds/cars/M/Mazda/D/Mazda/stats/stock.json';
import stages from '@/seeds/cars/M/Mazda/D/Mazda/stats/stages';
import maxStar from '@/seeds/cars/M/Mazda/D/Mazda/stats/maxStar.json';
import gold from '@/seeds/cars/M/Mazda/D/Mazda/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
