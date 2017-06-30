import {Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {IStation, IRegion} from '../interfaces/station.interface';
import {RadikoService} from '../services/radiko.service';
import { parseString } from 'xml2js';
import {IProgram} from '../interfaces/program.interface';
import {ConfigService} from '../services/config.service';
import {IConfig} from '../interfaces/config.interface';

@Component({
    selector: 'ProgramList',
    template: `
        <table class="table is-striped is-narrow">
            <tbody>
            <ng-container *ngFor="let day of programs">
                <tr *ngFor="let program of day">
                    <td class="datetime">{{program.ft.substr(4, 2) + '/' + program.ft.substr(6, 2) + ' ' + program.ft.substr(8, 2) + ':' + program.ft.substr(10, 2)}}</td>
                    <td class="datetime">{{program.to.substr(4, 2) + '/' + program.to.substr(6, 2) + ' ' + program.to.substr(8, 2) + ':' + program.to.substr(10, 2)}}</td>
                    <td>{{program.title}}</td>
                    <td><button class="button is-small" (click)="onClick(program)">保存</button></td>
                </tr>
            </ng-container>
            
            </tbody>
        </table>
    `
})
export class ProgramListComponent implements OnInit, OnDestroy, OnChanges{
    @Input()
    private station:IStation;

    @Output()
    private changeStatus:EventEmitter<boolean> = new EventEmitter<boolean>();

    private programs = []
    private loading = false;
    private selectedProgram:IProgram;
    private config:IConfig;

    private sub;
    ngOnInit() {
        this.sub = this.configService.config.subscribe(value =>{
            this.config = value;
        });

    }

    ngOnDestroy(){
        this.sub.unsubscribe();
    }

    ngOnChanges(changes: any) {
        if(changes.station){
            this.refreshProgramList();
        }
    }

    constructor(
        private radikoService: RadikoService,
        private configService: ConfigService
    ){}

    /**
     * 番組表更新
     */
    private refreshProgramList = () =>{
        this.radikoService.getPrograms(this.station.id).subscribe(res => {
            parseString(res.text(), (err, result) => {
                let programs = [];
                this.programs = [];

                let now = new Date();
                let date = parseInt(now.getFullYear() +  ('00' + (now.getMonth() + 1)).substr(-2, 2) + ('00' + now.getDate()).substr(-2, 2) + ('00' + now.getHours()).substr(-2, 2) + ('00' + now.getMinutes()).substr(-2, 2) + '00', 10);

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
                    }).filter(prog =>{
                        return parseInt(prog.to, 10) < date;
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
        if(!this.loading) {
            this.loading = true;
            this.changeStatus.emit(true);
            this.selectedProgram = program;

            let complete = false;


            let timer = setInterval(() =>{
                if(complete){
                    clearInterval(timer);
                    this.changeStatus.emit(false);
                }

            }, 1000);

            this.radikoService.getTimeFree(this.station.id, program, this.config.saveDir, () => {
                this.loading = false;

                complete = true;
            });
        }
    };

}
