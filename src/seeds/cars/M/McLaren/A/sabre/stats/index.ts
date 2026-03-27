import stock from '@/seeds/cars/M/McLaren/A/sabre/stats/stock.json';
import stages from '@/seeds/cars/M/McLaren/A/sabre/stats/stages';
import maxStar from '@/seeds/cars/M/McLaren/A/sabre/stats/maxStar.json';
import gold from '@/seeds/cars/M/McLaren/A/sabre/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
