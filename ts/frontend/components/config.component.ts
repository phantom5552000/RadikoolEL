import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {RadikoService} from '../services/radiko.service';
import {ConfigService} from '../services/config.service';
import {IConfig} from '../interfaces/config.interface';
import {Utility} from "../utility";

@Component({
    selector: 'Config',
    template: `
        <form (ngSubmit)="onSubmit()">
            <div class="message">
                <div class="message-header">
                    <p>radikoプレミアム</p>
                </div>
                <div class="message-body">
                    <button type="button" class="button" (click)="isOpenForm = true" *ngIf="!isLogin">ログイン</button>
                    <button type="button" class="button" (click)="isOpenForm = true" *ngIf="isLogin">ログアウト</button>
                    <button type="button" class="button" (click)="onClickCloseForm()" *ngIf="isOpenForm">閉じる</button>
                    <iframe src="http://radiko.jp/" style="width:100%; height: 300px;" *ngIf="isOpenForm && isLogin"></iframe>
                    <iframe src="https://radiko.jp/ap/member/login/login_page" style="width:100%; height: 300px;" *ngIf="isOpenForm && !isLogin"></iframe>
                </div>
            </div>
            <div class="message">
                <div class="message-header">
                    <p>一般設定</p>
                </div>
                <div class="message-body">
                    <div class="field">
                        <label class="label">保存パス</label>
                        <p class="control">
                            <input class="input" type="text" name="saveDir" [(ngModel)]="config.saveDir" placeholder="保存パス">
                        </p>
                    </div>
                </div>
            </div>
            <button type="submit" class="button is-primary">保存</button>
        </form>　
        
    `
})
export class ConfigComponent implements OnInit, OnDestroy {
    private config:IConfig = {};
    private loading = false;
    private isLogin = false;
    private isOpenForm = false;
    ngOnInit() {
        console.log(__dirname);
        this.configService.config.subscribe(value =>{
            this.config = Utility.copy<IConfig>(value);
        });
        this.radikoService.checkLogin().subscribe(res => {
            this.isLogin = true;
        }, res =>{
            this.isLogin = false;
        });
    }

    ngOnDestroy() {

    }

    constructor(private configService: ConfigService,
                private radikoService: RadikoService) {
    }


    /**
     * iframeを閉じる
     */
    private onClickCloseForm = () =>{
        this.radikoService.checkLogin().subscribe(res => {
            this.isLogin = true;
        }, res =>{
            this.isLogin = false;
        });

        this.isOpenForm = false;
    };

    /**
     * 設定保存
     */
    private onSubmit = () => {

        let save = Utility.copy<IConfig>(this.config);
        save.radikoEmail = Utility.encrypt(this.config.radikoEmail);
        save.radikoPassword = Utility.encrypt(this.config.radikoPassword);

        localStorage.setItem('config', JSON.stringify(save));

    };




}
