function Random(seed) {

    const
        DEBUG = false;

    function random() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    function shuffle(list) {
        for (let j=0;j<3;j++)
            for (let i=0;i<list.length;i++) {
                let
                    dest = Math.floor(random()*list.length),
                    tmp = list[i];
                list[i] = list[dest];
                list[dest] = tmp;
            }
        return list;
    }

    let
        self = {
            float:()=>{
                return random();
            },
            integer:(value)=>{
                return Math.floor(random()*value);
            },
            bool:()=>{
                return random()>0.5;
            },
            elementIndex:(list)=>{
                return Math.floor(random()*list.length);
            },
            element:(list)=>{
                return list[self.elementIndex(list)];
            },
            shuffle:(list)=>{
                return shuffle(list)
            },
            removeElement:(list)=>{
                let
                    id = self.elementIndex(list);
                return list.splice(id,1)[0];
            }
        };

    return self;

}