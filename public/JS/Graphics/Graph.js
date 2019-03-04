function rgbaToHex(color) {
	let r = decToHex(Math.round(color.r * 15));
	let g = decToHex(Math.round(color.g * 15));
	let b = decToHex(Math.round(color.b * 15));

	return '#' + r + g + b;
}

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

class Graph {

	/**
	 * Creates a graph
	 * @author Toddez
	 * @param {Canvas} gl 
	 * @param {Canvas} text 
	 */
	constructor(gl, text) {
		this.gl = gl;
		this.text = text;

		this.colors = new Array();
		this.functions = new Array();

		this.lineShader = 'attribute vec2 aPos; attribute vec4 aColor; uniform mat3 uMatrix; varying lowp vec4 vColor; void main(void) { float x = aPos.x; float y = aPos.y; x = float(X); y = float(Y); float z = 0.0; vec2 position = (uMatrix * vec3(x, y, 1.0)).xy; vec4 color = aColor; if (abs(position.x) > 1.01 || abs(position.y) > 1.01) { color = vec4(0.0, 0.0, 0.0, 0.0); z = 1.0; } gl_Position = vec4(position.xy, z, 1.0); vColor = color; }';

		this.pointShader = 'attribute vec2 aPos; attribute vec4 aColor; uniform mat3 uMatrix; varying lowp vec4 vColor; varying lowp vec2 vPos; void main(void) { vec2 pos = vec2POS; vec2 position = (uMatrix * vec3(pos.x, pos.y, 1.0)).xy; gl_Position = vec4(position.xy, 0.0, 1.0); vPos = position; vColor = aColor; gl_PointSize = 10.0; }';

		this.pointCalcShader = 'attribute vec2 aPos; attribute vec4 aColor; uniform mat3 uMatrix; varying lowp vec4 vColor; varying lowp vec2 vPos; void main(void) { vec2 pos = vec2POS; vec2 position = (uMatrix * vec3(pos.x, pos.y, 1.0)).xy; gl_Position = vec4(0.0, 0.0, 1.0, 1.0); vPos = position; vColor = aColor; gl_PointSize = 0.0; }';

		this.fragmentShader = 'varying lowp vec4 vColor; void main(void) { gl_FragColor = vColor; }';

		this.pointFragmentShader = 'varying lowp vec4 vColor; varying lowp vec2 vPos; void main(void) { gl_FragColor = vec4(vPos.x / 2.0 + 0.5, vPos.y / 2.0 + 0.5, 0.0, 0.0); }';
	}

	/**
	 * Set functions
	 * @author Toddez
	 * @param {Array.<String>} functions 
	 */
	setFunctions(functions) {
		this.functions = new Array();

		for (let i = 0; i < functions.length; i++) {
			if (functions[i].length > 0) {
				let string = functions[i].trim();
				let type = string[0];
				if (type == 'x')
					this.functions.push({ type: type, x: string.substring(2, string.length) })
				else if (type == 'y')
					this.functions.push({ type: type, y: string.substring(2, string.length) })
				else if (type == '(' && string[string.length - 1] == ')') {
					this.functions.push({ type: type, pos: string });
				}
			}
		}

		while (this.colors.length < this.functions.length) {
			let color = new Color(0.0, 0.0, 0.0, 1.0);
			let found = false;
			while (found == false) {
				color.r = Math.random();
				color.g = Math.random();
				color.b = Math.random();

				if (color.r + color.g + color.b > 0.75)
					if (!(Math.abs(color.r - color.g) < 0.2 && Math.abs(color.r - color.b) < 0.2 && Math.abs(color.g - color.b) < 0.2)) {
						if (this.colors.length == 0) {
							found = true;
						} else {
							let diff = 0;
							for (let i = 0; i < this.colors.length; i++) {
								let other = this.colors[i];
								diff += Math.abs(other.r - color.r) + Math.abs(other.g - color.g) + Math.abs(other.b - color.b);
							}

							if (diff / this.colors.length > 1)
								found = true;
						}
					}
			}

			this.colors.push(color);
		}

		for (let i = 0; i < this.functions.length; i++)
			this.functions[i].color = this.colors[i];
	}

