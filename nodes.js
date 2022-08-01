class Node{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.id = genID();
        this.inputs = [];
        this.outputs = [];
        this.hidden = false;
        this.namespace = null;
        this.name = null;
    }
}

let getNode = ( id ) => {
    class StartNode extends Node{
        constructor(x, y){
            super(x, y);

            this.inputs = [];
            this.outputs = [ { type: 'flow' } ];
            this.hidden = false;
            this.namespace = 'g-events';
            this.name = 'On Start'
        }
    }

    class IFNode extends Node{
        constructor(x, y){
            super(x, y);

            this.inputs = [ { type: 'flow' }, { type: 'bool' } ];
            this.outputs = [ { type: 'flow', name: 'True' }, { type: 'flow', name: 'False' } ];
            this.hidden = false;
            this.namespace = 'g-logic';
            this.name = 'If'
        }
    }

    class EqualsINTNode extends Node{
        constructor(x, y){
            super(x, y);

            this.inputs = [ { type: 'flow' }, { type: 'int' }, { type: 'int' } ];
            this.outputs = [ { type: 'flow' }, { type: 'bool' } ];
            this.hidden = false;
            this.namespace = 'g-logic';
            this.name = 'Equals INT'
        }
    }

    class LogNode extends Node{
        constructor(x, y){
            super(x, y);

            this.inputs = [ { type: 'flow' }, { type: 'string' } ];
            this.outputs = [ { type: 'flow' } ];
            this.hidden = false;
            this.namespace = 'g-other';
            this.name = 'Log'
        }
    }

    class CEBadNode extends Node{
        constructor(x, y){
            super(x, y);

            this.inputs = [ { type: 'flow' } ];
            this.outputs = [ { type: 'flow' }, { type: 'bool' } ];
            this.hidden = false;
            this.namespace = 'g-other';
            this.name = 'Is Computer Bad'
        }
    }

    let nodes = {
        'n-start': StartNode,
        'n-if': IFNode,
        'n-equalsint': EqualsINTNode,
        'n-ceBad': CEBadNode,
        'n-log': LogNode
    }

    return nodes[id];
}

let getDefaultNodeGroups = () => {
    return [ { id: 'g-events', name: 'Events >' }, { id: 'g-logic', name: 'Logic >' }, { id: 'g-other', name: 'Other >' } ];
}

let getGroupById = ( id ) => {
    let groups = {
        'g-events': [
            { id: 'n-start', name: 'On Start' }
        ],
        'g-logic': [
            { id: 'n-if', name: 'If' },
            { id: 'n-equalsint', name: 'INT Equals' }
        ],
        'g-other': [
            { id: 'n-ceBad', name: 'Is Computer Bad' },
            { id: 'n-log', name: 'Log' },
        ]
    }

    return groups[id];
}

let genID = () => {
    let text = '';

    for (let index = 0; index < 10; index++) {
        text += String.fromCharCode(Math.floor(Math.random() * (126 - 33)) + 33);
    }

    return text;
}

let openNodes = () => {
    let nodeMenu = document.querySelector('#nodeMenu');
    let nodeList = document.querySelector('.nodes');

    nodeMenu.style.display = 'block';
    nodeMenu.style.left = mouse.x + 'px';
    nodeMenu.style.top = mouse.y + 'px';

    nodeList.innerHTML = '';

    getDefaultNodeGroups().forEach(g => {
        nodeList.innerHTML += '<div class="selectMenu" onclick="nodeOpen(\''+g.id+'\')">'+g.name+'</div>'
    })
}

let closeNodes = () => {
    let nodeMenu = document.querySelector('#nodeMenu');
    nodeMenu.style.display = 'none';
}

let nodeOpen = ( id ) => {
    let nodeList = document.querySelector('.nodes');

    if(id.startsWith('g-')){
        nodeList.innerHTML = '';

        getGroupById(id).forEach(g => {
            nodeList.innerHTML += '<div class="selectMenu" onclick="nodeOpen(\''+g.id+'\')">'+g.name+'</div>'
        })
    } else{
        let node = getNode(id);
        if(!node)return;

        let n = new node(config.gridX + mouse.x, config.gridY + mouse.y);
        nodes.push(n);

        closeNodes();
    }
}