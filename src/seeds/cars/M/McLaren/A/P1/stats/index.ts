import stock from '@/seeds/cars/M/McLaren/A/P1/stats/stock.json';
import stages from '@/seeds/cars/M/McLaren/A/P1/stats/stages';
import maxStar from '@/seeds/cars/M/McLaren/A/P1/stats/maxStar.json';
import gold from '@/seeds/cars/M/McLaren/A/P1/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