	/**
	 * Renders all functions
	 * @author Toddez
	 */
	render() {
		let canvas = this.gl;
		let text = this.text;
		let functions = this.functions;

		let centerX = canvas.position.x;
		let centerY = canvas.position.y;

		let oneScaledX = 1 / canvas.scale.x;
		let oneScaledY = 1 / canvas.scale.y;

		let fragment = this.fragmentShader;

		canvas.flush('CLEAR');
		text.flush2d();
		if (functions.length > 0) {
			canvas.points = new Array();
			let pointIndex = 0;
			for (let i = 0; i < functions.length; i++) {
				if (functions[i].type == 'x') {
					try {
						let x = functions[i].x;
						let y = 'aPos.y';

						let vertex = this.lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y).replace(/(time)/gm, this.time);

						canvas.renderLineY(-centerY - oneScaledY, -centerY + oneScaledY, 5 * (canvas.dimensions.y - canvas.margin.y), functions[i].color);
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type == 'y') {
					try {
						let x = 'aPos.x';
						let y = functions[i].y;

						let vertex = this.lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y).replace(/(time)/gm, this.time);

						canvas.renderLineX(-centerX - oneScaledX, -centerX + oneScaledX, 5 * (canvas.dimensions.x - canvas.margin.y), functions[i].color);
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type == '(') {
					try {
						let pos = functions[i].pos;

						let vertex = this.pointCalcShader.replace(/(POS)/gm, pos).replace(/(time)/gm, this.time);

						canvas.renderPoint(functions[i].color);
						canvas.flush('POINT', true, vertex, this.pointFragmentShader, this.time, true);

						vertex = this.pointShader.replace(/(POS)/gm, pos).replace(/(time)/gm, this.time);

						canvas.renderPoint(functions[i].color);
						canvas.flush('POINT', true, vertex, this.fragmentShader, this.time);

						text.renderPointText(oneScaledX, oneScaledY, canvas.points[pointIndex], rgbaToHex(functions[i].color));
						text.flush2d(true);

						pointIndex++;
					} catch { }
				}
			}
		}

		text.position = canvas.position;
		text.scale = canvas.scale;

		let x = 'aPos.x';
		let y = 'aPos.y';

		let vertex = this.lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y);

		canvas.renderXAxle(centerX, centerY, oneScaledX, new Color(0.6, 0.6, 0.6, 1));
		canvas.flush('LINE', true, vertex, fragment, this.time);

		canvas.renderYAxle(centerY, centerX, oneScaledY, new Color(0.6, 0.6, 0.6, 1));
		canvas.flush('LINE', true, vertex, fragment, this.time);

		let min = Math.min((1 / canvas.scale.x) * 2, (1 / canvas.scale.x) * 2);

		let scale = 1;
		let step = 0;
		let lines = 20;
		let stop = false;
		if (min / lines >= 1)
			while (scale * lines < min && stop == false) {
				if (step > 2)
					step = 0;

				let change = 1;
				switch (step) {
					case 0: change = 2; break;
					case 1: change = 2.5; break;
					case 2: change = 2; break;
				}

				if (min / (scale * change) >= lines)
					scale *= change;
				else
					stop = true;

				step++;
			}
		else
			while (scale * lines > min) {
				if (step > 2)
					step = 0;

				switch (step) {
					case 0: scale /= 2; break;
					case 1: scale /= 2.5; break;
					case 2: scale /= 2; break;
				}

				step++;
			}

		canvas.renderGridX(-centerX, -centerY, scale, oneScaledY, lines);
		canvas.flush('LINE', true, vertex, fragment, this.time);

		canvas.renderGridY(-centerY, -centerX, scale, oneScaledX, lines);
		canvas.flush('LINE', true, vertex, fragment, this.time);

		text.renderTextX(-centerX, -centerY, scale, lines);
		text.renderTextY(centerY, -centerX, scale, lines);

		text.flush2d(true);
	}
}