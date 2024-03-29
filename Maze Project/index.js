const {Engine, Render, Runner, World, Bodies, Body, Events} =  Matter;

const cellsHorizonetal = 40;
const cellsVertical = 20;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizonetal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options : {
        wireframes: false,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

//wall
const walls = [
    //                  X       Y  width  height
    Bodies.rectangle(width / 2, 0, width, 2, {isStatic:  true}), //top border
    Bodies.rectangle(width / 2, height, width, 2, {isStatic: true}),// buttom border
    Bodies.rectangle(0, height / 2, 2, height, {isStatic: true}),
    Bodies.rectangle(width, height / 2, 2, height, {isStatic: true})
]

World.add(world, walls);

// Maze generation

const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0){
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr
}

    const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizonetal).fill(false))
    const vertical = Array(cellsVertical).fill(null).map(() => Array(cellsHorizonetal - 1).fill(false));
    const horizontal =Array(cellsVertical - 1).fill(null).map(()=> Array(cellsHorizonetal).fill(false));


    /*
    optional loop
    const grid = [];

    for(let i = 0; i < 3; i++){
        grid.push([]);
        for(let j =0; j < 3; j++){

            grid[i].push(false);

        }
    }*/
    const startRow = Math.floor(Math.random() * cellsVertical);
    const startColumn = Math.floor(Math.random() * cellsHorizonetal);

    const stepThroughCells = (row, column) => {
        // if i have visited the cell at [row, column], then return
        if(grid[row][column]){

        }
        //Mark this cell as being visited
        grid[row][column] = true;

        //Assemble randomely-ordered list of neighbors
        const neighbors = shuffle([ 
            [row - 1, column, 'up'],
            [row, column + 1, 'right'],
            [row + 1, column, 'down'],
            [row, column - 1, 'left']
        ]);
    
        // For each neighbor....
        for(let neighbor of neighbors){
        const [nextRow, nextColumn, direction] = neighbor;
        // See if that neighbor is out of bounds
        if(nextRow < 0 || 
            nextRow >= cellsVertical || 
            nextColumn < 0 ||
             nextColumn >= cellsHorizonetal){
            continue;
        }

        // If we have visited that neighbor, continue to next neighbor
        if(grid[nextRow] [nextColumn]){
            continue;
        }
        // Remove a wall from either horizontals or verticals

        if(direction === 'left'){
            vertical[row][column - 1] = true;

        }else if (direction === 'right'){
            vertical[row][column] = true;

        }else if( direction === 'up'){
            horizontal[row - 1][column] = true;

        }else if(direction === 'down'){
            horizontal[row][column] = true;
        }
        stepThroughCells(nextRow, nextColumn); 
        }
        // visit that next cell

    };
    stepThroughCells(startRow, startColumn);

    horizontal.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }
            const wall = Bodies.rectangle( 
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label : 'wall',
                isStatic: true,
                render: {
                fillStyle: 'gray' 
                }
            }
            );
           World.add(world, wall);
        });

    });

    vertical.forEach((row, rowIndex) =>{
        row.forEach((open, columnIndex) => {
            if(open){
                return;
            }
            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex  * unitLengthY + unitLengthY / 2,
                5, unitLengthY,{
                    label: 'wall',
                    isStatic: true,
                    render: {
                    fillStyle: 'gray' 
                     }
                    }
                );
            World.add(world, wall);
        });
    });
//Goal
    const goal = Bodies.rectangle(
        width - unitLengthX / 2,
        height - unitLengthY / 2,
        unitLengthX * 0.7,
        unitLengthY * 0.7,
        {
            label: 'goal',
            isStatic: true,
            render: {
            fillStyle: 'green' 
            }
        }
    );

    World.add(world, goal);

    //Ball
    const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
    const ball = Bodies.circle(
        unitLengthX / 2,
        unitLengthY / 2,
        ballRadius,
        {
            label: 'ball'
        }
    );
    
    World.add(world, ball);

 document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
    
    if(event.keyCode === 87){
       Body.setVelocity(ball, {x, y: y - 5})
       // move up
    }
    if(event.keyCode === 65){
        Body.setVelocity(ball, {x: x - 5,  y})
        //move left
    }
    if(event.keyCode === 83){
        Body.setVelocity(ball, {x, y: y + 5})
        //move down
    }
    if(event.keyCode === 68){
        Body.setVelocity(ball, {x: x + 5, y})
       //move right 
    }
   
 });

 // Win condition 
 const restartBtn = document.querySelector('.btn')
 Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal']

        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');

            restartBtn.classList.remove('hide');
          
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if(body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            })
           
           
        }
        
    })
    restartBtn.addEventListener('click', ()=> {
        location.reload();
    });

 })

    





