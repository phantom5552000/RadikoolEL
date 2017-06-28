import { Component } from '@angular/core';
import {IStation} from './interfaces/station.interface';

@Component({
    selector: 'App',
    template: `
        <nav class="nav has-shadow">
            <div class="container">
                <div class="nav-menu nav-left">
                    <a class="nav-item is-tab" [class.is-active]="tool == 'info'" (click)="tool = 'info'">おしらせ</a>
                    <a class="nav-item is-tab" [class.is-active]="tool == 'programs'" (click)="tool = 'programs'">番組表</a>
                    <a class="nav-item is-tab" [class.is-active]="tool == 'library'" (click)="tool = 'library'">ライブラリ</a>
                </div>
                <div class="nav-menu nav-right">
                    <a class="nav-item is-tab" [class.is-active]="tool == 'config'" (click)="tool = 'config'">設定</a>
                </div>
            </div>
        </nav>
        
        <div class="container" style="padding-top: 30px">
           <!-- <iframe src="https://www.radikool.com/start" [hidden]="tool != 'info'"></iframe>-->
            <div class="columns" *ngIf="tool == 'programs'">
                <div class="column is-3">
                    <StationList (selectStation)="onSelectStation($event)"></StationList>
                </div>
                <div class="column">
                    <ProgramList [station]="station" *ngIf="station" (changeStatus)="onChangeStatus($event)"></ProgramList>
                </div>
            </div>
            <Library [hidden]="tool != 'library'"></Library>
            
            <Config *ngIf="tool == 'config'"></Config>
            
        </div>
        <div class="modal" [class.is-active]="loading">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">ダウンロード中です</p>
                </header>
                <section class="modal-card-body">
                    ダウンロード中です
                </section>
                <footer class="modal-card-foot">
                    <a class="button is-success">Save changes</a>
                    <a class="button">Cancel</a>
                </footer>
            </div>
        </div>
        
    `
})
export class AppComponent {
    private station:IStation;
    private tool:string = 'info';
    private loading:boolean = false;

    private onSelectStation = (station:IStation) =>{
        this.station = station;
    };

    private onChangeStatus = (loading: boolean) =>{
        this.loading = loading;
    };
}
