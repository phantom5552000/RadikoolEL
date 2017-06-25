import {Http} from '@angular/http';
import {Injectable} from '@angular/core';

@Injectable()
export class RadikoService{
    constructor(private http: Http){

    }

    public getStations = () =>{
        return this.http.get('http://radiko.jp/v2/station/region/full.xml');
    };
}