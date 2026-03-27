import stock from '@/seeds/cars/M/McLaren/C/gt/stats/stock.json';
import stages from '@/seeds/cars/M/McLaren/C/gt/stats/stages';
import maxStar from '@/seeds/cars/M/McLaren/C/gt/stats/maxStar.json';
import gold from '@/seeds/cars/M/McLaren/C/gt/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
