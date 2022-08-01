const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const contextMenu = document.querySelector('#ctxMenu');
let nodes = [];

let colours = {
    'bool': '#db2b6f',
    'int': '#2bbbdb',
    'string': '#7cd64f'
}

document.body.appendChild(canvas);
let lerp = (x, y, a) => x * (1 - a) + y * a;

let config = {
    zuckify: false,
    gridX: 25000,
    gridY: 25000,
    scale: 0.01,
    sca: 1,
    gridWidth: 1000,
    gridHeight: 1000,
    selected: null
}

let lineStart = { x: null, y: null };
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
    contextMenu.style.display = 'none';

    nodes.forEach(n => {
        let block = [
            ((canvas.width / -2) + n.x - config.gridX),
            ((canvas.height / -2) + n.y - config.gridY),
            200 * config.scale,
            (75 + (Math.max(n.outputs.length, n.inputs.length) * 50)) * config.scale,
        ];

        if(!lineStart.x && !lineStart.y){
            n.outputs.forEach((output, i) => {
                let square = [
                    (block[0] + 180) * config.scale + canvas.width / 2,
                    (block[1] + 75 + ( i * 50 )) * config.scale + canvas.height / 2,
                    10 * config.scale,
                    10 * config.scale
                ]
                
                if(mouse.x > square[0] && mouse.y > square[1] && mouse.x < square[0] + square[2] && mouse.y < square[1] + square[3]){
                    lineStart.x = mouse.x;
                    lineStart.y = mouse.y;
                    lineStart.node = n;
                    lineStart.nodeOutput = output;
                }
            })
        }

            
        n.inputs.forEach((input, i) => {
            let square = [
                (block[0] + 10) * config.scale + canvas.width / 2,
                (block[1] + 75 + ( i * 50 )) * config.scale + canvas.height / 2,
                10 * config.scale,
                10 * config.scale
            ]

            if(lineStart.x && lineStart.y){
                if(lineStart.nodeOutput.type === input.type && mouse.x > square[0] && mouse.y > square[1] && mouse.x < square[0] + square[2] && mouse.y < square[1] + square[3]){
                    lineStart.nodeOutput.connectedTo = { node: n, connection: input };
                    input.connectedTo = { node: lineStart.node, connection: lineStart.nodeOutput };

                    lineStart.x = null;
                    lineStart.y = null;
                }
            } else{
                if(mouse.x > square[0] && mouse.y > square[1] && mouse.x < square[0] + square[2] && mouse.y < square[1] + square[3]){
                    openEditMenu(input);
                }
            }
        })
    })
}

canvas.ondblclick = ( e ) => {
    e.preventDefault();
    let found = false;

    nodes.forEach(n => {
        let block = [
            ((canvas.width / -2) + n.x - config.gridX) * config.scale + canvas.width / 2,
            ((canvas.height / -2) +n.y - config.gridY) * config.scale + canvas.height / 2,
            200 * config.scale,
            (75 + (Math.max(n.outputs.length, n.inputs.length) * 50)) * config.scale,
        ];

        if(mouse.x > block[0] && mouse.y > block[1] && mouse.x < block[0] + block[2] && mouse.y < block[1] + block[3]){
            config.selected = n;
            found = true;
        }
    })

    if(!found)config.selected = null;
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

    if(!lineStart.x && !lineStart.y){
        ctxMenu.shown = true;
        ctxMenu.x = mouse.x;
        ctxMenu.y = mouse.y;

        setTimeout(() => {
            contextMenu.style.display = 'block';
            contextMenu.style.left = mouse.x + 'px';
            contextMenu.style.top = mouse.y + 'px';
        }, 1)
    } else{
        lineStart.x = null;
        lineStart.y = null;
    }
}

let zuck = new Image();
zuck.src = './zuck.png';

let startMoveX = 0;
let startMoveY = 0;
let startMoveDown = false;

ctx.translate(canvas.width / 2, canvas.height / 2);

let drawAt = (x, y, w, h, ...otherParams) => {
    if(w && h){
        return [
            (((canvas.width / -2) + x) - config.gridX) * config.scale,
            (((canvas.height / -2) + y) - config.gridY) * config.scale,
            w * config.scale, h * config.scale,
            ...otherParams
        ]
    } else{
        return [
            (((canvas.width / -2) + x) - config.gridX) * config.scale,
            (((canvas.height / -2) + y) - config.gridY) * config.scale,
            ...otherParams
        ]
    }
}

