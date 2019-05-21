const toRadians = degrees => degrees / 180 * Math.PI;

const pixelValueIsValid = pixelValue => (!isNaN(pixelValue) && pixelValue >= 1 && pixelValue <= 100);

const getHexFromRgb = rgbValues =>  {
    rgbValues = rgbValues.split(',');
    if(rgbValues.length < 3)
        throw new Error(`${rgbValues.length} nie jest właściwą ilością składników schematu barw RGB!`);
        
    const [r, g, b] = rgbValues;
    if (r > 255 || g > 255 || b > 255)
        throw new Error("Podano niewłaściwe części składowe schematu RGB!");
    return ((r << 16) | (g << 8) | b).toString(16);
};

const getRectangleCoords = e => {
    let rectangle = { x: 0, y: 0 };
    rectangle.x = Math.floor(e.offsetX / pixelSize) * pixelSize;
    rectangle.y = Math.floor(e.offsetY / pixelSize) * pixelSize;
    return rectangle;
};

const createPoint = (pointX, pointY) => { return {x: pointX, y: pointY} };

const getCircleCoords = (centerCoords, circleRadius, filled = true) => {
    const startingPoint = { x:centerCoords.x - ((circleRadius - 1) * pixelSize), y:centerCoords.y - Math.floor(circleRadius / 2) * pixelSize};
    const endingPoint = { x:centerCoords.x - ((circleRadius - 1) * pixelSize), y:centerCoords.y + Math.floor(circleRadius / 2) * pixelSize};
    const middlePoint = { x:centerCoords.x - (circleRadius * pixelSize), y:centerCoords.y - (Math.floor(circleRadius / 2) - 1) * pixelSize };

    const circleHeight = circleRadius - (Math.floor(circleRadius / 2) - 1);
    const maxCircleLength = (circleRadius * 2) - 1;
    const middleHeight = (endingPoint.y - startingPoint.y) / pixelSize - 1;
    const middleLength = circleRadius * 2 + 1;
    
    let circlePoints = [];

    // Pobieranko górnych współrzędnych
    for (let i = 0; i < circleHeight; i++)
    {
        const movingPoint = startingPoint;
        for (let j = 0; j < maxCircleLength - (i * 2); j++)
        {
            if(!filled && j != 0 && i != circleHeight - 1 && j != (maxCircleLength - (i * 2) - 1)) continue;

            circlePoints.push({ 
                x: movingPoint.x + ((i + j) * pixelSize), 
                y: movingPoint.y - (i * pixelSize) 
            });
        }
    }
    // Pobieranko dolnych współrzędnych
    for (let i = 0; i < circleHeight; i++)
    {
        const movingPoint = endingPoint;
        for (let j = 0; j < maxCircleLength - (i * 2); j++)
        {
            if(!filled && j != 0 && i != circleHeight - 1 && j != (maxCircleLength - (i * 2) - 1)) continue;

            circlePoints.push({ 
                x: movingPoint.x + ((i + j) * pixelSize), 
                y: movingPoint.y + (i * pixelSize) 
            });
        }
    }
    // Pobieranko środkowych współrzędnych
    for (let i = 0; i < middleHeight; i++)
    {
        const movingPoint = middlePoint;
        for (let j = 0; j < middleLength; j++)
        {
            if(!filled && j != 0 && j != middleLength - 1) continue;

            circlePoints.push({ 
                x: movingPoint.x + (j * pixelSize),
                y: movingPoint.y + (i * pixelSize)
            });
        }
    }
    return circlePoints;
};

const approximateCoordinates = coords => {
    return {
        x: Math.floor(coords.x / pixelSize) * pixelSize,
        y: Math.floor(coords.y / pixelSize) * pixelSize
    }
};

const drawRectangle = (ctx, rectangle, rectangleColor = pixelColor, rectangleSize = pixelSize) => {
    ctx.fillStyle = rectangleColor;
    ctx.fillRect(
        rectangle.x, rectangle.y,
        rectangleSize, rectangleSize
    );
};

const handleUsersActions = (e, ctx) => {
    if(e.ctrlKey)
        return ctx.canvas.clear();
    handleToolAction(ctx.canvas, e.offsetX, e.offsetY, currentTool);
};

const handleColorChange = colorBox => {
    pixelColor = window.getComputedStyle(colorBox).backgroundColor;
};

const handleColorContainerMovement = e => {
    e.preventDefault();
    if(colorContainer.getProperty('display') != 'block')
        colorContainer.show();
    colorContainer.moveTo(
        e.pageX + (colorContainer.clientWidth / 2), 
        (e.pageY - (colorContainer.clientHeight / 2) < 100) ?
            e.pageY + (colorContainer.clientHeight / 2) :
            e.pageY - (colorContainer.clientHeight / 2));
};

