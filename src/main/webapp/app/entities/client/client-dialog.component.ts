import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Client } from './client.model';
import { ClientPopupService } from './client-popup.service';
import { ClientService } from './client.service';

import { DatePipe } from '@angular/common';

@Component({
    selector: 'jhi-client-dialog',
    templateUrl: './client-dialog.component.html'
})
export class ClientDialogComponent implements OnInit {

    client: Client;
    isSaving: boolean;
    currentDate: any;

    constructor(
        public activeModal: NgbActiveModal,
        private clientService: ClientService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {

        const pipeCurrent = new DatePipe('es-CL');
        const nowCurrent = Date.now();
        this.currentDate = pipeCurrent.transform(nowCurrent, 'longDate');

        this.isSaving = false;

        if (this.client.id !== undefined) {
            const pipe = new DatePipe('es-CL');
            const myFormattedDate = pipe.transform(this.client.createDate, 'yyyy-MM-dd');
            this.client.createDate = myFormattedDate;
        } else {
            const pipe = new DatePipe('es-CL');
            const now = Date.now();
            const myFormattedDate = pipe.transform(now, 'yyyy-MM-dd');
            this.client.createDate = myFormattedDate;
        }
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.client.id !== undefined) {
            this.client.createDate += ' 00:00:00';

            this.subscribeToSaveResponse(
                this.clientService.update(this.client));
        } else {
          this.client.active = 1;

          const pipe = new DatePipe('es-CL');
          const now = Date.now();
          const myFormattedDate = pipe.transform(now, 'yyyy-MM-dd 00:00:00');
          this.client.createDate = myFormattedDate;

            this.subscribeToSaveResponse(
                this.clientService.create(this.client));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<Client>>) {
        result.subscribe((res: HttpResponse<Client>) =>
            this.onSaveSuccess(res.body), (res: HttpErrorResponse) => this.onSaveError());
    }

    private onSaveSuccess(result: Client) {
        this.eventManager.broadcast({ name: 'clientListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }
}

@Component({
    selector: 'jhi-client-popup',
    template: ''
})
export class ClientPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private clientPopupService: ClientPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.clientPopupService
                    .open(ClientDialogComponent as Component, params['id']);
            } else {
                this.clientPopupService
                    .open(ClientDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
