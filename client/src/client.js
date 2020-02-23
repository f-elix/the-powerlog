import * as sapper from '@sapper/app';
import './assets/css/global.css';
import './assets/css/reset.css';

sapper.start({
	target: document.querySelector('#sapper')
});
