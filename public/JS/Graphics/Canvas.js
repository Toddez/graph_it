class Canvas {

    /**
     * Creates a canvas
	 * @author Toddez
     * @param {String} id 
     * @param {Vector2} dimensions 
     */
	constructor(id, dimensions, parent, gl) {
		Canvas.canvases.push(this);

		// Set members
		this.id = id;
		this.dimensions = dimensions;
		this.parent = parent;
		this.position = new Vector2(0, 0);
		this.scale = new Vector2(1, 1);
		this.margin = new Vector2(0, 0);

		// Initialize canvas
		this.createElement();
		if (gl == true)
			this.setupWebGL();
		else
			this.setup2d();

		this.setDimensions();
		this.setupInput();
	}

	/**
	 * Creates html element for this canvas
	 * @author Toddez
	 */
	createElement() {
		// Get parent element
		let parentElement = $('body');
		if (this.parent)
			parentElement = $(this.parent);

		// Create and append canvas element to parent element
		parentElement.append('<canvas id="' + this.id + '"></canvas>');
		this.element = document.getElementById(this.id);
	}

	/**
	 * Setup WebGL
	 * @author Toddez
	 */
	setupWebGL() {
		// Grab WebGL context
		this.gl = this.element.getContext('experimental-webgl');

		// Create arrays for vertices and indices
		this.vertices = [];
		this.indices = [];
	}

	/**
	 * Setup 2d
	 * @author Toddez 
	 */
	setup2d() {
		// Grab 2d context
		this.context2d = this.element.getContext('2d');

		// Create array for text
		this.text = [];
	}

	/**
	 * Creates shader program for canvas
	 * @author Toddez
	 * @param {String} vertex 
	 * @param {String} fragment 
	 */
	setupShaders(vertex, fragment) {
		// Create, set source and compile vertex shader
		let vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(vertexShader, vertex);
		this.gl.compileShader(vertexShader);

		// Create, set source and compile fragment shader
		let fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(fragmentShader, fragment);
		this.gl.compileShader(fragmentShader);

		// Create shader program, attach shaders and use the shader program
		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);
		this.gl.useProgram(this.shaderProgram);
	}

	renderLineX(minX, maxX, length, func, color) {
		if (!color)
			color = new Color(1, 0, 1, 1);

		let resX = Math.abs(maxX - minX) / length;
		for (let x = minX; x <= maxX; x += resX) {
			this.vertices.push(x);
			this.vertices.push(func(x, 0));
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);
		}
	}

	renderLineY(minY, maxY, length, func, color) {
		if (!color)
			color = new Color(1, 0, 1, 1);

		let resY = Math.abs(maxY - minY) / length;
		for (let y = minY; y <= maxY; y += resY) {
			this.vertices.push(func(0, y));
			this.vertices.push(y);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);
		}
	}

	renderPoint(func, color) {
		if (!color)
			color = new Color(1, 0, 1, 1);

		let pos = func(0, 0);

		this.vertices.push(pos.x);
		this.vertices.push(pos.y);
		this.vertices.push(color.r);
		this.vertices.push(color.g);
		this.vertices.push(color.b);
		this.vertices.push(color.a);

		this.indices.push(this.indices.length);
	}

	renderPointText(oneX, oneY, func, color) {
		let pos = func(0, 0);

		if (!color)
			color = '#f0f';

		let textX = (pos.x / oneX + this.position.x * this.scale.x) * (this.dimensions.x - this.margin.x) / 2;
		let textY = -(pos.y / oneY + this.position.y * this.scale.y) * (this.dimensions.y - this.margin.y) / 2;

		this.text.push({ text: '(' + Math.round(pos.x * 1000000) / 1000000 + ',' + Math.round(pos.y * 1000000) / 1000000 + ')', pos: new Vector2(textX, textY), color: color, align: 'left', base: 'bottom' });
	}

	renderGridX(centerX, minY, maxY, resX, offsetX) {
		let i = 0;
		for (let x = centerX; x <= centerX + offsetX * 2 && x >= centerX - offsetX * 2; x += resX * i * (i % 2 == 0 ? 1 : -1)) {
			let trueIndex = Math.abs(x);
			let color = new Color(0, 0, 0, Math.round(trueIndex / resX) % 5 == 0 ? 0.4 : 0.1);

			this.vertices.push(x);
			this.vertices.push((i % 2 == 0) ? minY - offsetX : maxY + offsetX);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);

			this.vertices.push(x);
			this.vertices.push((i % 2 == 0) ? maxY + offsetX : minY - offsetX);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);
			i++;
		}
	}

	renderTextX(centerX, minY, maxY, resX, offsetX) {
		let i = 0;
		for (let x = centerX; x <= centerX + offsetX * 2 && x >= centerX - offsetX * 2; x += resX * i * (i % 2 == 0 ? 1 : -1)) {
			let trueIndex = Math.abs(x);

			if (Math.round(trueIndex / resX) % 5 == 0 && x != 0) {
				let textX = (x / offsetX + this.position.x * this.scale.x) * (this.dimensions.x - this.margin.x) / 2;
				let textY = -this.position.y * this.scale.y * (this.dimensions.y - this.margin.y) / 2;

				this.text.push({ text: Math.round(x * 1000000) / 1000000, pos: new Vector2(textX, textY) });
			}

			i++;
		}
	}

	renderTextY(centerY, minX, maxX, resY, offsetY) {
		let i = 0;
		for (let y = centerY; y <= centerY + offsetY * 2 && y >= centerY - offsetY * 2; y += resY * i * (i % 2 == 0 ? 1 : -1)) {
			let trueIndex = Math.abs(y);

			if (Math.round(trueIndex / resY) % 5 == 0 && y != 0) {
				let textX = this.position.x * this.scale.x * (this.dimensions.x - this.margin.x) / 2;
				let textY = (-y / offsetY - this.position.y * this.scale.y) * (this.dimensions.y - this.margin.y) / 2;

				this.text.push({ text: Math.round(y * 1000000) / 1000000, pos: new Vector2(textX, textY) });
			}

			i++;
		}
	}

	renderGridY(centerY, minX, maxX, resY, offsetY) {
		let i = 0;
		for (let y = centerY; y <= centerY + offsetY * 2 && y >= centerY - offsetY * 2; y += resY * i * (i % 2 == 0 ? 1 : -1)) {
			let trueIndex = Math.abs(y);
			let color = new Color(0, 0, 0, Math.round(trueIndex / resY) % 5 == 0 ? 0.4 : 0.1);

			this.vertices.push((i % 2 == 0) ? minX - offsetY : maxX + offsetY);
			this.vertices.push(y);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);

			this.vertices.push((i % 2 == 0) ? maxX + offsetY : minX - offsetY);
			this.vertices.push(y);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);
			i++;
		}
	}

	/**
	 * Flush all buffers and render them
	 * @author Toddez
	 */
	flush(type, dontClear) {
		// Create vertex buffer and bind vertices to it
		var vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

		// Create index buffer and bind indices to it
		var indexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

		// Bind buffers
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		// Set aPos attrib
		var pos = this.gl.getAttribLocation(this.shaderProgram, "aPos");
		this.gl.vertexAttribPointer(pos, 2, this.gl.FLOAT, false, 24, 0);
		this.gl.enableVertexAttribArray(pos);

		// Set aColor attrib
		var color = this.gl.getAttribLocation(this.shaderProgram, "aColor");
		this.gl.vertexAttribPointer(color, 4, this.gl.FLOAT, false, 24, 8);
		this.gl.enableVertexAttribArray(color);

		// Calculate matrix
		//let matrix = Matrix3.translation(this.position.x, this.position.y);
		//matrix = Matrix3.multiply(matrix, Matrix3.translation(-this.position.x, -this.position.y));
		//matrix = Matrix3.multiply(matrix, Matrix3.scaling(this.scale.x, this.scale.y));
		//matrix = Matrix3.multiply(matrix, Matrix3.translation(this.position.x, this.position.y));

		let matrix = Matrix3.scaling(this.scale.x, this.scale.y);
		matrix = Matrix3.multiply(matrix, Matrix3.translation(this.position.x, this.position.y));

		// Set matrix uniform
		let matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "uMatrix");
		this.gl.uniformMatrix3fv(matrixLocation, false, matrix);

		// Clear to background color
		if (!dontClear) {
			if (this.background)
				this.gl.clearColor(this.background.r, this.background.g, this.background.b, this.background.a);
			else
				this.gl.clearColor(1, 0, 1, 1);

			// Enable depth, clear color and depth buffers
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		}

		// Set width and height of WebGL's viewport
		this.gl.viewport(0, 0, this.dimensions.x - this.margin.x, this.dimensions.y - this.margin.y);

		// Draw the triangles
		let drawMode;
		switch (type) {
			case 'LINE':
				drawMode = this.gl.LINE_STRIP;
				break;
			case 'POINT':
				drawMode = this.gl.POINTS;
				break;
			default:
				drawMode = this.gl.LINE_STRIP;
				break;
		}

		this.gl.drawElements(drawMode, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

		// Reset buffers
		this.vertices = [];
		this.indices = [];
	}

	/**
	 * Clear 2d
	 * @author Toddez
	 */
	flush2d(dontClear) {
		if (!dontClear || dontClear == false)
			this.context2d.clearRect(0, 0, this.dimensions.x - this.margin.x, this.dimensions.y - this.margin.y);

		this.context2d.font = '20px Courier New';

		for (let i = 0; i < this.text.length; i++) {
			let text = this.text[i];

			if (text.color)
				this.context2d.fillStyle = text.color;
			else
				this.context2d.fillStyle = '#000';

			if (text.align)
				this.context2d.textAlign = text.align;
			else
				this.context2d.textAlign = 'right';

			if (text.base)
				this.context2d.textBaseline = text.base;
			else
				this.context2d.textBaseline = 'top';

			if (text.stroke) {
				this.context2d.strokeStyle = text.stroke;
				this.context2d.strokeText(text.text, (this.dimensions.x - this.margin.x) / 2 + text.pos.x, (this.dimensions.y - this.margin.y) / 2 + text.pos.y);
			} else {
				this.context2d.strokeStyle = '#000';
			}

			this.context2d.fillText(text.text, (this.dimensions.x - this.margin.x) / 2 + text.pos.x, (this.dimensions.y - this.margin.y) / 2 + text.pos.y);


		}

		this.text = [];
	}

	/**
	 * @author Toddez
	 * @param {Color} color 
	 */
	setBackground(color) {
		this.background = color;
	}

	/**
	 * Set size of canvas element, defaults to this.dimensions
	 * @author Toddez
	 * @param {Vector2} dimensions not necessary
	 */
	setDimensions(dimensions) {
		if (dimensions)
			this.dimensions = dimensions;

		// Set width and height of element
		this.element.width = this.dimensions.x - this.margin.x;
		this.element.height = this.dimensions.y - this.margin.y;
	}

	/**
	 * Sets margin of canvas
	 * @param {Vector2} margin 
	 */
	setMargin(margin) {
		this.margin = margin;
		this.setDimensions();
	}

	/**
	 * Set canvas fullscreen
	 * @author Toddez
	 * @param {Boolean} isFullscreen 
	 */
	fullscreen(isFullscreen) {
		if (!this.isFullscreen)
			this.originalDimensions = this.dimensions;

		this.isFullscreen = isFullscreen;

		if (this.isFullscreen == true) {
			let body = document.body;
			let html = document.documentElement;

			let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.offsetHeight);

			this.dimensions = new Vector2(document.body.clientWidth, height);

			let minDim = Math.min((this.dimensions.x - this.margin.x), (this.dimensions.y - this.margin.y));
			let xScale = ((this.dimensions.y - this.margin.y) / (minDim));
			let yScale = ((this.dimensions.x - this.margin.x) / (minDim));

			let ratio = xScale / yScale;

			this.scale.y = this.scale.x / ratio;
		} else {
			if (this.originalDimensions)
				this.dimensions = this.originalDimensions;
		}

		this.setDimensions();
	}

	/**
	 * Set all callbacks for input
	 * @author Toddez 
	 */
	setupInput() {
		let self = this;

		// Mouse
		this.element.onmousemove = function (event) {
			let rect = self.element.getBoundingClientRect();
			Canvas.mousePos = new Vector2(event.clientX - rect.left, event.clientY - rect.top);

			if (Canvas.firstMouseMove) {
				Canvas.lastMousePos = Canvas.mousePos;
				Canvas.firstMouseMove = false;
			}
		};

		this.element.onmousedown = function () {
			Canvas.mouseDown = true;
		}

		this.element.onmouseup = function () {
			Canvas.mouseDown = false;
		}

		// Scroll
		this.element.addEventListener('wheel', function (event) {
			Canvas.scrollTotal = new Vector2(Canvas.scrollTotal.x + event.deltaX, Canvas.scrollTotal.y + event.deltaY);
		}, false);
	}

	/**
	 * Set listeners for mouse events
	 * @author Toddez
	 */
	static setupMouse() {
		Canvas.mouseDown = false;
		Canvas.mousePos = new Vector2(0, 0);
		Canvas.lastMousePos = new Vector2(0, 0);
		Canvas.firstMouseMove = true;
	}

	/**
	 * Set listener for scroll event
	 * @author Toddez
	 */
	static setupScroll() {
		Canvas.scrollTotal = new Vector2(0, 0);
		Canvas.lastScroll = new Vector2(0, 0);
	}

	/**
	 * Set listener for key events
	 * @author Toddez
	 */
	static setupKeys() {
		Canvas.keys = {};

		$(window).on('keydown', function (event) {
			let key = Canvas.keys[event.which];
			if (key) {
				key.down = true;
				if (key.onDown)
					key.onDown();
			}
		});

		$(window).on('keyup', function (event) {
			let key = Canvas.keys[event.which];
			if (key) {
				key.down = false;
				if (key.onUp)
					key.onUp();
			}
		});
	}

	static registerKey(keycode, onDown, onUp) {
		Canvas.keys[keycode] = { down: false, onDown: onDown, onUp: onUp };
	}

	static getKeyDown(keycode) {
		if (Canvas.keys[keycode])
			return Canvas.keys[keycode].down;
		else
			return false;
	}

	/**
	 * Returns the delta mouse position
	 * @author Toddez
	 * @returns {Vector2} delta
	 */
	static mouseDelta() {
		let delta = new Vector2(Canvas.mousePos.x - Canvas.lastMousePos.x, Canvas.mousePos.y - Canvas.lastMousePos.y);
		Canvas.lastMousePos = Canvas.mousePos;
		return delta;
	}

	/**
	 * Returns the delta scroll
	 * @author Toddez
	 * @returns {Vector2} delta
	 */
	static scrollDelta() {
		let delta = new Vector2(Canvas.scrollTotal.x - Canvas.lastScroll.x, Canvas.scrollTotal.y - Canvas.lastScroll.y);
		Canvas.lastScroll = Canvas.scrollTotal;
		return delta;
	}

	/**
	 * On window reseize, update all canvases' dimensions if fullscreen
	 * @author Toddez
	 */
	static windowResizeCallback() {
		if (Canvas.canvases)
			for (let i = 0; i < Canvas.canvases.length; i++) {
				if (Canvas.canvases[i].isFullscreen)
					Canvas.canvases[i].fullscreen(true);
			}
	}
}

// Static variables
Canvas.canvases = new Array();

$(document).ready(function () {

	// Set global callbacks
	$(window).resize(Canvas.windowResizeCallback);

	// Setup input
	Canvas.setupMouse();
	Canvas.setupKeys();
	Canvas.setupScroll();
});