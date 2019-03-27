window.addEventListener('load', () => {

    let lastShowingInput = true;
    let showingInput = true;
    let showingInfo = false;

    document.getElementById('inputToggle').addEventListener('click', () => {
        if (showingInput == true) {
            document.getElementById('asideWrapper').classList.add('hidden');
            document.getElementById('inputToggle').classList.add('fa-arrow-alt-circle-right');
            document.getElementById('inputToggle').classList.remove('fa-arrow-alt-circle-left');
        } else {
            document.getElementById('asideWrapper').classList.remove('hidden');
            document.getElementById('inputToggle').classList.add('fa-arrow-alt-circle-left');
            document.getElementById('inputToggle').classList.remove('fa-arrow-alt-circle-right');
        }

        showingInput = !showingInput;
    });

    document.getElementById('infoToggle').addEventListener('click', () => {
        if (showingInfo == false)
            document.getElementById('info').classList.add('showing');
        else
            document.getElementById('info').classList.remove('showing');

        showingInfo = !showingInfo;
    });

    let app = new Application(30, 30);
    let canvas = new Canvas('webgl', new Vector2(500, 500), null, true);
    let text = new Canvas('2d', new Vector2(500, 500), null, false);
    let graph = new Graph(canvas, text);

    let lastInput = 0;
    let inputChanged = false;

    function map(v, a, b, c, d) {
        if (v == a)
            return c;
        if (v == b)
            return d;

        return c + ((v - a) / (b - a)) * d;
    }

    function checkInput() {
        var functionStrings = document.getElementById('functions').value.split('\n');
        var variableStrings = document.getElementById('variables').value.split('\n');
        var userFunctionStrings = document.getElementById('userFunctions').value.split('function');

        graph.setFunctions(functionStrings, variableStrings, userFunctionStrings);
    }

    app.onStart = function () {
        canvas.setBackground(new Color(1, 1, 1, 1));
        canvas.setMargin(new Vector2(400, 0));
        canvas.fullscreen(true);

        text.setMargin(new Vector2(400, 0));
        text.fullscreen(true);

        let minDim = Math.min((canvas.dimensions.x - canvas.margin.x), (canvas.dimensions.y - canvas.margin.y));
        let xScale = (canvas.dimensions.y - canvas.margin.y) / (minDim * 5);
        let yScale = (canvas.dimensions.x - canvas.margin.x) / (minDim * 5);

        canvas.scale = new Vector2(xScale, yScale);

        let inputCallback = () => {
            inputChanged = true;
            lastInput = app.getTime();
        }

        document.getElementById('functions').addEventListener('input', inputCallback);
        document.getElementById('variables').addEventListener('input', inputCallback);
        document.getElementById('userFunctions').addEventListener('input', inputCallback);

        document.getElementById('functions').addEventListener('load', checkInput);
        document.getElementById('variables').addEventListener('load', checkInput);
        document.getElementById('userFunctions').addEventListener('load', checkInput);
    };

    app.onRender = function (deltaTime) {
        if (showingInput != lastShowingInput) {
            canvas.setMargin(new Vector2(showingInput ? 400 : 0, 0));
            text.setMargin(new Vector2(showingInput ? 400 : 0, 0));

            canvas.element.style = 'left: ' + canvas.margin.x + 'px';
            text.element.style = 'left: ' + text.margin.x + 'px';

            canvas.fullscreen(true);
            text.fullscreen(true);

            lastShowingInput = showingInput;
        }

        graph.time = app.getTime();
        graph.render();
    }

    app.onUpdate = function (deltaTime) {
        if (inputChanged == true && app.getTime() - lastInput >= 0.15) {
            checkInput();
            inputChanged = false;
        }

        let mouseDelta = Canvas.mouseDelta();
        let scrollDelta = Canvas.scrollDelta();

        if (Canvas.mouseDown) {
            document.getElementById(canvas.id).classList.add('grabbing');
            document.getElementById(text.id).classList.add('grabbing');

            canvas.position.x += ((mouseDelta.x * 2) / (canvas.dimensions.x - canvas.margin.x) * (1 / canvas.scale.x));
            canvas.position.y -= ((mouseDelta.y * 2) / (canvas.dimensions.y - canvas.margin.y) * (1 / canvas.scale.y));
        } else {
            document.getElementById(canvas.id).classList.remove('grabbing');
            document.getElementById(text.id).classList.remove('grabbing');
        }

        let mouseRealX = map(Canvas.mousePos.x * 2, 0, canvas.dimensions.x - canvas.margin.x, -1, 1) * (1 / canvas.scale.x);
        let mouseRealY = map(Canvas.mousePos.y * 2, 0, canvas.dimensions.y - canvas.margin.y, -1, 1) * (1 / canvas.scale.y);

        let mousePosX = (canvas.position.x - mouseRealX);
        let mousePosY = (canvas.position.y - mouseRealY);

        if (Math.abs(scrollDelta.x) + Math.abs(scrollDelta.y) > 0) {
            let delta = (scrollDelta.x + scrollDelta.y);

            delta = 10 / ((Math.min(Math.max(0.01, Math.abs(delta)), 1) * Math.sign(delta)) / canvas.scale.x);

            let xDiff = (delta / ((canvas.dimensions.x - canvas.margin.x)));
            let yDiff = (delta / ((canvas.dimensions.y - canvas.margin.y)));

            canvas.scale.x -= Math.min(xDiff * 8, canvas.scale.x * 0.9);
            canvas.scale.y -= Math.min(yDiff * 8, canvas.scale.y * 0.9);

            let ratio = (canvas.dimensions.x - canvas.margin.x) / (canvas.dimensions.y - canvas.margin.y);
            canvas.scale.x = Math.min(Math.max(0.000001 / ratio, canvas.scale.x), 1000000 / ratio);
            canvas.scale.y = Math.min(Math.max(0.000001, canvas.scale.y), 1000000);

            mouseRealX = map(Canvas.mousePos.x * 2, 0, canvas.dimensions.x - canvas.margin.x, -1, 1) * (1 / canvas.scale.x);
            mouseRealY = map(Canvas.mousePos.y * 2, 0, canvas.dimensions.y - canvas.margin.y, -1, 1) * (1 / canvas.scale.y);

            let mousePosXNew = (canvas.position.x - mouseRealX);
            let mousePosYNew = (canvas.position.y - mouseRealY);

            let deltaMousePosX = mousePosX - mousePosXNew;
            let deltaMousePosY = mousePosYNew - mousePosY;

            canvas.position.x += deltaMousePosX;
            canvas.position.y += deltaMousePosY;
        }
    }

    app.start();
});