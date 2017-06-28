import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {ConfigService} from '../services/config.service';
import {IConfig} from '../interfaces/config.interface';
import {ILibrary} from "../interfaces/library.interface";


@Component({
    selector: 'Library',
    template: `
        <audio [src]="selectedFile.fullName" *ngIf="selectedFile" controls autoplay></audio>
        <table class="table">
            <tbody>
                <tr *ngFor="let file of files">
                    <td>
                        <p>
                            {{file.name}}<br />
                            更新日時:{{file.lastUpdate | date:'yyyy/MM/dd HH:mm:ss'}}
                        </p>
                    </td>
                    <td><button class="button" type="button" (click)="selectedFile = file">再生</button></td>
                </tr>
            </tbody>
        </table>
        
    `
})
export class LibraryComponent implements OnInit, OnDestroy{

    private config:IConfig;
    private files: ILibrary[] = [];
    private selectedFile:ILibrary;
    private sub;
    ngOnInit() {
        this.configService.config.subscribe(value =>{
            this.config = value;
            this.refresh();
        });

    }

    ngOnDestroy(){

    }

    constructor(private configService: ConfigService){}

    private refresh = () =>{
        let klaw = require('klaw');
        let path = require('path');

        let kl = klaw(this.config.saveDir)
            .on('readable', () => {
                var item
                while ((item = kl.read())) {
                    if(!item.stats.isDirectory()) {
                        console.log(item.stats);
                        this.files.push({
                            name: path.basename(item.path),
                            lastUpdate: item.stats.mtime,
                            fullName: item.path
                        });
                    }
                }

            })
            .on('end', () => {
                this.files.sort((a, b) =>{
                    if(a.lastUpdate > b.lastUpdate){
                        return -1;
                    }
                    if(a.lastUpdate < b.lastUpdate){
                        return 1;
                    }
                    return 0;
                })
                console.log(this.files) // => [ ... array of files]
            })

     //   console.log(rs);
    };
}
