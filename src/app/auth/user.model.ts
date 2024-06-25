export class User {
    constructor(
        public email: string |undefined, 
        public userId: string |undefined, 
        public _token: string |undefined,
        private _tokenExpirationDate: Date |undefined
    ) {}

    get token() {
        if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
            return null;
        }
        return this._token;
    }
}