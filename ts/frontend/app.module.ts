import { BrowserModule        } from '@angular/platform-browser';
import { NgModule             } from '@angular/core';
import { FormsModule          } from '@angular/forms';
import { HttpModule           } from '@angular/http';

import { AppComponent         } from './app.component';
import { AppRoutingModule     } from './app.routing.module';
import { StationListComponent } from './components/stationList.component';
import { RadikoService        } from './services/radiko.service';
import { ProgramListComponent } from './components/programList.component';
import { ConfigComponent      } from './components/config.component';
import { ConfigService        } from './services/config.service';


@NgModule({
    declarations: [
        AppComponent,
        StationListComponent,
        ProgramListComponent,
        ConfigComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule
    ],
    providers: [
        RadikoService,
        ConfigService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
