import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import './assets/css/global.css';
import './assets/css/reset.css';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

polka() // You can also use Express
	.use('the-powerlog', compression({ threshold: 0 }), sirv('static', { dev }), sapper.middleware())
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
