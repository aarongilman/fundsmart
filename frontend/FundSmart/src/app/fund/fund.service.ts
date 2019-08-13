import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { portfolioDetails } from './portfolioDetails';
import { portfolioList } from './portfolioList';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { SortDirection } from '../sortable.directive';

interface SearchResult {
    portfoliolist: portfolioDetails[];
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

function sort(portfoliolist: portfolioDetails[], column: string, direction: string): portfolioDetails[] {
    if (direction === '') {
        return portfoliolist;
    } else {
        return [...portfoliolist].sort((a, b) => {
            const res = compare(a[column].toLowerCase(), b[column].toLowerCase());
            return direction === 'asc' ? res : -res;
        });
    }
}

function matches(portfolio: portfolioDetails, term: string) {
    return portfolio.name.toLowerCase().includes(term);
}

@Injectable({
    providedIn: 'root'
})

export class FundService {
    private _loading$ = new BehaviorSubject<boolean>(true);
    private _search$ = new Subject<void>();
    private _portfolio$ = new BehaviorSubject<portfolioDetails[]>([]);
    private _total$ = new BehaviorSubject<number>(0);

    private _state: State = {
        page: 1,
        pageSize: 10,
        searchTerm: '',
        sortColumn: '',
        sortDirection: ''
    };

    constructor() {
        this._search$.pipe(
            tap(() => this._loading$.next(true)),
            debounceTime(200),
            switchMap(() => this._search()),
            delay(200),
            tap(() => this._loading$.next(false))
        ).subscribe(result => {
            this._portfolio$.next(result.portfoliolist);
            this._total$.next(result.total);
        });
        this._search$.next();
    }

    resetHoldingDetails() {
        this._search$.pipe(
            tap(() => this._loading$.next(true)),
            debounceTime(200),
            switchMap(() => this._search()),
            delay(200),
            tap(() => this._loading$.next(false))
        ).toPromise().then(result => {
            this._portfolio$.next(result.portfoliolist);
            this._total$.next(result.total);
        });
        this._search$.next();
    }

    get hlist$() { return this._portfolio$.asObservable(); }
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
        //1.sort
        let portfoliolist = sort(portfolioList, sortColumn, sortDirection);
        //2. Filter
        portfoliolist = portfoliolist.filter(holding => matches(holding, searchTerm.toLowerCase()));
        const total = portfoliolist.length;

        return of({ portfoliolist, total });
    }

}
