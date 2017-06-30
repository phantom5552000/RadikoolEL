import { Component } from '@angular/core';
import {IStation} from './interfaces/station.interface';
import {ILibrary} from "./interfaces/library.interface";

@Component({
    selector: 'App',
    template: `
        <div id="main">
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
            <div id="content">
                <!--<iframe src="https://www.radikool.com/start" [hidden]="tool != 'info'"></iframe>-->
                <ng-container *ngIf="tool == 'programs'">
                    <div style="width: 25%">
                        <StationList (selectStation)="onSelectStation($event)"></StationList>
                    </div>
                    <div style="width: 75%">
                        <ProgramList [station]="station" *ngIf="station" (changeStatus)="onChangeStatus($event)"></ProgramList>
                    </div>
                </ng-container>
                <div [hidden]="tool != 'library'" style="width: 100%">
                    <Library (play)="onPlay($event)"></Library>
                </div>
                <div *ngIf="tool == 'config'" style="width: 100%">
                    <Config></Config>
                </div>
            </div>
            <Player [file]="playingFile"></Player>
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
        </div>
        
    `
})
export class AppComponent {
    private station:IStation;
    private tool:string = 'info';
    private loading:boolean = false;

    private playingFile:ILibrary;

    private onSelectStation = (station:IStation) =>{
        this.station = station;
    };

    private onChangeStatus = (loading: boolean) =>{
        this.loading = loading;
    };

    private onPlay = (library:ILibrary) =>{
        this.playingFile = library;
    };
}
