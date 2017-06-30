import {Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {IStation, IRegion} from '../interfaces/station.interface';
import {RadikoService} from '../services/radiko.service';
import { parseString } from 'xml2js';
import {IProgram} from '../interfaces/program.interface';
import {ConfigService} from '../services/config.service';
import {IConfig} from '../interfaces/config.interface';
import {ILibrary} from '../interfaces/library.interface';
import {StateService} from '../services/state.service';

@Component({
    selector: 'ProgramList',
    template: `
        <div style="display:flex; flex-direction: column; height: 100%">
            <div style="height: 100px; margin: 0 0 20px 0; flex-grow:1; overflow: auto">
                <table class="table is-striped is-narrow">
                    <tbody>
                    <ng-container *ngFor="let day of programs">
                        <tr *ngFor="let program of day" (click)="onClickProgram(program)" [class.is-selected]="selectedProgram == program">
                            <td class="datetime">{{program.ft.substr(4, 2) + '/' + program.ft.substr(6, 2) + ' ' + program.ft.substr(8, 2) + ':' + program.ft.substr(10, 2)}}</td>
                            <td class="datetime">{{program.to.substr(4, 2) + '/' + program.to.substr(6, 2) + ' ' + program.to.substr(8, 2) + ':' + program.to.substr(10, 2)}}</td>
                            <td>{{program.title}}</td>
                        </tr>
                    </ng-container>

                    </tbody>
                </table>
            </div>
            <div class="box program-data" *ngIf="selectedProgram">
                <p style="padding:0 0 10px 0">
                    {{selectedProgram.ft.substr(4, 2) + '/' + selectedProgram.ft.substr(6, 2) + ' ' + selectedProgram.ft.substr(8, 2) + ':' + selectedProgram.ft.substr(10, 2)}}〜{{selectedProgram.to.substr(4, 2) + '/' + selectedProgram.to.substr(6, 2) + ' ' + selectedProgram.to.substr(8, 2) + ':' + selectedProgram.to.substr(10, 2)}}<br />
                    <span *ngIf="selectedProgram.title">{{selectedProgram.title}}</span>
                    <span *ngIf="selectedProgram.pfm">{{selectedProgram.pfm}}</span>
                </p>
                <button type="button" class="button is-info" (click)="onClickDownload(program)">
                    <span class="icon">
                        <i class="fa fa-floppy-o" aria-hidden="true"></i>
                    </span>
                    <span>保存</span>
                </button>
            </div>
        </div>
        
        
    `
})
export class ProgramListComponent implements OnInit, OnDestroy, OnChanges{
    @Input()
    private station:IStation;

    @Output()
    private changeStatus:EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    private play:EventEmitter<ILibrary> = new EventEmitter<ILibrary>();

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
        private stateService: StateService,
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
     * 番組選択
     * @param p
     */
    private onClickProgram = (p) =>{
        this.selectedProgram = p;
    };


    /**
     * タイムフリーダウンロード
     */
    private onClickDownload = () =>{
        if(!this.loading) {
            this.loading = true;

            this.stateService.isDownloading.next(true);

          //  this.changeStatus.emit(true);

            let complete = false;
            let downloadProgress = '';

            let timer = setInterval(() =>{
                if(complete){
                    clearInterval(timer);
                    this.stateService.isDownloading.next(false);
                }
                console.log(downloadProgress);
                this.stateService.downloadProgress.next(downloadProgress);

            }, 1000);

            this.radikoService.getTimeFree(this.station.id, this.selectedProgram, this.config.saveDir, (mes) => {
                    downloadProgress = mes;

                }, () => {
                    this.loading = false;

                    complete = true;
                }
            );
        }
    };

}
