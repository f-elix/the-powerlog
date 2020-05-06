import * as sapper from '@sapper/app';
import './assets/css/reset.css';
import './assets/css/global.css';

sapper.start({
	target: document.querySelector('#sapper')
});
