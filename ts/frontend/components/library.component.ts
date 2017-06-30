import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {ConfigService} from '../services/config.service';
import {IConfig} from '../interfaces/config.interface';
import {ILibrary} from "../interfaces/library.interface";


@Component({
    selector: 'Library',
    template: `
        <table class="table is-striped is-narrow">
            <tbody>
                <tr *ngFor="let file of files">
                    <td>{{file.name}}</td>
                    <td class="datetime">{{file.lastUpdate | date:'yyyy/MM/dd HH:mm:ss'}}</td>
                    <td class="has-text-right"><button class="button is-small" type="button" (click)="onClick(file)">再生</button></td>
                </tr>
            </tbody>
        </table>
        
    `
})
export class LibraryComponent implements OnInit, OnDestroy{

    @Output()
    private play:EventEmitter<ILibrary> = new EventEmitter<ILibrary>();

    private config:IConfig;
    private files: ILibrary[] = [];

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

    private refresh = () => {
        let klaw = require('klaw');
        let path = require('path');

        let kl = klaw(this.config.saveDir)
            .on('readable', () => {
                var item
                while ((item = kl.read())) {
                    if (!item.stats.isDirectory()) {
                        this.files.push({
                            name: path.basename(item.path),
                            lastUpdate: item.stats.mtime,
                            fullName: item.path
                        });
                    }
                }

            })
            .on('end', () => {
                this.files.sort((a, b) => {
                    if (a.lastUpdate > b.lastUpdate) {
                        return -1;
                    }
                    if (a.lastUpdate < b.lastUpdate) {
                        return 1;
                    }
                    return 0;
                })
            })

    };

    private onClick = (library:ILibrary) =>{
        this.play.emit(library);
    }
}
