const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
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
		this.userFunctions = '';
	}

	derivitiveY(func, prec) {
		return '(((' + func.replace(/(x)/gm, '(x+' + prec + ')') + ')-(' + func.replace(/(x)/gm, '(x-' + prec + ')') + '))/' + (prec * 2) + ')'
	}

	referenceY(current, functions, prec) {
		let value = functions[current].y.replace(/'/g, '');
		for (let j = 0; j < value.length; j++) {
			if (value[j] == 'y' && numbers.includes(value[j + 1])) {
				let length = 0;
				let stop = false;
				let org = 'y';
				for (let k = j + 1; k < value.length && stop == false; k++) {
					if (numbers.includes(value[k])) {
						length++;
						org = org + value[k];
					} else {
						stop = true;
					}
				}

				let index = parseInt(value.substring(j + 1, j + 1 + length));

				let functionIndex = 0;
				for (let k = 0; k < functions.length; k++) {
					if (functions[k].type.substring(0, 2) == 'y=' && functionIndex != current) {
						if (functionIndex == index) {
							let func = '(' + this.referenceY(k, functions, prec) + ')';
							if (functions[k].type[2] == "'")
								func = this.derivitiveY(func, prec);

							value = value.replace(org, func);
						}

						functionIndex++;
					}
				}
			}
		}

		return value;
	}

	derivitiveX(func, prec) {
		return '(((' + func.replace(/(y)/gm, '(y+' + prec + ')') + ')-(' + func.replace(/(y)/gm, '(y-' + prec + ')') + '))/' + (prec * 2) + ')'
	}

	referenceX(current, functions, prec) {
		let value = functions[current].x.replace(/'/g, '');
		for (let j = 0; j < value.length; j++) {
			if (value[j] == 'x' && numbers.includes(value[j + 1])) {
				let length = 0;
				let stop = false;
				let org = 'x';
				for (let k = j + 1; k < value.length && stop == false; k++) {
					if (numbers.includes(value[k])) {
						length++;
						org = org + value[k];
					} else {
						stop = true;
					}
				}

				let index = parseInt(value.substring(j + 1, j + 1 + length));

				let functionIndex = 0;
				for (let k = 0; k < functions.length; k++) {
					if (functions[k].type.substring(0, 2) == 'x=' && functionIndex != current) {
						if (functionIndex == index) {
							let func = '(' + this.referenceX(k, functions, prec) + ')';
							if (functions[k].type[2] == "'")
								func = this.derivitiveX(func, prec);

							value = value.replace(org, func);
						}

						functionIndex++;
					}
				}
			}
		}

		return value;
	}

	/**
	 * Parses a function by converting ints to floats (1 -> 1.0), adding * between sets (2x -> 2*x)
	 * @author Toddez
	 * @param {String} string 
	 * @returns {String} string
	 */
	sanitize(string) {
		string = string + ' ';

		let current = false;
		let start, length = 0;
		for (let i = 0; i < string.length; i++) {
			if (numbers.includes(string[i])) {
				if (current == false) {
					start = i;
					length = 1;
					current = true;
				} else {
					length++;
				}
			} else {
				if (string[i] != '.' && current == true) {
					string = string.substring(0, start) + 'float(' + string.substring(start, start + length) + ')' + string.substring(start + length);
					i = start + length + 6;
					current = false;
				} else {
					length++;
				}
			}
		}

		for (let i = 0; i < string.length; i++) {
			if (numbers.includes(string[i]) || string[i] == ')' || string[i] == 'x' || string[i] == 'y' || (string[i] == 't' && string[i + 1] != 'a' && string[i - 1] != 'a')) {
				if (string[i + 1] != '.' && string[i + 1] != ',' && string[i + 1] != ')' && string[i + 1] != '-' && string[i + 1] != '+' && string[i + 1] != '/' && string[i + 1] != '*' && string[i + 1] != ' ' && !numbers.includes(string[i + 1])) {
					string = string.substring(0, i + 1) + '*' + string.substring(i + 1);
				}
			}
		}

		return string;
	}

	/**
	 * Set functions
	 * @author Toddez
	 * @param {Array.<String>} functions 
	 * @param {Array.<String>} variables
	 * @param {Array.<String>} userFunctions
	 */
	setFunctions(functions, variables, userFunctions) {
		parseFunctions(functions);
		this.setVariables(variables);
		this.setUserFunctions(userFunctions);
		this.functions = new Array();

		for (let i = 0; i < functions.length; i++) {
			if (functions[i].length > 0) {
				let string = functions[i].trim().replace(/ /gm, '');

				let type = string[0];
				if (type == 'x') {
					let restriction;
					if (string.split('{')[1])
						restriction = string.split('{')[1].split('}')[0];

					this.functions.push({ type: type + string[1] + string[2], x: string.split('{')[0].split('=')[1], restriction: restriction });
				} else if (type == 'y') {
					let restriction;
					if (string.split('{')[1])
						restriction = string.split('{')[1].split('}')[0];

					this.functions.push({ type: type + string[1] + string[2], y: string.split('{')[0].split('=')[1], restriction: restriction });
				} else if (type == '(' && string[string.length - 1] == ')') {
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
			if (variables[i] != '') {
				let variable = variables[i].split('=');
				if (variable.length == 2)
					this.variables = this.variables + 'const ' + variable[0] + '=' + this.sanitize(variable[1]) + ';';
			}
		}
	}

	/**
	 * Set user functions
	 * @author Toddez
	 * @param {Array.<String>} functions 
	 */
	setUserFunctions(functions) {
		this.userFunctions = '';

		for (let i = 0; i < functions.length; i++)
			if (functions[i] != '')
				this.userFunctions = this.userFunctions + functions[i];
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

		let fragment = lineFragmentShader;

		canvas.flush('CLEAR');
		text.flush2d();
		if (functions.length > 0) {
			canvas.points = new Array();
			let pointIndex = 0;

			for (let i = 0; i < functions.length; i++) {
				if (functions[i].type == "x='") {
					try {
						let startY = -centerY - oneScaledY;
						let endY = -centerY + oneScaledY;
						let length = 0.5 * (canvas.dimensions.y - canvas.margin.y);
						let prec = Math.abs(endY - startY) / length;

						let x = this.derivitiveX(this.referenceX(i, functions, prec), prec);
						x = this.sanitize(x);

						let y = 'aPos.y';

						let minX, maxX, minY, maxY;
						if (functions[i].restriction) {
							let restrictions = functions[i].restriction.split(';');

							for (let j = 0; j < restrictions.length; j++) {
								if (restrictions[j][0] == 'x') {
									if (restrictions[j][1] == '<') {
										maxX = parseFloat(restrictions[j].split('<')[1]);
									} else if (restrictions[j][1] == '>') {
										minX = parseFloat(restrictions[j].split('>')[1]);
									}
								} else if (restrictions[j][0] == 'y') {
									if (restrictions[j][1] == '<') {
										maxY = parseFloat(restrictions[j].split('<')[1]);
									} else if (restrictions[j][1] == '>') {
										minY = parseFloat(restrictions[j].split('>')[1]);
									}
								}
							}
						}

						let vertex = lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y);

						let added = '';
						if (minX != undefined)
							added = added + 'const float minx=' + this.sanitize(minX) + '; const bool useMinx=true;';
						else
							added = added + 'const float minx=0.0; const bool useMinx=false;';

						if (maxX != undefined)
							added = added + 'const float maxx=' + this.sanitize(maxX) + '; const bool useMaxx=true;';
						else
							added = added + 'const float maxx=0.0; const bool useMaxx=false;';

						if (minY != undefined)
							added = added + 'const float miny=' + this.sanitize(minY) + '; const bool useMiny=true;';
						else
							added = added + 'const float miny=0.0; const bool useMiny=false;';

						if (maxY != undefined)
							added = added + 'const float maxy=' + this.sanitize(maxY) + '; const bool useMaxy=true;';
						else
							added = added + 'const float maxy=0.0; const bool useMaxy=false;';

						vertex = 'const float t=' + this.time + ';' + this.variables + this.userFunctions + added + vertex;

						canvas.renderLineY(startY, endY, length, functions[i].color);
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type.substring(0, 2) == 'x=') {
					try {
						let x = this.sanitize(functions[i].x);
						let y = 'aPos.y';

						let minX, maxX, minY, maxY;
						if (functions[i].restriction) {
							let restrictions = functions[i].restriction.split(';');

							for (let j = 0; j < restrictions.length; j++) {
								if (restrictions[j][0] == 'x') {
									if (restrictions[j][1] == '<') {
										maxX = parseFloat(restrictions[j].split('<')[1]);
									} else if (restrictions[j][1] == '>') {
										minX = parseFloat(restrictions[j].split('>')[1]);
									}
								} else if (restrictions[j][0] == 'y') {
									if (restrictions[j][1] == '<') {
										maxY = parseFloat(restrictions[j].split('<')[1]);
									} else if (restrictions[j][1] == '>') {
										minY = parseFloat(restrictions[j].split('>')[1]);
									}
								}
							}
						}

						let vertex = lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y);

						let added = '';
						if (minX != undefined)
							added = added + 'const float minx=' + this.sanitize(minX) + '; const bool useMinx=true;';
						else
							added = added + 'const float minx=0.0; const bool useMinx=false;';

						if (maxX != undefined)
							added = added + 'const float maxx=' + this.sanitize(maxX) + '; const bool useMaxx=true;';
						else
							added = added + 'const float maxx=0.0; const bool useMaxx=false;';

						if (minY != undefined)
							added = added + 'const float miny=' + this.sanitize(minY) + '; const bool useMiny=true;';
						else
							added = added + 'const float miny=0.0; const bool useMiny=false;';

						if (maxY != undefined)
							added = added + 'const float maxy=' + this.sanitize(maxY) + '; const bool useMaxy=true;';
						else
							added = added + 'const float maxy=0.0; const bool useMaxy=false;';

						vertex = 'const float t=' + this.time + ';' + this.variables + added + vertex;

						let startY = -centerY - oneScaledY;
						let endY = -centerY + oneScaledY;

						canvas.renderLineY(startY, endY, 0.5 * (canvas.dimensions.y - canvas.margin.y), functions[i].color);
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type == "y='") {
					try {
						let x = 'aPos.x';

						let startX = -centerX - oneScaledX;
						let endX = -centerX + oneScaledX;
						let length = 0.5 * (canvas.dimensions.x - canvas.margin.x);
						let prec = Math.abs(endX - startX) / length;

						let y = this.derivitiveY(this.referenceY(i, functions, prec), prec);

						y = this.sanitize(y);

						let minX, maxX, minY, maxY;
						if (functions[i].restriction) {
							let restrictions = functions[i].restriction.split(';');

							for (let j = 0; j < restrictions.length; j++) {
								if (restrictions[j][0] == 'x') {
									if (restrictions[j][1] == '<') {
										maxX = parseFloat(restrictions[j].split('<')[1]);
									} else if (restrictions[j][1] == '>') {
										minX = parseFloat(restrictions[j].split('>')[1]);
									}
								} else if (restrictions[j][0] == 'y') {
									if (restrictions[j][1] == '<') {
										maxY = parseFloat(restrictions[j].split('<')[1]);
									} else if (restrictions[j][1] == '>') {
										minY = parseFloat(restrictions[j].split('>')[1]);
									}
								}
							}
						}

						let vertex = lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y);

						let added = '';
						if (minX != undefined)
							added = added + 'const float minx=' + this.sanitize(minX) + '; const bool useMinx=true;';
						else
							added = added + 'const float minx=0.0; const bool useMinx=false;';

						if (maxX != undefined)
							added = added + 'const float maxx=' + this.sanitize(maxX) + '; const bool useMaxx=true;';
						else
							added = added + 'const float maxx=0.0; const bool useMaxx=false;';

						if (minY != undefined)
							added = added + 'const float miny=' + this.sanitize(minY) + '; const bool useMiny=true;';
						else
							added = added + 'const float miny=0.0; const bool useMiny=false;';

						if (maxY != undefined)
							added = added + 'const float maxy=' + this.sanitize(maxY) + '; const bool useMaxy=true;';
						else
							added = added + 'const float maxy=0.0; const bool useMaxy=false;';

						vertex = 'const float t=' + this.time + ';' + this.variables + this.userFunctions + added + vertex;

						canvas.renderLineX(startX, endX, length, functions[i].color);
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type.substring(0, 2) == 'y=') {
					try {
						let x = 'aPos.x';
						let y = this.sanitize(functions[i].y);

						let minX, maxX, minY, maxY;
						if (functions[i].restriction) {
							let restrictions = functions[i].restriction.split(';');

							for (let j = 0; j < restrictions.length; j++) {
								if (restrictions[j][0] == 'x') {
									if (restrictions[j][1] == '<') {
										maxX = restrictions[j].split('<')[1];
									} else if (restrictions[j][1] == '>') {
										minX = restrictions[j].split('>')[1];
									}
								} else if (restrictions[j][0] == 'y') {
									if (restrictions[j][1] == '<') {
										maxY = restrictions[j].split('<')[1];
									} else if (restrictions[j][1] == '>') {
										minY = restrictions[j].split('>')[1];
									}
								}
							}
						}

						let vertex = lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y);

						let added = '';
						if (minX != undefined)
							added = added + 'const float minx=' + this.sanitize(minX) + '; const bool useMinx=true;';
						else
							added = added + 'const float minx=0.0; const bool useMinx=false;';

						if (maxX != undefined)
							added = added + 'const float maxx=' + this.sanitize(maxX) + '; const bool useMaxx=true;';
						else
							added = added + 'const float maxx=0.0; const bool useMaxx=false;';

						if (minY != undefined)
							added = added + 'const float miny=' + this.sanitize(minY) + '; const bool useMiny=true;';
						else
							added = added + 'const float miny=0.0; const bool useMiny=false;';

						if (maxY != undefined)
							added = added + 'const float maxy=' + this.sanitize(maxY) + '; const bool useMaxy=true;';
						else
							added = added + 'const float maxy=0.0; const bool useMaxy=false;';

						vertex = 'const float t=' + this.time + ';' + this.variables + this.userFunctions + added + vertex;

						let startX = -centerX - oneScaledX;
						let endX = -centerX + oneScaledX;

						canvas.renderLineX(startX, endX, 0.5 * (canvas.dimensions.x - canvas.margin.x), functions[i].color);
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type == '(') {
					try {
						let pos = this.sanitize(functions[i].pos);

						let vertex = pointCalcShader.replace(/(POS)/gm, pos);
						vertex = 'const float t=' + this.time + ';' + this.variables + this.userFunctions + vertex;

						canvas.renderPoint(functions[i].color);
						canvas.flush('POINT', true, vertex, pointCalcFragmentShader, this.time, true);

						vertex = pointShader.replace(/(POS)/gm, pos);
						vertex = 'const float t=' + this.time + ';' + this.variables + this.userFunctions + vertex;

						canvas.renderPoint(functions[i].color);
						canvas.flush('POINT', true, vertex, pointFragmentShader, this.time);

						text.renderPointText(oneScaledX, oneScaledY, canvas.points[pointIndex], rgbaToHex(functions[i].color));
						text.flush2d(true);

						pointIndex++;
					} catch { }
				}
			}
		}

		text.position = canvas.position;
		text.scale = canvas.scale;

		canvas.renderXAxis(centerX, centerY, oneScaledX, new Color(0.6, 0.6, 0.6, 1));
		canvas.flush('LINE', true, backgroundLineShader, fragmentShader, this.time);

		canvas.renderYAxis(centerY, centerX, oneScaledY, new Color(0.6, 0.6, 0.6, 1));
		canvas.flush('LINE', true, backgroundLineShader, fragmentShader, this.time);

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
		canvas.flush('LINE', true, backgroundLineShader, fragmentShader, this.time);

		canvas.renderGridY(-centerY, -centerX, scale, oneScaledX, Math.ceil(oneScaledY / scale));
		canvas.flush('LINE', true, backgroundLineShader, fragmentShader, this.time);

		text.renderTextX(-centerX, -centerY, scale, Math.ceil(oneScaledX / scale));
		text.renderTextY(centerY, -centerX, scale, Math.ceil(oneScaledY / scale));

		text.flush2d(true);
	}
}

// Define all neccessary shaders

// Lines
const lineShader = `
	precision highp float;

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
		
		vec4 color = aColor;
		float z = 0.0;

		if (useMinx == true) {
			if (x < minx) {
				color.a = 0.0;
				z = 1.0;
			}
		}

		if (useMaxx == true) {
			if (x > maxx) {
				color.a = 0.0;
				z = 1.0;
			}
		}

		if (useMiny == true) {
			if (y < miny) {
				color.a = 0.0;
				z = 1.0;
			}
		}

		if (useMaxy == true) {
			if (y > maxy) {
				color.a = 0.0;
				z = 1.0;
			}
		}
		
		vec2 position = (uMatrix * vec3(x, y, 1.0)).xy;
		if (abs(position.x) > 1.01 || abs(position.y) > 1.01) {
			z = 1.0;
			color.a = 0.0;
		} 

		vColor = color;
		vRes = uRes;

		gl_Position = vec4(position.xy, z, 1.0);
	}
`;

const lineFragmentShader = `
	varying mediump vec4 vColor;

	void main(void) {
		mediump vec4 color = vColor;

		gl_FragColor = vColor;
	}
`;

const backgroundLineShader = `
	attribute vec2 aPos;
	attribute vec4 aColor;

	uniform mat3 uMatrix;
	uniform vec2 uRes;
	
	varying mediump vec4 vColor;
	varying mediump vec2 vRes;
	
	void main(void) {
		vec2 position = (uMatrix * vec3(aPos.x, aPos.y, 1.0)).xy;
	
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
		gl_PointSize = 6.5;
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

function getLimit(string) {
	if (string.includes('[') && string.includes(']')) {
		let start = 0;
		let end = string.length;
		while (string[start] != '[')
			start++;

		while (string[end] != ']')
			end--;

		return string.substring(start + 1, end).split(',');
	} else {
		return [0, 0];
	}
}

function getSeperator(line) {
	if (line.includes('<'))
		return '<';
	else if (line.includes('>'))
		return '>';
	else if (line.includes('<='))
		return '<=';
	else if (line.includes('>='))
		return '>=';
	else if (line.includes('='))
		return '=';

	return '';
}

function getInfo(left) {
	let func = {};

	let set = left.substring(0, 2);
	switch (set) {
		case 'y[': func.type = 'LINE'; func.set = 'y'; func.derivitive = false; func.limit = getLimit(left); return func;
		case 'x[': func.type = 'LINE'; func.set = 'x'; func.derivitive = false; func.limit = getLimit(left); return func;
	}

	set = left.substring(0, 3);
	switch (set) {
		case 'y(x': func.type = 'LINE'; func.set = 'y'; func.derivitive = false; func.limit = '*'; return func;
		case 'x(y': func.type = 'LINE'; func.set = 'x'; func.derivitive = false; func.limit = '*'; return func;
		case 'y\'[': func.type = 'LINE'; func.set = 'y'; func.derivitive = true; func.limit = getLimit(left); return func;
		case 'x\'[': func.type = 'LINE'; func.set = 'x'; func.derivitive = true; func.limit = getLimit(left); return func;
	}

	set = left.substring(0, 4);
	switch (set) {
		case 'y\'(x': func.type = 'LINE'; func.set = 'y'; func.derivitive = true; func.limit = '*'; return func;
		case 'x\'(y': func.type = 'LINE'; func.set = 'x'; func.derivitive = true; func.limit = '*'; return func;
	}

	return;
}

function parseFunctions(lines) {
	let functions = { lines: new Array(), areas: new Array(), points: new Array() };

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i].replace(/\s/g, '');
		let func = {};

		let seperator = getSeperator(line);
		if (seperator != '') {
			let sides = line.split(seperator);
			let left = sides[0];
			func.value = sides[1];
			func.seperator = seperator;

			let info = getInfo(left);
			if (info) {
				if (seperator != '=')
					func.type = 'AREA';
				else
					func.type = info.type;

				func.set = info.set;
				func.derivitive = info.derivitive;
				func.limit = info.limit;
			}
		} else {
			if (line[0] == '(') {
				func.type = 'POINT';
				func.value = line;
			}
		}

		if (func.type && func.value)
			switch (func.type) {
				case 'LINE':
					functions.lines.push(func);
					continue;
				case 'AREA':
					functions.areas.push(func);
					continue;
				case 'POINT':
					functions.points.push(func);
					continue;
			}
	}

	console.log(functions);
}