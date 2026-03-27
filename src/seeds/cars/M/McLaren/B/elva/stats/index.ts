import stock from '@/seeds/cars/M/McLaren/B/elva/stats/stock.json';
import stages from '@/seeds/cars/M/McLaren/B/elva/stats/stages';
import maxStar from '@/seeds/cars/M/McLaren/B/elva/stats/maxStar.json';
import gold from '@/seeds/cars/M/McLaren/B/elva/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
