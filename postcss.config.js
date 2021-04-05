const prod = process.env.NODE_ENV === 'production';

module.exports = {
	plugins: [
		require('postcss-import'),
		require('tailwindcss'),
		require('autoprefixer'),
		prod && require('cssnano')
	].filter(Boolean)
};
