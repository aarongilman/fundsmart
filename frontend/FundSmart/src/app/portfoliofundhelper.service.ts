import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { portfolio_fund } from './portfolio_fund';
import { portfoliofundlist } from './portfolio_fundlist';
import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { SortDirection } from './sortable.directive';

interface SearchResult {
    fundlist: portfolio_fund[];
    total: number;
}

interface State {
    page: number;
    pageSize: number;
    searchTerm: string;
    sortColumn: string;
    sortDirection: SortDirection;
}

function compare(v1, v2) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

function sort(fundlist: portfolio_fund[], column: string, direction: string): portfolio_fund[] {
    if (direction === '') {
        return fundlist;
    } else {
        return [...fundlist].sort((a, b) => {
            let value = Number.parseInt(a[column]);
            if (value.toString() === 'NaN') {
                const res = compare(a[column], b[column]);
                return direction === 'asc' ? res : -res;
            } else {
                const res = compare(Number.parseInt(a[column]), Number.parseInt(b[column]));
                return direction === 'asc' ? res : -res;
            }
        });
    }
}

function matches(fund: portfolio_fund, term: string, pipe: PipeTransform) {
    return fund.security.toLowerCase().includes(term);
}

@Injectable({
    providedIn: 'root'
})
export class PortfoliofundhelperService {
    private _loading$ = new BehaviorSubject<boolean>(true);
    private _search$ = new Subject<void>();
    private _funds$ = new BehaviorSubject<portfolio_fund[]>([]);
    private _total$ = new BehaviorSubject<number>(0);

    private _state: State = {
        page: 1,
        pageSize: 10,
        searchTerm: '',
        sortColumn: '',
        sortDirection: ''
    };

    constructor(private pipe: DecimalPipe) {
        this._search$.pipe(
            tap(() => this._loading$.next(true)),
            debounceTime(200),
            switchMap(() => this._search()),
            delay(200),
            tap(() => this._loading$.next(false))
        ).subscribe(result => {
            this._funds$.next(result.fundlist);
            this._total$.next(result.total);
        });
        this._search$.next();
    }

    resetfunds() {
        this._search$.pipe(
            tap(() => this._loading$.next(true)),
            debounceTime(200),
            switchMap(() => this._search()),
            delay(200),
            tap(() => this._loading$.next(false))
        ).toPromise().then(result => {
            this._funds$.next(result.fundlist);
            this._total$.next(result.total);
        });
        this._search$.next();
    }

    get funds$() { return this._funds$.asObservable(); }
    get total$() { return this._total$; }
    get loading$() { return this._loading$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }

    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
    set sortColumn(sortColumn: string) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection }); }

    private _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        this._search$.next();
    }

    private _search(): Observable<SearchResult> {
        const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;
        let fundlist;
        // 1. sort
        fundlist = sort(portfoliofundlist, sortColumn, sortDirection);
        // //2. sortsecurity
        // fundlist = sortsecurity(portfoliofundlist, sortColumn, sortDirection);
        // 2. filter
        fundlist = fundlist.filter(fund => matches(fund, searchTerm, this.pipe));
        const total = fundlist.length;

        // 3. paginate
        fundlist = fundlist.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
        return of({ fundlist, total });
    }
}
