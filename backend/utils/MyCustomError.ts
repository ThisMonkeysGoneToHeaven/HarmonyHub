export default class MyCustomError extends Error{    
    constructor(message: string, statusCode: number, data = {}){
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
    
    statusCode: number;
    data: object;
}