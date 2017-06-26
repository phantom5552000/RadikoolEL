import {Component, OnInit, OnDestroy, Input, OnChanges} from '@angular/core';
import {IStation, IRegion} from '../interfaces/station.interface';
import {RadikoService} from '../services/radiko.service';
import { parseString } from 'xml2js';
import {IProgram} from "../interfaces/program.interface";

@Component({
    selector: 'ProgramList',
    template: `
        <h3>番組一覧</h3>
        <div *ngFor="let day of programs">
            <ul style="border-bottom:1px solid #bbb">
                <li *ngFor="let program of day" (click)="onClick(program)">
                    {{program.ft}}{{program.title}}
                </li>
            </ul>
        </div>

    `
})
export class ProgramListComponent implements OnInit, OnDestroy, OnChanges{
    @Input()
    private station:IStation;

    private programs = []

    ngOnInit() {


    }

    ngOnDestroy(){

    }

    ngOnChanges(changes: any) {
        if(changes.station){
            this.refreshProgramList();
        }
    }

    constructor(private radikoService: RadikoService){}

    /**
     * 番組表更新
     */
    private refreshProgramList = () =>{
        this.radikoService.getPrograms(this.station.id).subscribe(res => {
            parseString(res.text(), (err, result) => {
                let programs = [];
                this.programs = [];
                result.radiko.stations[0].station[0].progs.forEach(progs => {

                    programs = progs.prog.map(prog => {
                        return {
                            ft: prog.$.ft,
                            to: prog.$.to,
                            img: prog.img[0],
                            info: prog.info[0],
                            pfm: prog.pfm[0],
                            title: prog.title[0],
                            tsInNg: prog.ts_in_ng[0],
                            tsOutNg: prog.ts_out_ng[0]
                        }
                    });
                    this.programs.push(programs)
                });
            });
        });
    };


    /**
     * タイムフリーダウンロード
     * @param program
     */
    private onClick = (program: IProgram) =>{
        this.radikoService.getTimeFree(this.station.id, program, () =>{

        });
    };

}
