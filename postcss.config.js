const prod = process.env.NODE_ENV === 'production';

module.exports = {
	plugins: [
		require('postcss-import'),
		require('@tailwindcss/jit'),
		require('autoprefixer'),
		prod && require('cssnano')
	].filter(Boolean)
};
