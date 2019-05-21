HTMLCanvasElement.prototype.adjustSize = function() {
    this.height = this.scrollHeight;
    this.width = this.scrollWidth;
};

HTMLCanvasElement.prototype.clear = function() {
    this.getContext('2d').clearRect(0, 0, this.width, this.height);
};

HTMLCanvasElement.prototype.save = function() {
    let downloadLink = document.createElement('a');
        downloadLink.download = 'Rysunek.png';
        downloadLink.href = this.toDataURL('image/png;base64');
        downloadLink.click();
};

HTMLCanvasElement.prototype.drawCircle = function(circleCenterX, circleCenterY, circleRadius = 5) {
    // console.log(`Współrzędne środka koła: x: ${circleCenterX}, y: ${circleCenterY}\nWielkość jednostki skali: ${pixelSize}\nDługość promienia koła: ${circleRadius}`);

    const context = this.getContext('2d');
    const centerCoords = approximateCoordinates({ x: circleCenterX, y: circleCenterY });
    
    // Pobieranko wszystkich punktów koła i rysowanie ich
    getCircleCoords(centerCoords, circleRadius)
        .forEach(point => drawRectangle(context, point, pixelColor));
};

HTMLCanvasElement.prototype.drawRing = function(circleCenterX, circleCenterY, circleRadius = 5) {
    // console.log(`Współrzędne środka koła: x: ${circleCenterX}, y: ${circleCenterY}\nWielkość jednostki skali: ${pixelSize}\nDługość promienia koła: ${circleRadius}`);

    const context = this.getContext('2d');
    const centerCoords = approximateCoordinates({ x: circleCenterX, y: circleCenterY });
    
    // Pobieranko wszystkich punktów koła i rysowanie ich
    getCircleCoords(centerCoords, circleRadius, false)
        .forEach(point => drawRectangle(context, point, pixelColor));
};

HTMLCanvasElement.prototype.drawSpray = function(sprayCenterX, sprayCenterY, sprayRadius = 12, pointsQuantity = 10) {
    console.log(`Współrzędne środka Sprayu: x: ${sprayCenterX}, y: ${sprayCenterY}\nWielkość jednostki skali: ${pixelSize}\nDługość promienia sprayu: ${sprayRadius}\nIlość rysowanych elementów: ${pointsQuantity}`);

    const context = this.getContext('2d');
    const centerCords = { x: sprayCenterX, y: sprayCenterY };
    const circleCords = getCircleCoords(centerCords, sprayRadius);
    const randomIndexes = [];

    while (randomIndexes.length < pointsQuantity)
    {
        const randomIndex = Math.floor(Math.random() * circleCords.length);
        if(!randomIndexes.includes(randomIndex))
            randomIndexes.push(randomIndex);
    }

    randomIndexes.forEach(randomIndex => {drawRectangle(context, circleCords[randomIndex], pixelColor); console.log(circleCords[randomIndex])});
};

HTMLCanvasElement.prototype.drawCross = function(crossCenterX, crossCenterY, crossSize = 3) {
    const context = this.getContext('2d');
    const crossCenter = { x:crossCenterX, y:crossCenterY };
    
    // Rysowanko góry krzyża
    for (let i = 1; i < crossSize; i++)
    {
        drawRectangle(context, { x: crossCenter.x - (i * pixelSize), y: crossCenter.y - (i * pixelSize) });
        drawRectangle(context, { x: crossCenter.x + (i * pixelSize), y: crossCenter.y - (i * pixelSize) });
    }

    // Rysowanko środka krzyża
    drawRectangle(context, crossCenter);

    // Rysowanko dołu krzyża
    for (let i = 1; i < crossSize; i++)
    {
        drawRectangle(context, { x: crossCenter.x - (i * pixelSize), y: crossCenter.y + (i * pixelSize) });
        drawRectangle(context, { x: crossCenter.x + (i * pixelSize), y: crossCenter.y + (i * pixelSize) });
    }
};

HTMLCanvasElement.prototype.drawSquare = function(squareCenterX, squareCenterY, squareSize = 5) {

    const context = this.getContext('2d');
    const center = { x: squareCenterX, y: squareCenterY };

    squareSize = squareSize % 2 == 0 ?
        squareSize + 1 :
        squareSize;
    
    const startPoint = { 
        x: center.x - (Math.floor(squareSize / 2) * pixelSize),
        y: center.y - (Math.floor(squareSize / 2) * pixelSize)
    };

    // for (let i = 0; i < squareSize; i++)
    // {
    //     for (let j = 0; j < squareSize; j++)
    //     {
    //         drawRectangle(context, {
    //             x: startPoint.x + (i * pixelSize),
    //             y: startPoint.y + (j * pixelSize)
    //         });
    //     }
    // }

    drawRectangle(context, startPoint, pixelColor, pixelSize * squareSize);
    
};

HTMLCanvasElement.prototype.drawLine = function(firstPoint, secondPoint) {
    const context = this.getContext('2d');
    const horizontal = firstPoint.y == secondPoint.y;
    const distance = horizontal ?
        (secondPoint.x - firstPoint.x) / pixelSize:
        (secondPoint.y - firstPoint.y) / pixelSize;
    const rising = distance > 0;
    for(let i = 0; i <= Math.abs(distance); i++)
    {
        drawRectangle(context, {
            x: horizontal ?
                rising ?
                    firstPoint.x + (i * pixelSize) :
                    firstPoint.x - (i * pixelSize) :
                firstPoint.x,
            y: horizontal ? 
                firstPoint.y : 
                rising ?
                    firstPoint.y + (i * pixelSize) :
                    firstPoint.y - (i * pixelSize)
        });
    }
};

HTMLCanvasElement.prototype.erasePoint = function(pointCoords) {
    const context = this.getContext('2d');
    // const justifiedCoordinates = approximateCoordinates({pointX, pointY});
    context.clearRect(
        pointCoords.x, pointCoords.y, 
        pixelSize, pixelSize
    );
};

HTMLCanvasElement.prototype.fillSpace = function(fillColor = pixelColor) {
    const context = this.getContext('2d');
    context.fillStyle = fillColor;
    context.fillRect(0, 0, this.scrollWidth, this.scrollHeight);
};

HTMLCanvasElement.prototype.getPointColor = function(point) {
    const context = this.getContext('2d');
    const pointData = context.getImageData(point.x, point.y, 1, 1).data;
    return "#" + ("000000" + getHexFromRgb(pointData.toString())).slice(-6);
};

HTMLInputElement.prototype.updateValue = function() {
    this.value = pixelSize;
};

HTMLElement.prototype.hide = function() {
    this.style.setProperty('display', 'none');
    window.removeEventListener('mousedown', checkUserFocus);
};

HTMLElement.prototype.show = function() {
    this.style.setProperty('display', 'inline-block');
    window.addEventListener('mousedown', checkUserFocus);
};

HTMLElement.prototype.moveTo = function(offsetX, offsetY) {
    this.style.setProperty('top', `${offsetY}px`);
    this.style.setProperty('left', `${offsetX}px`);
};

HTMLElement.prototype.getProperty = function(propertyName) {
    return window.getComputedStyle(this)[propertyName];
};