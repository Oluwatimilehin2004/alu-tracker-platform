import stock from '@/seeds/cars/K/Koenigsegg/S/ageraRS/stats/stock.json';
import stages from '@/seeds/cars/K/Koenigsegg/S/ageraRS/stats/stages';
import maxStar from '@/seeds/cars/K/Koenigsegg/S/ageraRS/stats/maxStar.json';
import gold from '@/seeds/cars/K/Koenigsegg/S/ageraRS/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
