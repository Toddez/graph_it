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
		this.variables = '';
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
				let string = functions[i].trim().replace(/ /gm, '');

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
	 * Set variables
	 * @author Toddez
	 * @param {Array.<String>} variables 
	 */
	setVariables(variables) {
		this.variables = '';

		for (let i = 0; i < variables.length; i++) {
			if (variables[i] != '')
				this.variables = this.variables + 'const ' + variables[i] + ';';
		}
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

		let fragment = fragmentShader;

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

						let vertex = lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y);
						vertex = 'const float t=' + this.time + ';' + this.variables + vertex;

						canvas.renderLineY(-centerY - oneScaledY, -centerY + oneScaledY, 3 * (canvas.dimensions.y - canvas.margin.y), functions[i].color);
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type == 'y') {
					try {
						let x = 'aPos.x';
						let y = functions[i].y;

						let vertex = lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y);
						vertex = 'const float t=' + this.time + ';' + this.variables + vertex;

						canvas.renderLineX(-centerX - oneScaledX, -centerX + oneScaledX, 3 * (canvas.dimensions.x - canvas.margin.y), functions[i].color);
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type == '(') {
					try {
						let pos = functions[i].pos;

						let vertex = pointCalcShader.replace(/(POS)/gm, pos);
						vertex = 'const float t=' + this.time + ';' + this.variables + vertex;

						canvas.renderPoint(functions[i].color);
						canvas.flush('POINT', true, vertex, pointCalcFragmentShader, this.time, true);

						vertex = pointShader.replace(/(POS)/gm, pos);
						vertex = 'const float t=' + this.time + ';' + this.variables + vertex;

						canvas.renderPoint(functions[i].color);
						canvas.flush('POINT', true, vertex, pointFragmentShader, this.time);

						text.renderPointText(oneScaledX, oneScaledY, canvas.points[pointIndex]);
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

		let vertex = lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y);

		canvas.renderXAxis(centerX, centerY, oneScaledX, new Color(0.6, 0.6, 0.6, 1));
		canvas.flush('LINE', true, vertex, fragment, this.time);

		canvas.renderYAxis(centerY, centerX, oneScaledY, new Color(0.6, 0.6, 0.6, 1));
		canvas.flush('LINE', true, vertex, fragment, this.time);

		let min = Math.max((1 / canvas.scale.x) * 2, (1 / canvas.scale.x) * 2);

		let scale = 1;
		let step = 0;
		let lines = 15;
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

		canvas.renderGridX(-centerX, -centerY, scale, oneScaledY, Math.ceil(oneScaledX / scale));
		canvas.flush('LINE', true, vertex, fragment, this.time);

		canvas.renderGridY(-centerY, -centerX, scale, oneScaledX, Math.ceil(oneScaledY / scale));
		canvas.flush('LINE', true, vertex, fragment, this.time);

		text.renderTextX(-centerX, -centerY, scale, Math.ceil(oneScaledX / scale));
		text.renderTextY(centerY, -centerX, scale, Math.ceil(oneScaledY / scale));

		text.flush2d(true);
	}
}

// Define all neccessary shaders

// Lines
const lineShader = `
	attribute vec2 aPos;
	attribute vec4 aColor;

	uniform mat3 uMatrix;
	uniform vec2 uRes;

	varying mediump vec4 vColor;
	varying mediump vec2 vRes;

	void main(void) {
		float x = aPos.x;
		float y = aPos.y;
		x = float(X);
		y = float(Y);
		vec2 position = (uMatrix * vec3(x, y, 1.0)).xy;

		float z = 0.0;
		vec4 color = aColor;
		if (abs(position.x) > 1.01 || abs(position.y) > 1.01) {
			z = 1.0;
			color.a = 0.0;
		} 

		vColor = color;
		vRes = uRes;

		gl_Position = vec4(position.xy, z, 1.0);
	}
`;

const fragmentShader = `
	varying mediump vec4 vColor; 

	void main(void) {
		mediump vec4 color = vColor;

		gl_FragColor = vColor;
	}
`;

// Points
const pointShader = `
	attribute vec2 aPos;
	attribute vec4 aColor;

	uniform mat3 uMatrix;
	uniform vec2 uRes;

	varying mediump vec4 vColor;
	varying mediump vec2 vRes;

	void main(void) { 
		vec2 pos = vec2POS;
		vec2 position = (uMatrix * vec3(pos.x, pos.y, 1.0)).xy;

		vColor = aColor;
		vRes = uRes;

		gl_Position = vec4(position.xy, 0.0, 1.0);
		gl_PointSize = 15.0;
	}
`;

const pointFragmentShader = `
	varying mediump vec4 vColor; 
	varying mediump vec2 vRes; 

	void main(void) {
		mediump vec4 color = vColor;

		mediump vec2 test = gl_PointCoord;
		mediump vec2 test2 = vec2(0.5, 0.5);
		if (length(test - test2) > 0.5)
			discard;

		gl_FragColor = color; 
	}
`;

// Point calculation
const pointCalcShader = `
	attribute vec2 aPos;
	attribute vec4 aColor;

	uniform mat3 uMatrix;

	varying mediump vec4 vColor;
	varying mediump vec2 vPos;

	void main(void) {
		vec2 pos = vec2POS;
		vec2 position = (uMatrix * vec3(pos.x, pos.y, 1.0)).xy;

		vColor = aColor;
		vPos = position;

		gl_Position = vec4(0.0, 0.0, 1.0, 1.0);
		gl_PointSize = 0.0;
	}
`;

const pointCalcFragmentShader = `
	varying mediump vec4 vColor;
	varying mediump vec2 vPos;

	void main(void) {
		gl_FragColor = vec4(vPos.x / 2.0 + 0.5, vPos.y / 2.0 + 0.5, 0.0, 0.0);
	}
`;