const handleToolAction = (canvas, posX, posY, toolName) => {
    const clickPosition = approximateCoordinates(
        createPoint(posX, posY)
    );
    const context = canvas.getContext('2d');

    switch (toolName)
    {
        case 'small-brush':
            drawRectangle(context, clickPosition);
            break;
        case 'normal-brush':
            drawRectangle(context, clickPosition);
            break;
        case 'big-brush':
            drawRectangle(context, clickPosition);
            break;
        case 'eraser':
            canvas.erasePoint(clickPosition);
            break;
        case 'paint-bucket':
            canvas.fillSpace();
            break;
        case 'spray':
            canvas.drawSpray(clickPosition.x, clickPosition.y);
            break;
        case 'cross':
            canvas.drawCross(clickPosition.x, clickPosition.y);
            break;
        case 'square':
            canvas.drawSquare(clickPosition.x, clickPosition.y);
            break;
        case 'circle':
            canvas.drawRing(clickPosition.x, clickPosition.y);
            break;
        case 'filled-circle':
            canvas.drawCircle(clickPosition.x, clickPosition.y);
            break;
        case 'dropper':
            pixelColor = canvas.getPointColor(createPoint(
                posX, posY
            ));
            changeToolByName(canvas, 'normal-brush');
            break;
    }
};

const handleToolState = toolName => {
    switch(toolName)
    {
        case 'small-brush':
            pixelSize = 20;
            pixelInput.updateValue();
            break;
        case 'normal-brush':
            pixelSize = 30;
            pixelInput.updateValue();
            break;
        case 'big-brush':
            pixelSize = 45;
            pixelInput.updateValue();
            break;
    }
};

const checkUserFocus = function(e) {
    if(!e.path.includes(colorContainer))
        colorContainer.hide();
};

const handlePixelChange = e => {
    if(pixelValueIsValid(e.target.value))
        pixelSize = e.target.value;
    else
    {
        e.target.value = initialPixelSize;
        throw Error(`Wartość '${e.target.value}' nie jest odpowiednia dla wielkości pojedyńczego śladu rysowania!`);
    }
};

const placeToolBar = referenceElement => {
    toolBar.style.setProperty('top', 
        referenceElement.getBoundingClientRect().bottom - 
        Number(toolBar.getProperty('height').split('px')[0])
         + 'px'
    );
    toolBar.style.setProperty('left', 
        (referenceElement.getBoundingClientRect().right + 
        (Number(toolBar.getProperty('width').split('px')[0]) / 7))
        + 'px'
    );
};
const changeTool = (canvas, tool) => {
    const toolName = tool.classList.value.substring(
        tool.classList.value.indexOf('tool') + 4
    ).trim();
    currentTool = toolName;
    changeToolCursor(canvas, tool.getProperty('background-image'));
    handleToolState(toolName);
};

const changeToolByName = (canvas, toolName, changeStates) => {
    const tool = document.querySelector(`.tool.${toolName}`);
    currentTool = toolName;
    changeToolCursor(canvas, tool.getProperty('background-image'));
    if(changeStates)
        handleToolState(toolName);
};

const changeToolCursor = (canvas, toolImage) => {
    if(!toolImage.includes('clear'))
        canvas.style.setProperty('cursor', `${toolImage}, pointer`);
};
const initialPixelSize = 30;
let pixelSize = initialPixelSize;
let pixelColor = 'hsl(240, 100%, 65%)';
let currentTool = 'normal-brush';

const colorContainer = document.querySelector('.color-box');
const pixelInput = colorContainer.querySelector('input[type=\'number\']');
const toolBar = document.querySelector('.tool-bar');
const saveButton = document.querySelector('.option.save');
const refreshButton = document.querySelector('.option:not(.save)');

(() => {
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    canvas.adjustSize();
    canvas.addEventListener('click', e => handleUsersActions(e, ctx));
    canvas.addEventListener('contextmenu', handleColorContainerMovement);
    canvas.addEventListener('mousemove', e => {
        if (e.which == 1)
            handleUsersActions(e, ctx)
    });

    colorContainer.addEventListener('contextmenu', e => e.preventDefault());
    colorContainer.addEventListener('click', e => {
        if(e.target.classList.contains('color'))
            handleColorChange(e.target);
    });

    pixelInput.addEventListener('input', handlePixelChange);

    placeToolBar(canvas);
    window.addEventListener('resize', () => placeToolBar(canvas));

    toolBar.addEventListener('click', e => {
        if(e.target.classList.contains('tool'))
            // Pobieram nazwę narzędzia
            changeTool(canvas, e.target);
    });

    saveButton.addEventListener('click', () => canvas.save());
    refreshButton.addEventListener('click', () => canvas.clear());
})();