let render = () => {
    config.scale = lerp(config.scale, config.sca, 0.5);

    if(mouse.middleDown && !startMoveDown){
        startMoveDown = true;

        if(!config.selected){
            startMoveX = config.gridX + (mouse.x / config.scale);
            startMoveY = config.gridY + (mouse.y / config.scale);
        } else{
            startMoveX = config.selected.x - (mouse.x / config.scale);
            startMoveY = config.selected.y - (mouse.y / config.scale);
        }
    }

    if(mouse.middleDown && startMoveDown){
        if(!config.selected){
            config.gridX = startMoveX - (mouse.x / config.scale);
            config.gridY = startMoveY - (mouse.y / config.scale);
        } else{
            config.selected.x = startMoveX + (mouse.x / config.scale);
            config.selected.y = startMoveY + (mouse.y / config.scale);
        }
    }

    if(!mouse.middleDown && startMoveDown){
        startMoveDown = false;
    }

    requestAnimationFrame(render);
    ctx.clearRect(canvas.width / -2, canvas.height / -2, canvas.width, canvas.height);

    if(config.zuckify)
        ctx.drawImage(zuck, 0 - zuck.width / 2, canvas.height / 2 - zuck.height);

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

    let queuedLines = [];
    nodes.forEach(n => {
        ctx.fillStyle = '#555';
        ctx.fillRect(...drawAt(n.x, n.y, 200, 75 + (Math.max(n.outputs.length, n.inputs.length) * 50)));

        if(n === config.selected){
            ctx.strokeStyle = '#00ccff';
            ctx.strokeRect(...drawAt(n.x, n.y, 200, 75 + (Math.max(n.outputs.length, n.inputs.length) * 50)));
            ctx.strokeStyle = '#000';
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = '#000';
        ctx.font = (20 * config.scale) + 'px Arial';
        ctx.fillText(n.name, ...drawAt(n.x + 10, n.y + 30));

        ctx.font = (10 * config.scale) + 'px Arial';

        ctx.textAlign = 'left';
        n.inputs.forEach((input, i) => {
            input.i = i;

            let text = '';

            if(input.defaultValue)
                text += ' ('+input.defaultValue+')';

            if(input.type === 'flow'){
                ctx.fillText((input.name || input.type) + text, ...drawAt(n.x + 25, n.y + 75 + (i * 50) + 7));
                
                ctx.fillStyle = '#fff';
                ctx.fillRect(...drawAt(n.x + 10, n.y + 75 + (i * 50), 10, 10));
            } else{
                ctx.fillText((input.name || input.type) + text, ...drawAt(n.x + 25, n.y + 75 + (i * 50) + 7));

                ctx.fillStyle = colours[input.type];
                ctx.fillRect(...drawAt(n.x + 10, n.y + 75 + (i * 50), 10, 10));
            }
        })

        ctx.textAlign = 'right';
        n.outputs.forEach((output, i) => {
            output.i = i;

            if(output.type === 'flow'){
                ctx.fillText(output.name || output.type, ...drawAt(n.x + 175, n.y + 75 + (i * 50) + 7));

                ctx.fillStyle = '#fff';
                ctx.fillRect(...drawAt(n.x + 180, n.y + 75 + (i * 50), 10, 10));
            } else{
                ctx.fillText(output.name || output.type, ...drawAt(n.x + 175, n.y + 75 + (i * 50) + 7));

                ctx.fillStyle = colours[output.type];
                ctx.fillRect(...drawAt(n.x + 180, n.y + 75 + (i * 50), 10, 10));
            }

            if(output.connectedTo)
                queuedLines.push([ drawAt(n.x + 185, n.y + 75 + (i * 50) + 5), drawAt(output.connectedTo.node.x + 15, output.connectedTo.node.y + 75 + (output.connectedTo.connection.i * 50) + 5) ])
        })
    })

    ctx.strokeStyle = '#fff';
    queuedLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(...line[0]);
        ctx.lineTo(...line[1]);
        ctx.stroke();
        ctx.closePath();
    })

    if(lineStart.x && lineStart.y){
        ctx.strokeStyle = '#fff';

        ctx.beginPath();
        ctx.moveTo(lineStart.x - canvas.width / 2, lineStart.y - canvas.height / 2);
        ctx.lineTo(mouse.x - canvas.width / 2, mouse.y - canvas.height / 2);
        ctx.stroke();
        ctx.closePath();
    }

    ctx.strokeStyle = '#000';
    nodes.forEach(n => {
        let block = [
            ((canvas.width / -2) + n.x - config.gridX),
            ((canvas.height / -2) + n.y - config.gridY),
            200 * config.scale,
            (75 + (Math.max(n.outputs.length, n.inputs.length) * 50)) * config.scale,
        ];

        if(!lineStart.x && !lineStart.y){
            n.outputs.forEach((output, i) => {
                let square = [
                    (block[0] + 180) * config.scale,
                    (block[1] + 75 + ( i * 50 )) * config.scale,
                    10 * config.scale,
                    10 * config.scale
                ]

                ctx.strokeRect(square[0], square[1], square[2], square[3]);                
            })
        }

        if(lineStart.x && lineStart.y){
            n.inputs.forEach((input, i) => {
                let square = [
                    (block[0] + 10) * config.scale,
                    (block[1] + 75 + ( i * 50 )) * config.scale,
                    10 * config.scale,
                    10 * config.scale
                ]

                ctx.strokeRect(square[0], square[1], square[2], square[3]);
            })
        }
    })
}

let openEditMenu = ( input ) => {

}

render();