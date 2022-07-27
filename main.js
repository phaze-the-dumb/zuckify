const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

document.body.appendChild(canvas);
let lerp = (x, y, a) => x * (1 - a) + y * a;

let config = {
    zuckify: false,
    gridX: 0,
    gridY: 0,
    scale: 0.01,
    sca: 1,
    gridWidth: 1000,
    gridHeight: 1000
}

let mouse = {
    x: 0,
    y: 0,
    down: false,
    middleDown: false
}

let ctxMenu = {
    shown: false,
    x: 0,
    y: 0
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.onwheel = ( e ) => {
    if(e.deltaY > 0){
        config.sca /= 2;
    } else{
        config.sca *= 2;
    }
}

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.resetTransform();
    ctx.translate(canvas.width / 2, canvas.height / 2); 
}

window.onclick = () => {
    ctxMenu.shown = false;
}

canvas.onmousemove = ( e ) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

canvas.onmouseup = ( e ) => {
    if(e.which === 2){
        mouse.middleDown = false;
    } else{
        mouse.down = false;
    }
}

canvas.onmousedown = ( e ) => {
    if(e.which === 2){
        mouse.middleDown = true;
    } else{
        mouse.down = true;
    }
}

canvas.oncontextmenu = ( e ) => {
    e.preventDefault();

    ctxMenu.shown = true;
    ctxMenu.x = mouse.x;
    ctxMenu.y = mouse.y;
}

let zuck = new Image();
zuck.src = './zuck.png';

let startMoveX = 0;
let startMoveY = 0;
let startMoveDown = false;

ctx.translate(canvas.width / 2, canvas.height / 2);

let drawAt = (x, y, w, h, ...otherParams) => {
    return [
        (((canvas.width / -2) + x * 50) - config.gridX) * config.scale,
        (((canvas.height / -2) + y * 500) - config.gridY) * config.scale,
        ((((canvas.width / -2) + x * 50) - config.gridX) + w) * config.scale,
        ((((canvas.height / -2) + y * 50) - config.gridY) + h) * config.scale,
        ...otherParams
    ]
}

let render = () => {
    config.scale = lerp(config.scale, config.sca, 0.5);

    if(mouse.middleDown && !startMoveDown){
        startMoveDown = true;

        startMoveX = config.gridX + (mouse.x / config.scale);
        startMoveY = config.gridY + (mouse.y / config.scale);
    }

    if(mouse.middleDown && startMoveDown){
        config.gridX = startMoveX - (mouse.x / config.scale);
        config.gridY = startMoveY - (mouse.y / config.scale);
    }

    if(!mouse.middleDown && startMoveDown){
        startMoveDown = false;
    }

    requestAnimationFrame(render);
    ctx.clearRect(canvas.width / -2, canvas.height / -2, canvas.width, canvas.height);

    if(config.zuckify)
        ctx.drawImage(zuck, 0 - zuck.width / 2, canvas.height - zuck.height);

    ctx.fillStyle = '#000D';
    ctx.fillRect(canvas.width / -2, canvas.height / -2, canvas.width, canvas.height);

    if(config.sca > 0.125){
        ctx.strokeStyle = '#000';
        for(let x = 0; x < config.gridWidth; x++){
            for(let y = 0; y < config.gridHeight; y++){
                if(
                    (((canvas.width / -2) + x * 50) - config.gridX) * config.scale > canvas.width / -2 &&
                    (((canvas.height / -2) + y * 50) - config.gridY) * config.scale > canvas.height / -2 &&
                    ((((canvas.width / -2) + x * 50) - config.gridX) + 50) * config.scale < canvas.width / 2 &&
                    ((((canvas.height / -2) + y * 50) - config.gridY) + 50) * config.scale < canvas.height / 2
                ){
                    ctx.strokeRect((((canvas.width / -2) + x * 50) - config.gridX) * config.scale, (((canvas.height / -2) + y * 50) - config.gridY) * config.scale, 50 * config.scale, 50 * config.scale);
                }
            }
        }
    } else{
        ctx.strokeStyle = '#000';
        for(let x = 0; x < config.gridWidth / 10; x++){
            for(let y = 0; y < config.gridHeight / 10; y++){
                if(
                    (((canvas.width / -2) + x * 500) - config.gridX) * config.scale > canvas.width / -2 &&
                    (((canvas.height / -2) + y * 500) - config.gridY) * config.scale > canvas.height / -2 &&
                    ((((canvas.width / -2) + x * 500) - config.gridX) + 500) * config.scale < canvas.width / 2 &&
                    ((((canvas.height / -2) + y * 500) - config.gridY) + 500) * config.scale < canvas.height / 2
                ){
                    ctx.strokeRect((((canvas.width / -2) + x * 500) - config.gridX) * config.scale, (((canvas.height / -2) + y * 500) - config.gridY) * config.scale, 500 * config.scale, 500 * config.scale);
                }
            }
        }
    }
}

render();