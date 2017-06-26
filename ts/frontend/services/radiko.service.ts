import {Http, Headers, ResponseContentType} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {IProgram} from '../interfaces/program.interface';

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
        return this.http.get('http://radiko.jp/v3/program/station/weekly/' + id + '.xml');
    };


    /**
     * トークン取得
     * @param callback
     */
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

                                let headers = new Headers();
                                headers.append("pragma", "no-cache");
                                headers.append("X-Radiko-App", "pc_ts");
                                headers.append("X-Radiko-App-Version", "4.0.0");
                                headers.append("X-Radiko-User", "test-stream");
                                headers.append("X-Radiko-Device", "pc");
                                headers.append("X-Radiko-AuthToken", token);
                                headers.append("X-Radiko-Partialkey", partial_key);
                                this.http.post('https://radiko.jp/v2/api/auth2_fms', {}, { headers: headers }).subscribe(res =>{
                                    callback(token);
                                });
                            });
                        });
                    });
                });
        });
    };

    /**
     * タイムフリー取得
     * @param program
     * @param callback
     */
    public getTimeFree = (stationId: string, program:IProgram, callback) => {
        this.getToken((token) => {
            let headers = new Headers();
            headers.append('pragma', 'no-cache');
            headers.append('X-Radiko-AuthToken', token);

            this.http.post('https://radiko.jp/v2/api/ts/playlist.m3u8?station_id=' + stationId + '&ft=' + program.ft + '&to=' + program.to, {}, {headers: headers}).subscribe(res => {
                let m3u8 = '';
                let lines = res.text().split(/\r\n|\r|\n/);
                for(let i=0 ; i< lines.length ; i++) {
                    if(lines[i].indexOf('http') != -1){
                        m3u8 = lines[i];
                        break;
                    }
                }

                if(m3u8 != ''){
                    /*var spawn = require('child_process').spawn;
                    var ffmpeg = spawn('ffmpeg', ['-i', m3u8, '-acodec', 'copy', program.title + '.aac']);
                    ffmpeg.on('exit', () => {
                        console.log('koko')
                    });
*/

                    let exec = require('child_process').execFile;

                    exec('ffmpeg', ['-i', m3u8, '-acodec', 'copy', program.title + '.aac'],
                        function(err:any, stdout:any, stderr:any){
                            console.log(err);
                            console.log(stdout);
                            console.log(stderr);
                        }
                    );


                }

                console.log(m3u8)
            });
        });
    };
}