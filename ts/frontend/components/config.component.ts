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
                <iframe src="https://radiko.jp/ap/member/login/login_page" style="width:100%; height: 300px;"></iframe>
                <div class="message-body">
                    <div class="field">
                        <label class="label">メールアドレス</label>
                        <p class="control">
                            <input class="input" name="radikoEmail" [(ngModel)]="config.radikoEmail" type="text" placeholder="メールアドレス">
                        </p>
                    </div>
                    <div class="field">
                        <label class="label">パスワード</label>
                        <p class="control">
                            <input class="input" name="radikoPassword" [(ngModel)]="config.radikoPassword" type="password" placeholder="パスワード">
                        </p>
                    </div>
                    <button type="button" class="button" (click)="onClickRadikoLogin()" [class.is-loading]="loading">ログインテスト</button>
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

    ngOnInit() {
        this.configService.config.subscribe(value =>{
            this.config = Utility.copy<IConfig>(value);
            console.log(this.config);

        });
    }

    ngOnDestroy() {

    }

    constructor(private configService: ConfigService,
                private radikoService: RadikoService) {
    }


    /**
     * radikoプレミアムログインテスト
     */
    private onClickRadikoLogin = () =>{
        if(!this.loading) {
            this.loading = true;

            this.radikoService.login(this.config.radikoEmail, this.config.radikoPassword, res =>{
               console.log(res);
               this.loading = false;
            });
        }
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
