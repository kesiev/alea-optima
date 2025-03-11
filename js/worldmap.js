function WorldMap(seed,width,height) {

    const
        HOLES = [
            { x:0, y:0 }, { x:2, y:0 },
            { x:1, y:1 },
            { x:0, y:2 }, { x:2, y:2 }
        ],
        DIRECTIONS={
            north:{x:0,y:-1},
            south:{x:0,y:1},
            east:{x:1,y:0},
            west:{x:-1,y:0}
        };

    let
        random = new Random(seed),
        map = [],
        cells = [];

    for (let i=0;i<height;i++) {
        let
            row = [];
        map.push(row);
        for (let j=0;j<width;j++) {
            let
                cell = { x:j, y:i, index:i*width+j, destinations:[], directions:{} };
            if (i==0)
                if (j==0)
                    cell.symbol = "nwSymbol";
                else if (j==width-1)
                    cell.symbol = "neSymbol";
                else
                    cell.symbol = "nSymbol";
            else if (i==height-1)
                if (j==0)
                    cell.symbol = "swSymbol";
                else if (j==width-1)
                    cell.symbol = "seSymbol";
                else
                    cell.symbol = "sSymbol";
            else
                if (j==0)
                    cell.symbol = "wSymbol";
                else if (j==width-1)
                    cell.symbol = "eSymbol";
                else
                    cell.symbol = "cSymbol";

            row.push(cell);
            cells.push(cell);
        }

    }

    if (random.bool()) {

        let
            hole = random.element(HOLES),
            cell = map[hole.y][hole.x];

        map[hole.y][hole.x] = 0;
        cells.splice(cells.indexOf(cell),1);

    }

    cells.forEach(cell=>{
        for (let k in DIRECTIONS) {
            let
                direction = DIRECTIONS[k];

            if (map[cell.y+direction.y] && map[cell.y+direction.y][cell.x+direction.x]) {
                let
                    destination = map[cell.y+direction.y][cell.x+direction.x];
                cell.directions[k] = destination;
                cell.destinations.push(destination);
            }
        };
    })

    this.width = width;
    this.height = height;
    this.map = map;

    this.getCells=()=>{
        return cells.slice();
    }

}