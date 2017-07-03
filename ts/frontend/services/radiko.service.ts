import {Http, Headers, ResponseContentType} from '@angular/http';
import {Injectable} from '@angular/core';
import 'rxjs';
import {IProgram} from '../interfaces/program.interface';
import {Observable} from 'rxjs/Observable';
import * as Path from "path";
import {Utility} from "../utility";

let app = require('electron').remote.app;
const libDir = Path.join(app.getAppPath(), 'libs');

@Injectable()
export class RadikoService{
    constructor(
        private http: Http){

        var fs = require('fs-extra');
        if (!fs.existsSync('tmp')){
            fs.mkdirsSync('tmp');
        }

    }

    /**
     * 放送局取得
     * @returns {Observable<Response>}
     */
    public getStations = (areaId?:string) =>{
        if(areaId){
            return this.http.get('http://radiko.jp/v3/station/list/' + areaId + '.xml');
        } else {
            return this.http.get('http://radiko.jp/v3/station/region/full.xml');
        }
    };

    /**
     * 番組データ取得
     * @param id
     */
    public getPrograms = (id: string) =>{
        return this.http.get('http://radiko.jp/v3/program/station/weekly/' + id + '.xml');
    };


    /**
     * radikoプレミアムログインチェック
     * @returns {Observable<Response>}
     */
    public checkLogin = () =>{
        return this.http.get('https://radiko.jp/ap/member/webapi/member/login/check');
    };

    /**
     * 都道府県取得
     * @returns {Observable<Response>}
     */
    public getAreaId = () =>{
        return this.http.get('http://radiko.jp/area/').map(res =>{
           return (res.text().match(/JP[0-9]+/gi))[0];
        });
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
                    var ws = fs.createWriteStream('tmp/player.swf');
                    res.pipe(ws);
                    res.on('end', () => {

                        //  ws.close();
                        var spawn = require('child_process').spawn;
                        var swfextract = spawn(Path.join('libs', 'swfextract'), ['-b', '12', 'tmp/player.swf', '-o', 'tmp/image.png']);

                //        var swfextract = spawn(Path.join(libDir, 'win32', 'swfextract'), ['-b', '12', 'tmp/player.swf', '-o', 'tmp/image.png']);
                        swfextract.on('exit', () => {
                            fs.open('tmp/image.png', 'r', (err, fd) => {

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
    public getTimeFree = (stationId: string, program:IProgram, saveDir:string, progress, callback) => {
        this.getToken((token) => {
            let headers = new Headers();
            headers.append('pragma', 'no-cache');
            headers.append('X-Radiko-AuthToken', token);

            let filename = program.title + '.aac';
            let path = require('path');
            filename = path.join(saveDir, stationId, program.ft.substr(0, 8), filename);

            var fs = require('fs-extra');
            var dir = path.dirname(filename);
            if (!fs.existsSync(dir)){
                fs.mkdirsSync(dir);
            }

            console.log(filename);
            let duration = Utility.getDuration(program.ft, program.to);
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
                    if(saveDir) {
                        var spawn = require('child_process').spawn;
                        var ffmpeg = spawn(Path.join('libs', 'ffmpeg'), ['-i', m3u8, '-acodec', 'copy', filename]);
                       // var ffmpeg = spawn(Path.join(libDir, 'win32', 'ffmpeg'), ['-i', m3u8, '-acodec', 'copy', filename]);
                        let duration = Utility.getDuration(program.ft, program.to);
                        ffmpeg.stdout.on('data', (data) => {
                            console.log('stdout: ' + data.toString());
                        });
                        ffmpeg.stderr.on('data', (data) => {
                       //     size=   71715kB time=03:24:00.08 bitrate=  48.0kbits/s speed= 132x
                            let mes = data.toString();
                            if(mes.indexOf('size') != -1){

                                let m = mes.match(/time=([0-9:.]+)/);
                                if(m[1]){
                                    console.log(m[1]);
                                    let sec = parseInt(m[1].split(':')[0], 10) * 3600 + parseInt(m[1].split(':')[1], 10) * 60 + parseInt(m[1].split(':')[2], 10);

                                    progress(Math.round((sec / duration) * 100));
                                }


                             //   progress(mes);
                            }
                        });
                         ffmpeg.on('exit', () => {
                             callback();
                         });


/*
                        let exec = require('child_process').execFile;

                        exec('libs/ffmpeg', ['-i', m3u8, '-acodec', 'copy', filename],
                            (err: any, stdout: any, stderr: any) => {
                                console.log(err);
                                console.log(stdout);
                                console.log(stderr);

                                callback();
                            }
                        );*/
                    } else {
                        callback(m3u8);
                    }


                }

                console.log(m3u8)
            });
        });
    };
}