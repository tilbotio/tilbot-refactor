interface ProjectControllerLookupInterface {
    cell(db: string, row:string, col: string): Promise<string>;
    random(db: string): Promise<string>;
}
