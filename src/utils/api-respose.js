class ApiResponse {
    constructor(statusCode, massage="success",data){
        this.statusCode = statusCode;
        this.data = data;
        this.message = massage;
        this.success =  statusCode < 400 ;

    } 
}


export {ApiResponse};