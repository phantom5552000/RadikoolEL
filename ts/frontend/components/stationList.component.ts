import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {IStation, IRegion} from '../interfaces/station.interface';
import {RadikoService} from '../services/radiko.service';
import { parseString } from 'xml2js';

@Component({
    selector: 'StationList',
    template: `
        <h3>放送局一覧</h3>
        <div *ngFor="let region of regions">
            <h4>{{region.regionName}}</h4>
            <ul >
                <li *ngFor="let station of region.stations" (click)="onClickStation(station)">
                    <img [src]="station.logoMedium" />
                </li>
            </ul>
        </div>
        
    `
})
export class StationListComponent implements OnInit, OnDestroy{
    private regions:IRegion[] = [];
    private programs = {};

    @Output()
    private selectStation:EventEmitter<IStation> = new EventEmitter<IStation>();

    ngOnInit() {

        this.radikoService.getStations().subscribe(res => {
            //let parseString = require('xml2js').parseString;

            parseString(res.text(), (err, result) => {
                this.regions = [];
                result.region.stations.forEach(s1 => {
                    let region: IRegion = { regionId: s1.$.region_id, regionName: s1.$.region_name, stations: []};
                    s1.station.forEach(s2 => {
                        region.stations.push({
                            asciiName: s2.ascii_name[0],
                            href: s2.href[0],
                            id: s2.id[0],
                            logoLarge: s2.logo_large[0],
                            logoMedium: s2.logo_medium[0],
                            logoSmall: s2.logo_small[0],
                            logoXsmall: s2.logo_small[0],
                            name: s2.name[0],
                        });
                    });
                    this.regions.push(region);
                });

            });
        });
    }

    ngOnDestroy(){

    }

    constructor(private radikoService: RadikoService){}

    private onClickStation = (station:IStation) => {
        this.selectStation.emit(station);
    };
}
