const crypto = require('crypto');
export class Utility{

    /**
     * オプジェクトをコピーする
     * @param src
     * @returns {T}
     */
    public static copy<T>(src:T){
        let res = {};
        for(let key in src){
            res[key] = src[key];
        }

        return res as T;
    }

    /**
     * 暗号化
     * @param src
     * @returns {string}
     */
    public static encrypt = (src) =>{
        try {
            let cipher = crypto.createCipher('aes-256-cbc', 'cryptKey');
            return cipher.update(src, 'utf-8', 'base64') + cipher.final('base64');
        } catch(e) {
            console.log(e);
            return '';
        }
    };

    /**
     * 復号化
     * @param src
     * @returns {string}
     */
    public static decrypt = (src) =>{
        try {
            var decipher = crypto.createDecipher('aes-256-cbc', 'cryptKey');

            return decipher.update(src, 'base64', 'utf8') + decipher.final('utf8');
        } catch(e){
            console.log(e);
            return '';
        }
    };
}