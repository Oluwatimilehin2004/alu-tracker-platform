import stock from '@/seeds/cars/M/McLaren/B/sevenSixtyFiveLT/stats/stock.json';
import stages from '@/seeds/cars/M/McLaren/B/sevenSixtyFiveLT/stats/stages';
import maxStar from '@/seeds/cars/M/McLaren/B/sevenSixtyFiveLT/stats/maxStar.json';
import gold from '@/seeds/cars/M/McLaren/B/sevenSixtyFiveLT/stats/gold.json';

export default { ...stock, ...stages, maxStar, ...gold };
