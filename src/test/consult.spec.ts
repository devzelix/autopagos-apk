import { ConsultasService } from '../app/services/consultas.service';
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs';
import { BanksDays } from '../app/interfaces/banksDays';

let service: ConsultasService;
let httpSpy: jasmine.SpyObj<HttpClient>;

describe('Consult banks service', () => {
    beforeAll(() => {
        httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
        service = new ConsultasService(httpSpy);
    });
    it('#getDaysFeriados should return a list of banks days', () => {
        const banksDays: BanksDays[] = [
            {
                id: 1,
                mes: 'enero',
                tipo: 'nacional',
                description: 'Año nuevo',
                dia: '01',
                ano: '2022',
                fecha: '2022-01-01T04:00:00.000Z',
                diasemana: 'Sábado'
            }
        ];
        httpSpy.get.and.returnValue(of(banksDays));
        service.getDaysFeriados().subscribe((data) => {
            expect(data).toBe(banksDays);
        })
    });
})
