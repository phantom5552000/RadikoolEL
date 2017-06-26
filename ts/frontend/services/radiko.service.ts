import {Http, Headers, ResponseContentType} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class RadikoService{
    constructor(private http: Http){

    }

    /**
     * 放送局取得
     * @returns {Observable<Response>}
     */
    public getStations = () =>{
        return this.http.get('http://radiko.jp/v2/station/region/full.xml');
    };

    /**
     * 番組データ取得
     * @param id
     */
    public getPrograms = (id: string) =>{
        let exec = require('child_process').execFile;

        exec('swfextract', ['-b', '14', 'player.swf', '-o', 'image.png'],
            function(err:any, stdout:any, stderr:any){
                console.log(err);
                console.log(stdout);
                console.log(stderr);
            }
        );
        return this.http.get('http://radiko.jp/v3/program/station/weekly/' + id + '.xml');
    };


    public getToken = (callback) =>{
        let headers = new Headers();

        headers.append("X-Radiko-App", "pc_ts");
        headers.append("X-Radiko-App-Version", "4.0.0");
        headers.append("X-Radiko-User", "test-stream");
        headers.append("X-Radiko-Device", "pc");

        this.http.post('https://radiko.jp/v2/api/auth1_fms', {}, {headers: headers}).subscribe(res =>{
            let token = res.headers.get('x-radiko-authtoken');
            let length = parseInt(res.headers.get('x-radiko-keylength'), 10);
            let offset = parseInt(res.headers.get('x-radiko-keyoffset'), 10);

            var fs = require('fs');
            var request = require('request');
            request.get('http://radiko.jp/apps/js/flash/myplayer-release.swf')
                .on('response', (res) => {
                    var ws = fs.createWriteStream('player.swf');
                    res.pipe(ws);
                    res.on('end', () => {

                        //  ws.close();
                        var spawn = require('child_process').spawn;
                        var swfextract = spawn('swfextract', ['-b', '12', 'player.swf', '-o', 'image.png']);
                        swfextract.on('exit', () => {
                            fs.open('image.png', 'r', (err, fd) => {

                                var buffer = new Buffer(length);
                                fs.readSync(fd, buffer, 0, length, offset);
                                let partial_key = buffer.toString('base64');

                                console.log(partial_key);




                                let headers = new Headers();
                                headers.append("pragma", "no-cache");
                                headers.append("X-Radiko-App", "pc_ts");
                                headers.append("X-Radiko-App-Version", "4.0.0");
                                headers.append("X-Radiko-User", "test-stream");
                                headers.append("X-Radiko-Device", "pc");
                                headers.append("X-Radiko-AuthToken", token);
                                headers.append("X-Radiko-Partialkey", partial_key);
                                this.http.post('https://radiko.jp/v2/api/auth2_fms', {}, { headers: headers }).subscribe(res =>{
                                    console.log(res);
                                });



                            });



                            callback();
                        });


                    });
                });



/*

            this.http.get('http://radiko.jp/apps/js/flash/myplayer-release.swf', {responseType: ResponseContentType.Blob,}).subscribe(res =>{
               /* let blob = res.blob();
                console.log(offset);
                console.log(length);
                console.log(blob);
                console.log(blob.slice(offset, offset + length));

                var blob = new Blob([res.blob()], {type: 'application/swf'});
                var filename = 'player.swf';

               // var buf = new Buffer(, 'base64');
                var fs = require('fs');
                fs.writeFileSync("player.swf", res.text());

                console.log(res.blob());

            });*/

        //    callback();
        });



    };
}