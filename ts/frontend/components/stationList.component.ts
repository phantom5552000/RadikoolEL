import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {IStation, IRegion} from '../interfaces/station.interface';
import {RadikoService} from '../services/radiko.service';
import { parseString } from 'xml2js';

@Component({
    selector: 'StationList',
    template: `
        <div *ngFor="let region of regions" class="message">
            <div class="message-header">
                <p>{{region.regionName}}</p>
            </div>
            <div class="message-body">
                <ul>
                    <li *ngFor="let station of region.stations" >
                        <a (click)="onClickStation(station)" title="{{station.name}}"><img [src]="station.logo" /></a>
                    </li>
                </ul>
            </div>
        </div>
        
    `
})
export class StationListComponent implements OnInit, OnDestroy{
    private regions:IRegion[] = [];

    @Output()
    private selectStation:EventEmitter<IStation> = new EventEmitter<IStation>();

    ngOnInit() {
        this.radikoService.checkLogin().subscribe(res =>{
            this.radikoService.getStations().subscribe(res => {
                parseString(res.text(), (err, result) => {
                    this.regions = [];
                    result.region.stations.forEach(s1 => {
                        let region: IRegion = {regionId: s1.$.region_id, regionName: s1.$.region_name, stations: []};
                        s1.station.forEach(s2 => {
                            console.log(s2);
                            region.stations.push({
                                asciiName: s2.ascii_name[0],
                                href: s2.href[0],
                                id: s2.id[0],
                                logo: s2.logo[0]._,
                                name: s2.name[0],
                            });
                        });
                        this.regions.push(region);
                    });

                });
            });
        }, res => {
            this.radikoService.getAreaId().subscribe(areaId => {
                this.radikoService.getStations(areaId).subscribe(res => {
                    parseString(res.text(), (err, result) => {
                        this.regions = [];

                        console.log(result);
                        let region: IRegion = {
                            regionId: result.stations.$.area_id,
                            regionName: result.stations.$.area_name,
                            stations: []
                        };
                        result.stations.station.forEach(s => {
                                region.stations.push({
                                    asciiName: s.ascii_name[0],
                                    href: s.href[0],
                                    id: s.id[0],
                                    logo: s.logo[0]._,
                                    name: s.name[0],
                                });

                        });
                        this.regions.push(region);
                    });
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
