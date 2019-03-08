/**
 * Convert color object to hex (#RGB)
 * for convenience sake accuracy is limited to 0-255 per channel
 * @author Toddez
 * @param {Color} color 
 */
function rgbaToHex(color) {
	let r = decToHex(Math.round(color.r * 15));
	let g = decToHex(Math.round(color.g * 15));
	let b = decToHex(Math.round(color.b * 15));

	return '#' + r + g + b;
}

/**
 * Convert decimal to hexadecimal
 * @author Toddez
 * @param {Number} dec 
 */
function decToHex(dec) {
	switch (dec) {
		case 0: return '0';
		case 1: return '1';
		case 2: return '2';
		case 3: return '3';
		case 4: return '4';
		case 5: return '5';
		case 6: return '6';
		case 7: return '7';
		case 8: return '8';
		case 9: return '9';
		case 10: return 'a';
		case 11: return 'b';
		case 12: return 'c';
		case 13: return 'd';
		case 14: return 'e';
		case 15: return 'f';
	}
}

class Color {

	/**
	 * Create color object where a float represents each channel
	 * @author Toddez
	 * @param {Number} r red
	 * @param {Number} g green
	 * @param {Number} b blue
	 * @param {Number} a alpha
	 */
	constructor(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}