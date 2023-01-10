class BasicProjectController {

    protected project: any;
    private selected_group_blocks: Array<any>;
    
    constructor() {       
        this.project = {};
        this.selected_group_blocks = [];
    }

    get_path() {
        var path = [];

        console.log(this.selected_group_blocks);

        for (var b in this.selected_group_blocks) {
            path.push(this.selected_group_blocks[b].id);
        }

        console.log(path);

        return path;
    }

    get_current_block_id() {
        return this.project.current_block_id;
    }

    set_current_block_id(new_id: number) {
        this.project.current_block_id = new_id;
    }

    load_project(json_str: string) {
        this.project = JSON.parse(json_str);
    }

    move_to_group(params: any) {
        this.selected_group_blocks.push(params);      
    }

    move_level_up() {
        this.selected_group_blocks.pop();
    }

    move_to_root() {
        this.selected_group_blocks = [];
    }
}

export {BasicProjectController}